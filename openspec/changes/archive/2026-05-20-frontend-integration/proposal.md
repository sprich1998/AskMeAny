## Why

The backend, browser-worker, and embedding-worker pipelines are implemented and wired server-side, but the frontend still runs entirely on mock data via the gap layer (`api-client.ts`, `use-session-ws.ts`). Users cannot create real sessions, see captured actions on the live timeline, or exercise the capture → Postgres → WebSocket path through the UI. This change closes the last critical integration gap so the product can be validated end-to-end against real data.

**Success metric:** With backend + workers running locally, a user can start a session from the frontend, start/stop recording, and see real timeline events (action, network_event, intent, dom_mutation) arrive via WebSocket within 2 seconds of a captured interaction — no mock data involved.

## What Changes

- Replace mock implementations in `apps/frontend/src/lib/api-client.ts` with HTTP calls to the Fastify backend (`NEXT_PUBLIC_API_URL`, default `http://localhost:4000`).
- Replace mock interval in `apps/frontend/src/lib/use-session-ws.ts` with a real WebSocket connection to `/ws` using the backend subscribe protocol.
- Add `@teachmeany/shared` as a frontend dependency and align domain types with backend schemas (camelCase API ↔ component view types).
- Fix recording status handling: stop recording returns session to `"active"` (not `"idle"`); display all backend session statuses (`created`, `active`, `recording`, `stopped`, `error`).
- Add mappers between shared API response shapes and frontend view types where components still use snake_case display fields.
- Add `.env.example` for frontend with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`.
- Keep `mock-data.ts` for Storybook/dev fallback behind an explicit env flag (`NEXT_PUBLIC_USE_MOCKS=true`), not the default.
- Update root README status line to reflect frontend-backend integration.

## What This Is NOT

- noVNC remote browser streaming (separate change)
- Workflow generation from captured actions (separate change)
- Replay execution in browser-worker (separate change)
- Docker Compose full stack (separate change)
- Authentication layer
- Vector search UI or Qdrant query endpoints

## Capabilities

### New Capabilities

- `frontend-backend-api-client`: Real HTTP `ApiClient` implementation calling backend session, recording, workflow, and replay routes with typed error handling.
- `frontend-realtime-ws`: Real WebSocket timeline subscription hook consuming `TimelineEventEnvelope` messages from the backend relay.

### Modified Capabilities

- `frontend-gap-layer`: Requirements change from stub-only to real-backend-default; mock mode becomes opt-in via env flag. Session status enum and type alignment updated to match `@teachmeany/shared`.

## Impact

| Area | Effect |
|------|--------|
| `apps/frontend` | Primary — api-client, use-session-ws, types, recording-controls, env config |
| `packages/shared` | Consumed by frontend; may add thin view-model mappers if needed |
| `apps/backend` | No route changes expected; CORS already open in development |
| `apps/browser-worker` | Indirect — capture events become visible in UI once wired |
| Components | No direct `fetch`/`WebSocket` in components; gap layer contract preserved |

## Data Flow (after integration)

```
User → Frontend (ApiClient)
         │ POST /sessions
         ▼
       Backend → BullMQ → browser-worker → capture → POST /ingest
         │                              │
         │ redis.publish(timeline:*)    ▼
         │                         Postgres
         ▼
       /ws relay ──WebSocket──► useSessionWs → EventTimeline
```
