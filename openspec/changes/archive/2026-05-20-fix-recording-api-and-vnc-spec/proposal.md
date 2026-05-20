## Why

The embedded noVNC browser pane now works for active sessions (iframe to `{NEXT_PUBLIC_VNC_BASE_URL}/vnc.html` with autoconnect). The next blocker in the V1 teach-once loop is **Start Recording**: the frontend sends `POST /sessions/:id/recording/start` with `Content-Type: application/json` and an **empty body**, which Fastify rejects with `FST_ERR_CTP_EMPTY_JSON_BODY` (400). Stop recording has the same bug. The smoke script also uses the broken pattern, so recording was never verified end-to-end.

Canonical specs still describe a browser-pane **placeholder** and do not document the shipped iframe embed behavior or bodyless POST rules for recording endpoints.

**Success metric:** User can create a session, see the remote site in the workspace, click **Start Recording** without a 400 error, interact in noVNC, and click **Stop Recording** to return to `active`.

## What Changes

- Fix **`apiFetch`** in `apps/frontend/src/lib/http.ts` so bodyless POST requests do not send `Content-Type: application/json` with an empty body (or send `{}` when JSON content-type is required).
- Fix **`scripts/smoke-e2e.sh`** recording start/stop curls to match the working contract.
- **Archive/update specs** to reflect shipped VNC embed behavior (iframe on `active`/`recording`, autoconnect) — no re-implementation of the embed.
- **Add spec requirements** for recording POST requests from the frontend gap layer.

## What This Is NOT

- Re-implementing the noVNC iframe (already shipped in `fix-embedded-vnc-usability`).
- Changing backend recording route semantics (routes are correct; client request shape is wrong).
- Workflow extraction, replay, or vector search work.

## Capabilities

### New Capabilities

_(none — embed behavior merges into existing UI specs)_

### Modified Capabilities

- `frontend-backend-api-client`: Recording POST methods MUST succeed against Fastify without empty JSON body errors; document request shape.
- `session-workspace-ui`: Replace placeholder requirement with live noVNC iframe embed when session is `active` or `recording`.
- `embedded-vnc-client`: Align delta spec with implemented iframe + autoconnect gate on session status (not only `vnc_url`).
- `backend-recording-api`: Clarify that start/stop endpoints accept POST with no body or empty JSON object `{}`.

## Impact

| Area | Effect |
|------|--------|
| `apps/frontend/src/lib/http.ts` | Conditional Content-Type / body for POST |
| `apps/frontend/src/lib/api-client.real.ts` | May inherit fix from `apiFetch` only |
| `scripts/smoke-e2e.sh` | Recording curls fixed |
| `openspec/specs/session-workspace-ui` | Archive delta — live embed documented |
| `openspec/specs/frontend-backend-api-client` | Recording request scenarios added |
