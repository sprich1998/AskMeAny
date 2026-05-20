## Context

The `v1-e2e-product-loop` change wired noVNC in browser-worker (Xvfb + x11vnc + websockify on `:6080`), added `vncUrl` to the backend session model, and introduced `VncViewer` + `BrowserPane` in the frontend. Manual verification shows:

- `GET /sessions/:id` returns `vncUrl: "ws://localhost:6080"` and `status: "active"` for fresh sessions.
- `http://localhost:6080/vnc.html` displays the target site correctly.
- The session workspace still renders **"Remote browser stream is not available"**.

Root causes identified:

1. **Stale frontend Docker image** — production bundle's inlined `SessionResponseSchema` omits `vncUrl`, so Zod strips the field before `mapSession`.
2. **Broken noVNC client bundle** — `VncViewer` production output is an empty `<div>`; `@novnc/novnc` dynamic import fails or is tree-shaken (topLevelAwait warnings during build).
3. **Orphan sessions** — worker restart clears `vncUrl` but leaves `status: active`, triggering the "not available" branch for old sessions.

Constraints: local Docker Compose, single shared VNC port, no auth on VNC, TypeScript strict, shared Zod schemas in `@teachmeany/shared`.

## Goals / Non-Goals

**Goals:**

- New sessions show live remote browser inside `/session/[id]` browser pane.
- `vncUrl` flows end-to-end: API → Zod → mapper → React props.
- Clear UX for bootstrap (`created`), connected (`active` + stream), and failure (timeout or `error`).
- Docker Compose rebuild produces a working frontend without manual workarounds.

**Non-Goals:**

- Per-session VNC port allocation.
- Fixing workflow extraction, replay, or vector search (separate change).
- noVNC customization (scaling, clipboard sync, mobile).
- Removing the standalone `vnc.html` tab (it remains a valid debug path).

## Decisions

### 1. Embed strategy: iframe to `vnc.html` (preferred) over React RFB client

**Choice:** Use an `<iframe src="{VNC_BASE_URL}/vnc.html?autoconnect=true&resize=scale">` in `BrowserPane` when `vnc_url` is set.

**Rationale:** Standalone `vnc.html` already works. Iframe avoids Next.js bundling issues with `@novnc/novnc` (topLevelAwait, ESM/CJS interop, SSR). Zero additional client bundle weight.

**Alternatives considered:**

| Option | Pros | Cons |
|--------|------|------|
| Fix `@novnc/novnc` static import + `next.config` transpile | Native React integration | Fragile across Next versions; already failed once |
| Dynamic `import()` with `ssr: false` | Keeps component API | Still broke in production bundle |
| **iframe to vnc.html** | Proven working; trivial | Less layout control; single shared stream |

**Fallback:** If iframe UX is unacceptable (e.g. focus/keyboard issues), revisit static RFB with explicit `webpack`/`turbopack` config in a follow-up.

### 2. Browser-reachable VNC URL via `NEXT_PUBLIC_VNC_BASE_URL`

**Choice:** Add `NEXT_PUBLIC_VNC_BASE_URL` (default `http://localhost:6080`) for iframe `src`. Keep backend `vncUrl` as WebSocket hint for future RFB client; iframe uses HTTP base URL only.

**Rationale:** Backend may store `ws://browser-worker:6080` (Docker-internal). The user's browser must hit `localhost:6080`. Decouple display URL from API field.

### 3. Session schema: strict optional `vncUrl`

**Choice:** Ensure `SessionResponseSchema` includes `vncUrl: z.string().url().optional().nullable()` (or ws URL variant). Add a unit test or build-time assertion that schema keys include `vncUrl`.

**Rationale:** Zod `.strip()` silently drops unknown keys — this was the primary regression.

### 4. Worker teardown marks `error` when clearing runtime

**Choice:** In `session-manager.close()` (and crash handlers), PATCH backend with `{ status: "error", vncUrl: null }` when browser resources are torn down without explicit user stop.

**Rationale:** Prevents `active` + null `vncUrl` zombie rows that confuse the UI and Recent Sessions list.

### 5. BrowserPane state machine

**Choice:**

| Condition | UI |
|-----------|-----|
| `status === "created"` | "Starting remote browser…" spinner |
| `status === "active"` && `vnc_url` | iframe embed |
| `status === "active"` && !`vnc_url` after 60s poll | "Stream not available — try a new session" + link to `:6080/vnc.html` |
| `status === "error"` | Error message with retry link to launcher |

Poll interval: reuse existing session layout polling (2–3s).

### 6. Docker build: rebuild shared before frontend

**Choice:** Frontend Dockerfile already copies `packages/shared` and runs build; add `--no-cache frontend` to verification steps. Document in tasks.

**Rationale:** Confirms stale bundle issue is resolved without changing Dockerfile unless shared copy order is wrong.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| iframe shows wrong session when multiple sessions share one VNC port | Accept for V1 local demo; document single active browser limitation |
| iframe keyboard focus quirks | Link to standalone vnc.html as escape hatch |
| CORS/X-Frame-Options on vnc.html | websockify/noVNC default allows embed; verify in smoke test |
| Stale sessions in DB confuse users | Mark `error` on teardown; optional filter in session list (non-goal if time-constrained) |

## Migration Plan

1. Merge code fixes to `packages/shared`, `apps/frontend`, `apps/browser-worker`.
2. `docker compose build --no-cache frontend` in `docker/compose/stack`.
3. `docker compose up -d` — create fresh session, verify embed.
4. No DB migration required (`vnc_url` column already exists from prior change).

**Rollback:** Revert frontend to placeholder; standalone `:6080/vnc.html` still works.

## Open Questions

- Should Recent Sessions hide or badge sessions with `status: active` but no in-memory worker? **Defer** — error status on teardown is sufficient for V1.
- Is iframe keyboard input acceptable for form-filling demo? **Validate manually** in task 5.x; escalate to RFB fix only if blocked.
