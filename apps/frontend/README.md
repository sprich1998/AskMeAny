# Frontend

**Container:** `frontend` · **Port:** `3000`

Next.js + React + TypeScript UI for TeachMeAny V1.

## Responsibilities

- Session launcher (URL input)
- Embedded remote browser (noVNC)
- Recording start / stop
- Live event timeline
- Network request viewer
- Extracted workflow viewer
- Simple local auth (V1)

## Backend integration

The gap layer (`src/lib/api-client.ts`, `src/lib/use-session-ws.ts`) talks to the Fastify backend by default. Set environment variables in `.env.local` (see `.env.example`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | REST API base URL |
| `NEXT_PUBLIC_WS_URL` | derived from API URL + `/ws` | WebSocket timeline endpoint |
| `NEXT_PUBLIC_USE_MOCKS` | `false` | Set to `true` for UI-only dev without backend |
| `NEXT_PUBLIC_VNC_BASE_URL` | `http://localhost:6080` | HTTP base URL for embedded noVNC iframe |

Copy `.env.local.example` to `.env.local` for local defaults.

### Mock mode

When `NEXT_PUBLIC_USE_MOCKS=true`, the frontend uses in-memory mocks (same behavior as the original kickstart). Useful for UI work without Postgres, Redis, backend, or browser-worker.

### Real stack

With mocks off, run postgres, redis, backend (`4000`), and browser-worker, then:

```bash
npm run dev
```

Create a session from the launcher, wait for status `active` and a non-null `vncUrl` on the session, then use the embedded noVNC pane to interact. Start/stop recording — timeline events arrive via WebSocket within ~2s; stopping recording extracts a workflow for the Workflow and Replay tabs.

The API `vncUrl` indicates the browser runtime is ready. The embedded pane loads `{NEXT_PUBLIC_VNC_BASE_URL}/vnc.html` (default `http://localhost:6080`) in an iframe so the stream is reachable from your browser when browser-worker runs in Docker.

## Source layout

| Path | Purpose |
|------|---------|
| [`src/app/`](src/app/) | Next.js App Router pages and layouts |
| [`src/components/`](src/components/) | UI components (timeline, browser pane, panels) |
| [`src/lib/`](src/lib/) | API client, WebSocket hooks, HTTP helpers, mappers |
| [`public/`](public/) | Static assets |

## Docker

- Standalone: [`docker/standalone/frontend/`](../../docker/standalone/frontend/)
- Compose: [`docker/compose/stack/`](../../docker/compose/stack/)
