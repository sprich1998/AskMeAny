## 1. Shared contracts (packages/shared)

- [x] 1.1 Add `vncUrl` to `SessionResponseSchema` and `UpdateSessionRuntimeBodySchema` in `packages/shared`
- [x] 1.2 Add `InteractionSearchRequestSchema` / `InteractionSearchResponseSchema` in `packages/shared`
- [x] 1.3 Extend `WorkflowStepSchema` (or workflow response type) with `selector` and `value` for replay UI
- [x] 1.4 Rebuild or verify all apps compile against updated shared schemas

## 2. Docker Compose V1 stack (docker/compose/stack)

- [x] 2.1 Write `docker/compose/stack/docker-compose.yml` with frontend, backend, browser-worker, embedding-worker, postgres, redis, qdrant
- [x] 2.2 Set `browser-worker` `shm_size: "2gb"` and publish VNC port `6080:6080`
- [x] 2.3 Write `docker/compose/stack/.env.example` (DATABASE_URL, REDIS_URL, QDRANT_URL, OLLAMA_URL, VNC_PUBLIC_HOST, NEXT_PUBLIC_*)
- [x] 2.4 Write `docker/standalone/frontend/Dockerfile` and wire compose build context
- [x] 2.5 Update `docker/compose/stack/README.md` with `docker compose up --build` instructions

## 3. noVNC browser stream (apps/browser-worker)

- [x] 3.1 Add VNC startup script or entrypoint (Xvfb, x11vnc, websockify) to browser-worker image
- [x] 3.2 Update `browser-factory` / launch path to run Chromium headed on virtual display
- [x] 3.3 Build `vncUrl` from `VNC_PUBLIC_HOST` / `VNC_PUBLIC_PORT` env in `apps/browser-worker`
- [x] 3.4 PATCH backend runtime with `vncUrl` on launch; clear on teardown (`launch-job.ts`, `session-manager.ts`)
- [x] 3.5 Update `docker/standalone/browser-worker/Dockerfile` with VNC packages and exposed port
- [ ] 3.6 Smoke: launch job sets session `active` with reachable `vncUrl`

## 4. Session API vncUrl (apps/backend)

- [x] 4.1 Migration: add `vnc_url` column to `browser_sessions` (nullable text) in `infra/postgres/migrations/`
- [x] 4.2 Persist and return `vncUrl` in session queries and routes (`session.queries.ts`, `sessions.ts`)
- [x] 4.3 Accept `vncUrl` on worker runtime PATCH handler
- [x] 4.4 Map `vncUrl` in frontend `mappers.ts` and `BrowserSession` type

## 5. Frontend noVNC pane (apps/frontend)

- [x] 5.1 Add noVNC client dependency (e.g. `@novnc/novnc` or RFB wrapper used by project)
- [x] 5.2 Replace `browser-pane.tsx` placeholder with noVNC mount when `session.vncUrl` is set
- [x] 5.3 Show "Starting remote browser…" when `status === "created"` and `vncUrl` is null
- [x] 5.4 Document `NEXT_PUBLIC_*` vs API-provided `vncUrl` in `apps/frontend/README.md`
- [ ] 5.5 Manual: interact with CRUD fixture through noVNC while timeline updates

## 6. Workflow extraction (apps/backend)

- [x] 6.1 Add `workflow-extractor.ts` service: load actions + network_events + intents, insert workflow + steps
- [x] 6.2 Hook extractor into `POST /sessions/:id/recording/stop` (env flag `WORKFLOW_EXTRACT_ON_STOP` default true)
- [x] 6.3 Add insert queries for `workflows` and `workflow_steps` in `workflow.queries.ts`
- [x] 6.4 Extend `GET /workflows/:id` to join `actions` for `selector` and `value` on steps
- [ ] 6.5 Publish optional `workflow` timeline event after extraction (if timeline UX needs refresh)
- [ ] 6.6 Manual: stop recording after fixture flow → workflow panel shows steps with `api_equivalent`

## 7. Replay execution (apps/browser-worker)

- [x] 7.1 Load workflow steps with action selectors/values in `replay-consumer.ts`
- [x] 7.2 Implement UI replay in `replay-runner.ts`: `fill`, `click`, wait after networked steps
- [x] 7.3 Implement API replay mode: HTTP client using `api_equivalent` per step
- [x] 7.4 Fail job with clear errors on missing page, missing selector, or HTTP failure
- [ ] 7.5 Manual: trigger UI and API replay from frontend; verify worker logs success

## 8. Replay panel UX (apps/frontend)

- [x] 8.1 Update `replay-panel.tsx` / `replay-result-card.tsx` for queued vs failed states per spec
- [x] 8.2 Disable replay when `getWorkflows` returns empty; update copy
- [x] 8.3 Ensure workflow panel refreshes after stop recording (refetch workflows)

## 9. Interaction similarity search (apps/backend)

- [x] 9.1 Add Qdrant + Ollama (or shared embed client) module under `apps/backend/src/services/`
- [x] 9.2 Implement `POST /interactions/search` route with Zod validation
- [x] 9.3 Hydrate search hits from Postgres actions/network/intents
- [x] 9.4 Add minimal search UI hook (launcher or workflow tab) calling new endpoint — optional but recommended
- [ ] 9.5 Manual: search returns results after embedding fixture interactions

## 10. Verification and docs

- [x] 10.1 Write `scripts/smoke-e2e.sh` (or similar) documenting compose + fixture + workflow + replay checks
- [x] 10.2 Update root `README.md` status: V1 E2E loop complete when compose smoke passes
- [x] 10.3 Run `npm run build` in frontend, backend, browser-worker, embedding-worker
- [ ] 10.4 Full manual E2E: `docker compose up` → record via noVNC → stop → view workflow → replay UI + API → search
