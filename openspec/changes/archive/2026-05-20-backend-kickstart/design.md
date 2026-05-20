## Context

The backend is a README-only scaffold. The frontend is fully implemented with a gap layer (`ApiClient` + `useSessionWs`) that expects a Fastify API on port 4000 and a WebSocket at `ws://localhost:4000/ws`. The browser-worker and embedding-worker also need a running backend before they can deliver captured events or consume BullMQ jobs.

This design covers the complete initial setup of `apps/backend`, the `packages/shared` type/schema layer, Postgres migrations, and the standalone Dockerfile. It does not cover the browser-worker, embedding-worker, or docker-compose stack (those are separate changes).

**Current state:** No runnable backend code exists. The gap layer uses mock data.

**Stakeholders / consumers:**
- `apps/frontend` — connects via REST + WebSocket
- `apps/browser-worker` — will call backend to create sessions, then push captured events via Redis
- `apps/embedding-worker` — consumes BullMQ jobs from Redis queue (backend is the producer)
- `packages/shared` — all three services import shared types and Zod schemas

## Goals / Non-Goals

**Goals:**
- Fastify server starts on port 4000 with health check, CORS, and graceful shutdown
- All six REST capability areas are implemented with Zod-validated request/response schemas
- WebSocket gateway at `/ws` fans out captured timeline events from Redis pub/sub to connected frontend clients per `session_id`
- Postgres query layer uses typed client — no raw string SQL in application code
- BullMQ job producer publishes `embed-interaction` jobs to Redis when a new action-network correlation is stored
- SQL migrations run automatically on startup (or via script) before the server accepts connections
- All shared types and Zod schemas live in `packages/shared/src/` and are importable by all three services

