# Backend API

**Container:** `backend` · **Port:** `4000` (planned)

Fastify HTTP API and WebSocket gateway.

## Responsibilities

- Create and manage browser sessions
- Start / stop recording
- Expose captured actions and network events
- Expose extracted workflows
- Trigger simple UI replay
- Enqueue jobs for `embedding-worker`

## Source layout

| Path | Purpose |
|------|---------|
| [`src/routes/`](src/routes/) | HTTP route handlers |
| [`src/services/`](src/services/) | Business logic, correlation, intent |
| [`src/db/`](src/db/) | Postgres client, queries, migrations runner |
| [`src/websocket/`](src/websocket/) | Realtime events to frontend |

## Docker

- Standalone: [`docker/standalone/backend/`](../../docker/standalone/backend/)
- Compose: [`docker/compose/stack/`](../../docker/compose/stack/)
