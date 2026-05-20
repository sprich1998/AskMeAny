## Why

The frontend is complete and renders all six V1 screens with mock data via the `frontend-gap-layer`. The backend (`apps/backend`) is a README-only scaffold with no runnable code. Without a working Fastify API, the gap layer cannot connect to real data, the browser-worker has nowhere to deliver captured events, and the embedding-worker has no queue producer to trigger. The backend is the critical path blocker for all end-to-end V1 functionality.

**Success metric:** The backend starts cleanly (`npm run dev`), passes a health check at `GET /health`, and the frontend gap layer's `ApiClient` can create a session, retrieve actions, and receive a WebSocket timeline event — all against real Postgres + Redis data.

## What Changes

- **New:** `apps/backend/package.json` and `tsconfig.json` — Node.js/TypeScript project bootstrapped with Fastify, Zod, postgres client, BullMQ, and `@fastify/websocket`
- **New:** `apps/backend/src/index.ts` — Fastify server entry point on port 4000
- **New:** `apps/backend/src/routes/` — Fastify route plugins for sessions, recording, actions, network events, workflows, and replay
- **New:** `apps/backend/src/services/` — Domain service layer for session lifecycle, workflow assembly, replay orchestration, and BullMQ job production
- **New:** `apps/backend/src/db/` — Typed Postgres client and query helpers for all 8 core tables
- **New:** `apps/backend/src/websocket/` — Per-session WebSocket gateway for real-time timeline push to the frontend
- **New:** `infra/postgres/migrations/` — Numbered SQL migration files for all 8 tables (`browser_sessions`, `page_snapshots`, `actions`, `network_events`, `dom_mutations`, `intents`, `workflows`, `workflow_steps`)
- **New:** `packages/shared/src/types/` — Shared TypeScript types for sessions, actions, network events, workflows, and BullMQ job payloads
- **New:** `packages/shared/src/schemas/` — Zod schemas for all API request/response bodies and job payloads
- **New:** `packages/shared/src/constants/` — Queue names, event types, status values
- **New:** `docker/standalone/backend/Dockerfile` — Multi-stage Dockerfile for the backend container

## Capabilities

### New Capabilities

- `backend-session-api`: REST endpoints to create, retrieve, and close browser sessions (`POST /sessions`, `GET /sessions/:id`, `DELETE /sessions/:id`)
- `backend-recording-api`: Recording lifecycle control per session (`POST /sessions/:id/recording/start`, `POST /sessions/:id/recording/stop`)
- `backend-events-api`: Read-only retrieval of captured actions and network events for a session (`GET /sessions/:id/actions`, `GET /sessions/:id/network-events`)
- `backend-workflows-api`: Retrieval of extracted workflows and their steps (`GET /sessions/:id/workflows`, `GET /workflows/:id`)
- `backend-replay-api`: Trigger UI replay or API-equivalent execution for a workflow (`POST /workflows/:id/replay`)
- `backend-realtime-ws`: WebSocket endpoint at `/ws` — frontend subscribes by `session_id` and receives live `action`, `network_event`, `intent`, and `dom_mutation` events as they are captured

### Modified Capabilities

_(none — the `frontend-gap-layer` interface contracts are unchanged; only the transport switches from mock to live)_

## Impact

- `apps/backend/` — all new source files; this is the primary target
- `packages/shared/` — new types, Zod schemas, and BullMQ queue name constants; consumed by backend, browser-worker, and embedding-worker
- `infra/postgres/migrations/` — 8 new SQL migration files; must run on first boot before the backend starts
- `docker/standalone/backend/Dockerfile` — new container image definition
- `apps/browser-worker/` and `apps/embedding-worker/` — will import types from `packages/shared` (no functional change to those apps in this change; types are additive)
