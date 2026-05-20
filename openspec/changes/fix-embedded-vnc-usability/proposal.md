## Why

The Docker Compose stack runs and the browser-worker successfully launches Chromium with a working noVNC stream at `http://localhost:6080/vnc.html`, but the TeachMeAny session workspace at `http://localhost:3000` still shows **"Remote browser stream is not available"** for new active sessions. Users cannot teach through the product UI without opening a separate VNC tab — the core V1 loop is blocked on the frontend embed path, not on capture infrastructure.

**Success metric:** After `docker compose up`, a user creates a new session, waits for `status: active`, and sees the live remote browser **inside** the session workspace browser pane within 30 seconds — without manually opening port 6080.

## What Changes

- Fix **session API parsing** so `vncUrl` from `GET /sessions/:id` survives Zod validation and maps to `BrowserSession.vnc_url` in the frontend gap layer.
- Replace the hollow **noVNC React client** (tree-shaken / failed dynamic import in production bundle) with a reliable embed strategy (iframe to websockify `vnc.html` or statically bundled `@novnc/novnc` with correct Next.js config).
- Update **BrowserPane** states: loading while `status === "created"`, live stream when `vnc_url` is set, actionable error when session is `active` but stream is missing after timeout.
- Fix **stale session lifecycle**: when browser-worker tears down and clears `vncUrl`, PATCH session to `error` (not leave `active` + null `vncUrl`).
- Ensure **Docker frontend image** rebuilds with current `packages/shared` schema (no stale production bundle omitting `vncUrl`).
- Add compose env for **browser-facing VNC URL** (`NEXT_PUBLIC_VNC_BASE_URL` or equivalent) so iframe/WebSocket targets work from the user's browser, not Docker-internal hostnames.

## What This Is NOT

- Re-implementing the full V1 E2E loop (workflow extraction, replay, vector search) — those remain in `v1-e2e-product-loop`.
- Multi-session VNC routing or per-session websockify ports (single shared `:6080` stream remains acceptable for local V1).
- Auth, TLS, or production hardening of the VNC endpoint.
- Replacing noVNC with a browser extension or WebRTC stream.

## Capabilities

### New Capabilities

- `embedded-vnc-client`: Frontend component and configuration that embeds the remote browser stream in the session workspace, with loading/error states and a browser-reachable VNC base URL.

### Modified Capabilities

- `session-workspace-ui`: Browser pane mounts live stream when `vnc_url` is present; placeholder only during bootstrap.
- `frontend-backend-api-client`: `SessionResponseSchema` MUST include optional `vncUrl`; mapper preserves it on `BrowserSession`.
- `browser-session-runtime`: Worker teardown clears runtime and marks session `error` when browser resources are lost unexpectedly.
- `backend-session-api`: Session response documents optional `vncUrl` when browser runtime is attached (align spec with implemented field).

## Impact

| Area | Effect |
|------|--------|
| `packages/shared` | Confirm `vncUrl` on `SessionResponseSchema`; export if missing from build |
| `apps/frontend` | `browser-pane.tsx`, `vnc-viewer.tsx`, Next config, env vars |
| `apps/browser-worker` | Session teardown PATCH semantics in `session-manager` |
| `docker/standalone/frontend` | Rebuild order ensures shared package is fresh |
| `docker/compose/stack` | `NEXT_PUBLIC_VNC_BASE_URL=http://localhost:6080` (or similar) |

## Data Flow

```
User → Session workspace (BrowserPane)
         │ poll GET /sessions/:id
         ▼
       Backend returns { status: "active", vncUrl: "ws://localhost:6080" }
         │ Zod parse preserves vncUrl → mapSession → vnc_url
         ▼
       EmbeddedVncClient (iframe or RFB) → ws://localhost:6080 → Chromium display
```
