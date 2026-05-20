## 1. OpenSpec scaffold

- [x] 1.1 `openspec/changes/browser-worker-kickstart` — Create `.openspec.yaml`, `proposal.md`, `design.md`, capability specs, and `tasks.md`

## 2. Shared contracts

- [x] 2.1 `packages/shared` — Add `BROWSER_LAUNCH_QUEUE` and browser-worker event constants
- [x] 2.2 `packages/shared` — Add Zod schemas/types for `BrowserLaunchJobPayload`, `IngestInteractionBundle`, `TimelineEventEnvelope`, and `UpdateSessionRuntimeBody`
- [x] 2.3 `packages/shared` — Export new schemas/types from the package barrel

## 3. Backend capture ingest

- [x] 3.1 `apps/backend` — Add a `browser-launch` BullMQ producer and enqueue it from `POST /sessions`
- [x] 3.2 `apps/backend` — Add session runtime update query support and `PATCH /sessions/:id`
- [x] 3.3 `apps/backend` — Add intent and DOM mutation insert query helpers
- [x] 3.4 `apps/backend` — Add `POST /sessions/:id/ingest` route that validates, persists, publishes timeline events, and enqueues embed jobs

## 4. Browser-worker bootstrap

- [x] 4.1 `apps/browser-worker` — Add package.json, tsconfig, env parsing, and service entry point
- [x] 4.2 `apps/browser-worker` — Add backend API client and session manager
- [x] 4.3 `apps/browser-worker` — Add BullMQ browser-launch consumer and replay-session consumer

## 5. Capture pipeline

- [x] 5.1 `apps/browser-worker` — Add Playwright browser factory and DOM action capture helpers
- [x] 5.2 `apps/browser-worker` — Add CDP network listener for fetch/XHR request/response pairs
- [x] 5.3 `apps/browser-worker` — Add capture correlator and rule-based intent inference
- [x] 5.4 `apps/browser-worker` — Wire action + network capture to backend ingest

## 6. Docker and smoke test

- [x] 6.1 `docker/standalone/browser-worker` — Add Dockerfile and `.dockerignore`
- [x] 6.2 `apps/browser-worker` — Add CRUD fixture page for correlation smoke testing
- [x] 6.3 `apps/browser-worker` — Update README with local run and smoke-test steps
- [x] 6.4 `apps/browser-worker` — Build TypeScript successfully
