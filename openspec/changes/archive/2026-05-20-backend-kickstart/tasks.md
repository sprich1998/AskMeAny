## 1. Bootstrap packages/shared

- [x] 1.1 `packages/shared` — Create `package.json` with name `@teachmeany/shared`, version `0.1.0`, TypeScript source, and no runtime dependencies except `zod`
- [x] 1.2 `packages/shared` — Add `tsconfig.json` with `strict: true`, `moduleResolution: bundler`, `declaration: true`, targeting ESNext; include `src/**/*.ts`
- [x] 1.3 `packages/shared` — Create `src/constants/index.ts` with queue name constants (`EMBED_INTERACTION_QUEUE = "embed-interaction"`, `REPLAY_SESSION_QUEUE = "replay-session"`), session status values, and WebSocket event type literals
- [x] 1.4 `packages/shared` — Create `src/types/session.types.ts` with `BrowserSession`, `SessionStatus` (union type), `PageSnapshot` interfaces (affects: apps/backend, apps/browser-worker, apps/embedding-worker)
- [x] 1.5 `packages/shared` — Create `src/types/action.types.ts` with `Action`, `ActionElement`, `NetworkEvent`, `DomMutation`, `Intent` interfaces (affects: apps/backend, apps/browser-worker)
- [x] 1.6 `packages/shared` — Create `src/types/workflow.types.ts` with `Workflow`, `WorkflowStep`, `WorkflowArtifact` (containing `uiReplay` and `apiEquivalent`) interfaces (affects: apps/backend, apps/browser-worker)
- [x] 1.7 `packages/shared` — Create `src/schemas/session.schema.ts` with Zod schemas for `CreateSessionBody`, `SessionResponse`, `ListSessionsResponse` and derived TypeScript types via `z.infer`
- [x] 1.8 `packages/shared` — Create `src/schemas/action.schema.ts` with Zod schemas for `ActionRecord`, `NetworkEventRecord`, `DomMutationRecord`, `IntentRecord` and list response shapes
- [x] 1.9 `packages/shared` — Create `src/schemas/workflow.schema.ts` with Zod schemas for `WorkflowRecord`, `WorkflowStepRecord`, `WorkflowWithSteps`, `ReplayJobBody`, `ReplayJobAccepted`
- [x] 1.10 `packages/shared` — Create `src/schemas/jobs.schema.ts` with Zod schemas for `EmbedInteractionJobPayload` and `ReplaySessionJobPayload` (BullMQ job shapes)
- [x] 1.11 `packages/shared` — Create `src/index.ts` barrel export for all types, schemas, and constants

## 2. Postgres migrations (infra/postgres)

- [x] 2.1 `infra/postgres` — Create `migrations/001_create_browser_sessions.sql`: table `browser_sessions` (uuid PK, start_url, current_url, status, created_at timestamptz)
- [x] 2.2 `infra/postgres` — Create `migrations/002_create_page_snapshots.sql`: table `page_snapshots` (uuid PK, session_id FK, url, title, dom_hash, simplified_dom jsonb, created_at)
- [x] 2.3 `infra/postgres` — Create `migrations/003_create_actions.sql`: table `actions` (uuid PK, session_id FK, page_snapshot_id FK nullable, type, label, selector, xpath, element jsonb, value jsonb, timestamp timestamptz)
- [x] 2.4 `infra/postgres` — Create `migrations/004_create_network_events.sql`: table `network_events` (uuid PK, session_id FK, action_id FK nullable, method, url, request_headers jsonb, request_body jsonb, response_status int, response_headers jsonb, response_body jsonb, timestamp timestamptz)
- [x] 2.5 `infra/postgres` — Create `migrations/005_create_dom_mutations.sql`: table `dom_mutations` (uuid PK, session_id FK, action_id FK, before_hash, after_hash, mutation_summary jsonb)
- [x] 2.6 `infra/postgres` — Create `migrations/006_create_intents.sql`: table `intents` (uuid PK, action_id FK, name, description, confidence float, source, created_at)
- [x] 2.7 `infra/postgres` — Create `migrations/007_create_workflows.sql`: table `workflows` (uuid PK, session_id FK, name, description, created_at)
- [x] 2.8 `infra/postgres` — Create `migrations/008_create_workflow_steps.sql`: table `workflow_steps` (uuid PK, workflow_id FK, action_id FK, order_index int, step_type, api_equivalent jsonb)
- [x] 2.9 `infra/postgres` — Create `init/001_init_extensions.sql` to enable `uuid-ossp` extension for `gen_random_uuid()`

