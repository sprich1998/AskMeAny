## Context

`apps/browser-worker` is a scaffold. The backend already exposes session, recording, event, workflow, replay, and WebSocket routes, and it relays Redis `timeline:{session_id}` messages to the frontend. The worker must now become the runtime that launches Chromium, observes human interaction, correlates browser signals, and submits structured facts to the backend.

## Goals / Non-Goals

**Goals:**
- Start a runnable TypeScript browser-worker service.
- Consume `browser-launch` jobs and create one Playwright page per session.
- Track backend recording state and only ingest capture bundles while recording.
- Use Playwright for DOM target capture and CDP for network capture.
- Correlate one action to the strongest nearby network request within 0-1500ms.
- Persist through backend ingest routes only; do not write directly to Postgres.
- Consume replay jobs with a minimal UI replay runner.

**Non-goals:**
- noVNC streaming.
- Embeddings and Qdrant.
- Complex workflow assembly.
- Authentication between local services.

## Decisions

### 1. Backend remains the only database writer

The browser-worker posts capture bundles to `POST /sessions/:id/ingest`. The backend validates, writes Postgres rows, publishes timeline events, and enqueues embed jobs. This keeps DB credentials out of the worker and ensures WebSocket events only fan out after durable storage.

### 2. Session orchestration uses BullMQ

`POST /sessions` enqueues a `browser-launch` job. The worker consumes that job, launches Chromium, navigates to `startUrl`, and patches the session to `active`. This avoids worker-side polling for new sessions.

### 3. Recording state is polled from the backend

For V1, the worker checks `GET /sessions/:id` periodically and gates capture ingestion on `status === "recording"`. This is simpler than adding a new recording-control queue and keeps the backend session state as the source of truth.

### 4. Capture uses Playwright plus CDP

Playwright adds DOM event listeners and computes target metadata. CDP listens to `Network.requestWillBeSent`, `Network.responseReceived`, and `Network.loadingFinished`, then fetches response bodies when available. Request bodies may be absent or truncated; correlation does not depend on them.

### 5. Correlation is rule-based

The capture engine links an action to the first eligible network event that starts 0-1500ms after the action, preferring `fetch`/`XHR` requests and same-frame initiators when present. If no request matches, the action is stored uncorrelated.

### 6. Intent inference is deterministic

Intent names are derived from action label, HTTP method, and URL segments. Examples: `search_client`, `submit_form`, `open_details`. Confidence is higher when both a DOM label and network URL are available.

### 7. Replay is intentionally narrow

The replay consumer acknowledges `replay-session` jobs and attempts simple `fill` and `click` steps from workflow artifacts. Complex replay recovery belongs in later changes.

## Risks / Trade-offs

- **Polling recording state adds latency** — a one-second interval is acceptable for V1 and avoids another realtime control channel.
- **Response body access may fail** — CDP body reads are best-effort; failures produce `null` bodies and do not fail capture.
- **Chromium sessions can leak** — session manager closes contexts on stopped/error status and process shutdown.
- **Selector stability varies** — V1 records CSS selector and xpath; future work can add selector scoring.

## Migration Plan

1. Add shared schemas and constants.
2. Add backend launch/ingest/update routes and producers.
3. Bootstrap browser-worker service and BullMQ workers.
4. Add Playwright/CDP capture and correlation.
5. Add Dockerfile and fixture smoke test.

## Open Questions

- noVNC URL shape is deferred. The PATCH route accepts optional runtime metadata so the streaming URL can be added later without changing the session lifecycle.
