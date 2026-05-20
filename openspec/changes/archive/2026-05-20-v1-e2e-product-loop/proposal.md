## Why

The V1 stack (Next.js, Fastify, Playwright+CDP, BullMQ, Postgres, Redis, Qdrant) is implemented and the capture → ingest → timeline → embed **write** path works. What remains missing are the **human-facing and outcome hooks** that make the product demonstrable per `docs/Proposl_v1.md`: users cannot see or drive the remote browser, workflows are never generated from captured actions, replay is queued but not executed, similarity memory is write-only, and there is no one-command Docker Compose stack.

Without these hooks, the repo matches the proposal on paper but fails the V1 success metric: *teach once through UI, replay through UI or API*.

**Success metric:** With `docker compose up` (or documented equivalent), a user can (1) open a session, interact via **live noVNC**, (2) record a simple CRUD form flow, (3) see an **extracted workflow** with both `ui_replay` and `api_equivalent`, (4) **replay** that workflow in UI or API mode, and (5) **search** similar past interactions — without mock data.

## What Changes

- Add **noVNC streaming** in `browser-worker` (Chromium display + websockify) and expose a per-session stream URL on the session API.
- Mount **live noVNC** in `apps/frontend` `BrowserPane` (replace placeholder).
- Implement **workflow extraction**: on stop-recording (or explicit trigger), build `workflows` + `workflow_steps` from correlated actions/network events with dual-path artifacts.
- Implement **replay execution**: Playwright fill/click for `ui` mode; HTTP client for `api` mode using stored `api_equivalent`.
- Add **interaction similarity search** read API on backend (Qdrant `interaction_memory`) and optional minimal UI entry point.
- Ship **Docker Compose V1 stack** (`docker/compose/stack/docker-compose.yml`) with all seven services, volumes, `shm_size: 2gb` on browser-worker, and `.env.example`.
- Add **frontend Dockerfile** and wire compose build contexts.
- Add root **dev/smoke script** documenting the full E2E path (closes frontend-integration task 6.2 gap).

## What This Is NOT

- AI browser agent or autonomous execution
- LLM-powered intent extraction (rule-based + vector search only)
- Multi-user auth or enterprise permissions (local single-user remains fine)
- Browser extension capture path
- Cloud object storage
- DOM mutation diff perfection (basic before/after or defer if blocking)
- `@xenova/transformers` embedding provider (Ollama remains default)

## Capabilities

### New Capabilities

- `novnc-browser-stream`: Chromium display pipeline in browser-worker, websockify/noVNC sidecar, session `vncUrl` (or equivalent) reported to backend and frontend.
- `workflow-extraction`: Deterministic builder that creates `workflows` and `workflow_steps` from session actions (ordered, with `api_equivalent` and UI step metadata).
- `interaction-similarity-search`: Backend endpoint to query Qdrant `interaction_memory` by text or vector; returns ranked past interactions with Postgres hydration.
- `docker-compose-v1-stack`: Full Compose project, env template, frontend image, documented `docker compose up` smoke path.

### Modified Capabilities

- `backend-session-api`: Session response includes optional `vncUrl` when browser runtime is active.
- `browser-session-runtime`: Launch job starts VNC stack and PATCHes runtime metadata including stream URL.
- `session-workspace-ui`: Browser pane mounts noVNC client when `vncUrl` is present (no placeholder in integrated mode).
- `browser-replay-consumer`: Executes fill/click replay steps; implements `api` mode via direct HTTP from `api_equivalent`.
- `backend-replay-api`: Clarify acceptance semantics for UI vs API replay modes (202 + job, optional completion status if added).
- `backend-workflows-api`: Optional `POST /sessions/:id/workflows/extract` or automatic extraction on stop-recording (design decides).
- `replay-panel-ui`: Surface replay mode outcomes (queued, completed, failed) when backend/worker report status.

## Impact

| Area | Effect |
|------|--------|
| `apps/browser-worker` | VNC stack, replay-runner implementation, possibly headed Chromium |
| `apps/backend` | Session schema, workflow extraction service/job, similarity search route, replay status optional |
| `apps/frontend` | noVNC dependency, `BrowserPane`, workflow empty states, search UI hook |
| `packages/shared` | `vncUrl`, workflow extraction job payload, search request/response schemas |
| `docker/compose/stack` | New `docker-compose.yml`, `.env.example` |
| `docker/standalone/frontend` | New Dockerfile |
| `infra/postgres` | Possible migration for `ui_replay` JSONB on workflow_steps if not already covered |
| `scripts/` | E2E smoke helper |

## Data Flow (target end-to-end)

```
User → Frontend (noVNC + timeline)
         │ POST /sessions
         ▼
       Backend → BullMQ launch → browser-worker (Playwright + VNC)
         │                              │
         │ vncUrl ◄─────────────────────┘
         │ capture → ingest → Postgres
         │ stop recording → extract workflow → workflows table
         │ embed job → Qdrant
         ▼
       GET /search/interactions (Qdrant + Postgres)
       POST /workflows/:id/replay (ui | api) → browser-worker replay
```