## 3. Backend project setup (apps/backend)

- [x] 3.1 `apps/backend` — Create `package.json` with name `@teachmeany/backend`, dependencies: `fastify`, `@fastify/cors`, `@fastify/websocket`, `postgres`, `bullmq`, `ioredis`, `zod`, `@teachmeany/shared`; devDeps: `typescript`, `tsx`, `@types/node`
- [x] 3.2 `apps/backend` — Create `tsconfig.json` with `strict: true`, `module: ESNext`, `moduleResolution: bundler`, `paths: { "@teachmeany/shared": ["../../packages/shared/src/index.ts"] }`, includes `src/**/*.ts`
- [x] 3.3 `apps/backend` — Add `package.json` scripts: `"dev": "tsx watch src/index.ts"`, `"build": "tsc"`, `"start": "node dist/index.js"`, `"migrate": "tsx src/db/migrate.ts"`
- [x] 3.4 `apps/backend` — Create `src/env.ts` that reads and validates environment variables with Zod: `DATABASE_URL`, `REDIS_URL`, `PORT` (default 4000), `NODE_ENV`

## 4. Database client and migration runner (apps/backend)

- [x] 4.1 `apps/backend` — Create `src/db/client.ts`: initialise `postgres` client from `DATABASE_URL`; export a typed `db` singleton; configure `transform: { undefined: null }` for JSONB columns
- [x] 4.2 `apps/backend` — Create `src/db/migrate.ts`: migration runner that reads `.sql` files from `infra/postgres/migrations/` in lexicographic order, creates `schema_migrations` table if absent, and applies any unapplied migration in a transaction
- [x] 4.3 `apps/backend` — Create `src/db/queries/session.queries.ts` with typed query functions: `insertSession`, `findSessionById`, `listSessions`, `updateSessionStatus`
- [x] 4.4 `apps/backend` — Create `src/db/queries/action.queries.ts` with: `listActionsBySession`, `insertAction` (used by browser-worker via HTTP — implement now for the contract)
- [x] 4.5 `apps/backend` — Create `src/db/queries/network-event.queries.ts` with: `listNetworkEventsBySession`, `insertNetworkEvent`
- [x] 4.6 `apps/backend` — Create `src/db/queries/workflow.queries.ts` with: `listWorkflowsBySession`, `findWorkflowById`, `findWorkflowWithSteps`

## 5. Redis client and BullMQ producer (apps/backend)

- [x] 5.1 `apps/backend` — Create `src/redis/client.ts`: initialise `ioredis` client from `REDIS_URL`; export a `redis` singleton; configure `maxRetriesPerRequest: null` (required by BullMQ)
- [x] 5.2 `apps/backend` — Create `src/redis/subscriber.ts`: a separate `ioredis` client dedicated to Redis pub/sub subscriptions; export `redisSubscriber` singleton
- [x] 5.3 `apps/backend` — Create `src/jobs/embed-producer.ts`: BullMQ `Queue` for `EMBED_INTERACTION_QUEUE`; export `enqueueEmbedInteraction(payload: EmbedInteractionJobPayload)` using the shared Zod schema for payload validation
- [x] 5.4 `apps/backend` — Create `src/jobs/replay-producer.ts`: BullMQ `Queue` for `REPLAY_SESSION_QUEUE`; export `enqueueReplaySession(payload: ReplaySessionJobPayload)`

## 6. Fastify server entry point (apps/backend)

- [x] 6.1 `apps/backend` — Create `src/index.ts`: build Fastify with `logger: true`; register `@fastify/cors` (all origins in dev); decorate with `db` and `redis`; register all route plugins; run migrations before `listen()`; handle `SIGTERM`/`SIGINT` for graceful shutdown
- [x] 6.2 `apps/backend` — Register `@fastify/websocket` plugin in `src/index.ts` before route plugins

