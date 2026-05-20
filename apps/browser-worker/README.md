# Browser Worker

**Container:** `browser-worker`

Playwright-controlled Chromium with CDP instrumentation. **Heart of the product** in V1.

## Responsibilities

- Launch and manage Chromium sessions
- Stream display to noVNC (via sidecar or embedded setup)
- Capture DOM targets on click / input
- Capture network request / response pairs
- Correlate user action → network call (capture engine)
- Write structured events to Postgres via backend or direct DB

## Source layout

| Path | Purpose |
|------|---------|
| [`src/playwright/`](src/playwright/) | Page lifecycle, selectors, replay |
| [`src/cdp/`](src/cdp/) | Chrome DevTools Protocol listeners |
| [`src/capture/`](src/capture/) | Correlation rules, DOM diff, intent hints |
| [`src/session/`](src/session/) | Session state, recording on/off |

## Notes

- Requires `shm_size: 2gb` in Docker
- V1 target apps: CRUD admin panels, internal tools (not canvas-heavy SPAs)

## Local development

```bash
cd apps/browser-worker
npm install
BACKEND_URL=http://localhost:4000 REDIS_URL=redis://localhost:6379 npm run dev
```

The backend creates browser sessions and enqueues `browser-launch` jobs. The
worker consumes those jobs, launches Chromium with Playwright, attaches CDP
network listeners, and submits capture bundles to the backend ingest route.

## Smoke test fixture

Serve the fixture from the repo root:

```bash
python3 -m http.server 8088 --directory apps/browser-worker/fixtures
```

Then create a session with `http://localhost:8088/crud-form.html`, wait for the
worker to mark it `active`, start recording, and submit the form. The expected
result is one captured click action correlated to a `POST https://httpbin.org/post`
network event, plus timeline events on `timeline:{session_id}`.

## Docker

- Standalone: [`docker/standalone/browser-worker/`](../../docker/standalone/browser-worker/)
- Compose: [`docker/compose/stack/`](../../docker/compose/stack/)