**Non-Goals:**
- Authentication / authorization (designed as a future extension point; backend routes are unauthenticated in V1)
- Browser-worker implementation (separate change)
- Docker Compose full-stack wiring (separate change)
- Qdrant integration (embedding-worker's concern)
- LLM / rule-based intent extraction (browser-worker's concern)
- Workflow assembly logic (backend stores what browser-worker writes; no server-side ML in this change)

## Decisions

### 1. Postgres client: `postgres` (porsager/postgres) npm package

**Decision:** Use the `postgres` npm package (tagged template literal SQL) rather than an ORM like Drizzle or Knex.

**Why `postgres` over Drizzle ORM:**
- No schema definition overhead for V1 — migrations are plain SQL files; Drizzle would require keeping both SQL migrations and a TypeScript schema in sync
- Tagged template literals provide full type inference without a code-gen step
- Simpler mental model: Postgres queries look like SQL
- `postgres` handles connection pooling, JSONB serialisation, UUID types natively

**Why not Knex:**
- Knex is query-builder-first; `postgres` is SQL-first, which fits the project's "no magic strings" convention better when combined with explicit TypeScript return types

**Alternatives considered:** Prisma — rejected because Prisma requires a separate daemon (`prisma generate`) and its schema DSL would duplicate the SQL migrations.

---

### 2. Migration runner: custom startup script over a migration framework

**Decision:** Write a thin migration runner (`scripts/migrate.ts` or inline in `src/db/migrate.ts`) that reads numbered SQL files from `infra/postgres/migrations/` in lexicographic order and applies any not yet recorded in a `schema_migrations` table.

**Why custom over `node-pg-migrate` or Flyway:**
- No additional dependency; the `postgres` client already handles transactions
- Numbered files (`001_create_browser_sessions.sql`) are self-documenting and sortable
- Matches the project's existing plan (`infra/postgres/migrations/`)

**Behaviour:**
1. On startup, connect to Postgres
2. Create `schema_migrations(filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ)` if it does not exist
3. For each `.sql` file in `infra/postgres/migrations/` not in `schema_migrations`, execute in a transaction and record it
4. Start Fastify only after migrations complete

---

### 3. WebSocket fan-out: Redis pub/sub per session channel

**Decision:** The backend subscribes to Redis channels of the form `timeline:{session_id}`. When browser-worker publishes an event on that channel, the backend fans it out to all WebSocket clients subscribed to that session.

**Why Redis pub/sub over in-memory Map:**
- Browser-worker runs in a separate container; it cannot directly reach backend WebSocket connections
- Redis pub/sub decouples the two processes naturally; browser-worker publishes, backend relays
- Supports future horizontal scaling of the backend (any replica can relay any session's events)

**Implementation:**
- `@fastify/websocket` registers the `/ws` route
- On WebSocket `open`, client sends `{ type: "subscribe", session_id: "..." }`
- Backend maintains `Map<session_id, Set<WebSocket>>` for connected clients in the current process
- A dedicated Redis subscriber connection (separate from the main client) calls `subscribe(timeline:${session_id})` on demand (first subscriber for that session)
- On Redis `message`, backend serialises and sends to all WebSocket clients in the map

**Why not polling / SSE:**
- Polling adds latency to the live timeline (a core UX differentiator)
- SSE cannot send binary frames if needed later; WebSocket is already the frontend's chosen transport

---

### 4. Fastify plugin architecture: one plugin file per route domain

**Decision:** Each capability area is a Fastify plugin registered with `fastify.register()`:

```
src/routes/
  health.ts          → GET /health
  sessions.ts        → /sessions, /sessions/:id
  recording.ts       → /sessions/:id/recording/start|stop
  actions.ts         → /sessions/:id/actions
  network-events.ts  → /sessions/:id/network-events
  workflows.ts       → /sessions/:id/workflows, /workflows/:id
  replay.ts          → /workflows/:id/replay
```

Each plugin receives the Fastify instance (with `db` and `redis` decorators) and registers its own routes and schemas. This keeps files small and independently testable.

**Why not a single router file:** Large flat route files become hard to navigate. Plugin encapsulation is idiomatic Fastify.

---

### 5. Shared package structure: `packages/shared`

**Decision:** Bootstrap `packages/shared` with three sub-directories:

```
packages/shared/src/
  types/     → TypeScript interfaces (Session, Action, NetworkEvent, Workflow, etc.)
  schemas/   → Zod schemas (one file per domain: session.schema.ts, action.schema.ts, ...)
  constants/ → Queue names, event type literals, status values
```

All exports are isomorphic (no Node.js-only or browser-only APIs) so the frontend can import them too. The package is referenced via a workspace alias (`@teachmeany/shared`).

**Why Zod in shared and not just in backend:**
- Zod schemas can derive TypeScript types (`z.infer<typeof schema>`)
- The same schema validates API bodies in the backend and (in future) can be used for client-side form validation
- BullMQ job payload schemas live here so both the producer (backend) and consumer (embedding-worker) reference the same definition

---

### 6. Replay orchestration: stub in V1

**Decision:** The `POST /workflows/:id/replay` endpoint is implemented as a stub that returns `{ accepted: true, replayId: uuid }` and enqueues a `replay-session` BullMQ job. The browser-worker processes the job in a later change.

**Why:** The backend must expose the replay contract now so the frontend gap layer can connect. The actual Playwright replay logic belongs in browser-worker.

---

### 7. Dockerfile: multi-stage build

**Decision:** `docker/standalone/backend/Dockerfile` uses two stages:
- `builder`: Node.js 20-alpine, installs all deps, compiles TypeScript
- `runner`: Node.js 20-alpine slim, copies `dist/` and `node_modules` (production only)

`packages/shared` is compiled into `apps/backend/node_modules/@teachmeany/shared` at build time (workspace hoisting). No external registry required.

## Risks / Trade-offs

- **Redis pub/sub connection per backend process** — A dedicated subscriber connection does not participate in the pool; it is always blocking on messages. This is standard Redis pub/sub practice but means N backend processes = N subscriber connections. Acceptable at V1 scale.

- **Migration runner on every startup** — If the backend crashes mid-migration and is restarted, the transaction rollback ensures the failed migration is not marked as applied. The duplicate-check is idempotent. Risk: slow startup if there are many pending migrations (negligible for V1's ~8 migrations).

- **No auth in V1** — All routes are unauthenticated. Acceptable for a local Docker tool; the auth layer sits in backend routes only and is a documented future extension.

- **WebSocket client state is in-process** — If the backend is restarted, connected WebSocket clients are dropped. Clients must reconnect. For V1 local use this is fine; in future, a sticky-session load balancer or client-side reconnect logic resolves this.

- **`packages/shared` is a workspace package without a build step in V1** — TypeScript is compiled at the consuming app level (`apps/backend` tsc includes `packages/shared/src`). This is the simplest setup for a monorepo without a build tool (Turborepo/Nx). If packages/shared grows complex, a dedicated build step should be added.

## Migration Plan

1. Create `packages/shared` with types, schemas, constants — no breaking changes (new package)
2. Write SQL migration files in `infra/postgres/migrations/`
3. Bootstrap `apps/backend`: `package.json`, `tsconfig.json`, `src/index.ts`
4. Add DB client and migration runner
5. Implement route plugins one domain at a time (sessions first, then the rest)
6. Add WebSocket plugin and Redis pub/sub relay
7. Build and test the standalone Dockerfile
8. Update `apps/frontend`'s `ApiClient` env var to point to `http://localhost:4000` (remove mock)

**Rollback:** The backend is a new service. Existing frontend mock mode is preserved until the gap layer's base URL env var is switched. No database changes are irreversible (drop all tables, remove migration files).

## Open Questions

- **`packages/shared` TypeScript path aliases** — Does the monorepo need a root `tsconfig.json` with `paths` mapping, or will each app use a relative `references` path? Recommend starting with `references`; migrate to a root config if more than 3 apps share paths.
- **Replay job timeout** — What is the max replay duration before the browser-worker job is considered failed? Recommend 60 seconds for V1; should be configurable via env var.