## 7. Route plugins (apps/backend)

- [x] 7.1 `apps/backend` — Create `src/routes/health.ts`: `GET /health` — query Postgres with `SELECT 1`, ping Redis with `PING`, return `{ status, postgres, redis, uptime }` per `backend-realtime-ws` spec
- [x] 7.2 `apps/backend` — Create `src/routes/sessions.ts`: `POST /sessions` (201), `GET /sessions` (200), `GET /sessions/:id` (200 / 404) — validate bodies/params with Zod schemas from `@teachmeany/shared`; use session query functions from task 4.3
- [x] 7.3 `apps/backend` — Create `src/routes/recording.ts`: `POST /sessions/:id/recording/start` and `POST /sessions/:id/recording/stop` — enforce status transitions per `backend-recording-api` spec; return 409 for invalid state
- [x] 7.4 `apps/backend` — Create `src/routes/actions.ts`: `GET /sessions/:id/actions` (200 / 404) — use action query from task 4.4
- [x] 7.5 `apps/backend` — Create `src/routes/network-events.ts`: `GET /sessions/:id/network-events` (200 / 404) — use network event query from task 4.5
- [x] 7.6 `apps/backend` — Create `src/routes/workflows.ts`: `GET /sessions/:id/workflows` (200 / 404) and `GET /workflows/:id` (200 / 404) — use workflow queries from task 4.6; include `stepCount` derived field
- [x] 7.7 `apps/backend` — Create `src/routes/replay.ts`: `POST /workflows/:id/replay` (202) — validate body, enqueue `replay-session` job via task 5.4, return `{ accepted: true, replayId, workflowId, mode }` per `backend-replay-api` spec
- [x] 7.8 `apps/backend` — Create `src/routes/delete-session.ts` (or add to `sessions.ts`): `DELETE /sessions/:id` — set status to `stopped`, return updated session per `backend-session-api` spec

## 8. WebSocket gateway (apps/backend)

- [x] 8.1 `apps/backend` — Create `src/websocket/session-relay.ts`: maintain `Map<string, Set<WebSocket>>` (session_id → client set); export `addClient`, `removeClient`, `broadcastToSession` functions
- [x] 8.2 `apps/backend` — Create `src/websocket/redis-relay.ts`: subscribe to Redis channels `timeline:{session_id}` on demand (first client for that session); on `message`, call `broadcastToSession`; unsubscribe when last client disconnects
- [x] 8.3 `apps/backend` — Create `src/routes/ws.ts`: WebSocket route at `/ws` using `@fastify/websocket`; on `message`, parse subscription JSON, validate with Zod, call `addClient`; on `close`, call `removeClient` and conditionally unsubscribe per `backend-realtime-ws` spec

## 9. Dockerfile (docker/standalone/backend)

- [x] 9.1 `docker/standalone/backend` — Create `Dockerfile`: multi-stage build — `builder` stage installs all deps and runs `tsc`; `runner` stage copies `dist/` and production `node_modules` only; `CMD ["node", "dist/index.js"]`; expose port 4000
- [x] 9.2 `docker/standalone/backend` — Create `.dockerignore`: exclude `node_modules`, `dist`, `*.test.ts`, `.env*`

## 10. Smoke test and wiring check

- [x] 10.1 `apps/backend` — Start Postgres and Redis locally (via Docker or existing containers), run `npm run migrate`, confirm all 8 tables are created
- [x] 10.2 `apps/backend` — Run `npm run dev`, confirm `GET /health` returns `{ "status": "ok" }` and Fastify logs show all routes registered
- [x] 10.3 `apps/backend` — Manually test `POST /sessions`, `GET /sessions/:id`, `POST /sessions/:id/recording/start`, `GET /sessions/:id/actions` (empty), `GET /sessions/:id/workflows` (empty) with curl or Postman
- [x] 10.4 `apps/backend` — Connect a WebSocket client to `ws://localhost:4000/ws`, send a subscribe message, publish a mock event to Redis `timeline:{session_id}`, confirm the client receives it
