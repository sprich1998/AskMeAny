## Context

TeachMeAny V1 has a working **capture spine**: frontend → Fastify → BullMQ → browser-worker (Playwright + CDP) → ingest → Postgres → Redis timeline → embedding-worker → Qdrant. What blocks a credible demo is everything *around* that spine:

- Users cannot see or click the remote browser (noVNC placeholder only).
- `workflows` / `workflow_steps` are read-only; nothing populates them after recording.
- Replay jobs log and exit; `replay-runner` does not drive the page or call APIs.
- Qdrant is write-only; no similarity read path.
- `docker/compose/stack/` documents a stack but has no `docker-compose.yml`.

This change closes those hooks in dependency order so `docs/Proposl_v1.md` §12 success metrics become testable locally.

## Goals / Non-Goals

**Goals:**

1. Live **noVNC** in the session workspace when a browser session is `active` or `recording`.
2. **Workflow extraction** after recording stops: ordered steps with `api_equivalent` per step and UI replay metadata (via `action_id` join or stored JSONB).
3. **Replay execution** for `ui` (Playwright fill/click) and `api` (HTTP from `api_equivalent`).
4. **Similarity search** API over `interaction_memory` with Postgres hydration.
5. **One-command local stack** via Docker Compose matching proposal §11.
6. Documented **smoke test** from repo root.

**Non-Goals:**

- LLM intent extraction, auth, browser extension, cloud storage.
- Perfect DOM mutation diff (remain optional/null if costly).
- Replay completion WebSocket channel (log + job success/fail is enough for V1).
- `@xenova/transformers` provider (keep Ollama).

## Decisions

### 1. noVNC inside `browser-worker` image (not separate service)

**Choice:** Run Xvfb + x11vnc + websockify in the same container as Playwright, with Chromium launched **headed** on the virtual display.

**Rationale:** Matches proposal diagram (Chromium → noVNC → FE). One fewer compose service; session affinity is natural.

**Alternatives considered:**

- Sidecar container per session — more complex orchestration.
- CDP screencast only — no user pointer input without extra work.

**URL shape:** Worker PATCHes backend with `vncUrl` (WebSocket URL reachable from the **browser**, not from inside Docker network only). Compose exposes browser-worker port e.g. `6080` and sets `VNC_PUBLIC_HOST=localhost` in `.env.example`.

### 2. Session API carries `vncUrl`

**Choice:** Add optional `vncUrl: string | null` to `SessionResponseSchema` in `@teachmeany/shared`. Populated when runtime is active; `null` when `created` or `stopped`.

**Rationale:** Frontend already polls `getSession`; no new endpoint required.

### 3. Workflow extraction on stop-recording (synchronous in backend)

**Choice:** When `POST /sessions/:id/recording/stop` succeeds, backend runs a deterministic **WorkflowExtractor** (same process, before HTTP response) that:

1. Loads session `actions` ordered by `timestamp` with correlated `network_events` and `intents`.
2. Creates one workflow per stop event named e.g. `Session workflow` (V1: single workflow per recording segment).
3. Inserts `workflow_steps` with `step_type` from action type, `api_equivalent` from network event, `action_id` FK.

**Rationale:** Keeps intelligence async for embeddings but workflow build is rule-based and fast. UI sees workflows immediately after stop.

**Alternatives considered:**

- BullMQ `extract-workflow` job — better for huge sessions; defer unless stop latency > 2s in smoke test.
- Manual `POST .../workflows/extract` only — worse DX.

**UI replay metadata:** No new column initially. Replay loads `actions.selector`, `actions.value` via `workflow_steps.action_id`. Add `ui_replay` JSONB migration only if join proves awkward.

### 4. Replay: UI mode in browser-worker, API mode in browser-worker

**Choice:** Extend `replay-runner.ts`:

- **ui:** For each step, `fill` or `click` using stored selector; `waitForTimeout` or `waitForResponse` after clicks that have `api_equivalent`.
- **api:** For each step with non-null `api_equivalent`, `fetch(method, url, body)` using session cookie jar or absolute URL from captured network event.

**Rationale:** Worker already holds the Playwright page and network context.

### 5. Similarity search on backend

**Choice:** `POST /interactions/search` with `{ query: string, limit?: number }`. Backend embeds query via Ollama (same env as embedding-worker) OR accepts precomputed vector in dev; searches Qdrant; hydrates hits from Postgres `actions` + `network_events` + `intents`.

**Rationale:** Frontend must not talk to Qdrant directly. Reuse embedding model config via shared env vars.

**V1 UI:** Optional small panel on workflow or launcher — list top 3 matches. API is required; UI can be minimal.

### 6. Docker Compose layout

**Choice:** `docker/compose/stack/docker-compose.yml` with services: `frontend`, `backend`, `browser-worker`, `embedding-worker`, `postgres`, `redis`, `qdrant`, optional `ollama` profile.

**Ports:** 3000, 4000, 6080 (VNC), 5432, 6379, 6333, 11434.

**browser-worker:** `shm_size: "2gb"`, publish `6080:6080`.

**Frontend Dockerfile:** Multi-stage Next.js standalone output.

**Migrations:** Backend `migrate` on startup (existing pattern).

### 7. Implementation phasing (for tasks.md)

```
Phase 1: Compose + env (unblocks everyone)
Phase 2: noVNC + session vncUrl + frontend pane
Phase 3: Workflow extraction on stop
Phase 4: Replay ui + api
Phase 5: Interaction search API + minimal UI
Phase 6: Smoke script + README
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| VNC URL wrong inside Docker (localhost vs service name) | `VNC_PUBLIC_HOST` / `NEXT_PUBLIC_VNC_HOST` env; document in compose `.env.example` |
| Headed Chromium heavier than headless | Accept for V1; `shm_size: 2gb` |
| Workflow extraction slow on large sessions | Cap steps (e.g. 200); async job later |
| API replay CORS/auth cookies missing | Replay uses absolute URL + stored headers from `network_events.request_headers` when present |
| Ollama not running in compose | `ollama` profile + README fallback; search returns 503 with clear error |
| noVNC + Playwright focus conflicts | Use single display; test on CRUD fixture |

## Migration Plan

1. Ship compose + env first — existing local dev unaffected.
2. Add `vncUrl` to API (optional field — backward compatible).
3. Deploy browser-worker image with VNC; restart worker.
4. Enable extraction on stop — existing sessions without workflows unchanged.
5. No Qdrant schema change; search is read-only new route.

**Rollback:** Disable extraction hook via env `WORKFLOW_EXTRACT_ON_STOP=false`; revert to headless worker image if VNC unstable.

## Open Questions

- **Per-session VNC port vs shared 6080:** V1 uses one worker process one session — single port OK. Multi-session later needs dynamic ports.
- **Ollama in compose default or optional profile:** Default optional profile to keep compose fast on laptops without GPU.
- **Replay result to frontend:** V1 keeps HTTP 202 accepted; improve with `GET /replays/:id` later if needed.
