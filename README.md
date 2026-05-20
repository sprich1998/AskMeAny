# TeachMeAny

Local Docker app that records human browser interaction and extracts **API-equivalent workflows**.

> Teach once through UI. Replay through UI or API.

## Repository layout

| Path | Purpose |
|------|---------|
| [`apps/`](apps/) | Runnable services (one Docker image each) |
| [`packages/`](packages/) | Shared TypeScript types and schemas |
| [`docker/`](docker/) | Standalone builds (Option A) and Compose stack (Option B) |
| [`infra/`](infra/) | Postgres migrations, init scripts, volume notes |
| [`scripts/`](scripts/) | Dev and ops helper scripts |
| [`Proposl_v1.md`](Proposl_v1.md) | V1 product and architecture proposal |

## Services (V1)

| Service | Port (planned) | Role |
|---------|----------------|------|
| `frontend` | 3000 | Next.js UI, noVNC view, timeline |
| `backend` | 4000 | Fastify API, WebSocket gateway |
| `browser-worker` | — | Playwright + CDP capture |
| `embedding-worker` | — | BullMQ → Qdrant embeddings |
| `postgres` | 5432 | Source of truth |
| `redis` | 6379 | Queue and cache |
| `qdrant` | 6333 | Similarity search |

## Docker deployment options

- **Option A — Standalone:** [`docker/standalone/`](docker/standalone/) — build and run one container at a time
- **Option B — Compose:** [`docker/compose/stack/`](docker/compose/stack/) — `docker compose up` for the full stack

## Status

V1 E2E product loop: noVNC remote browser, workflow extraction on stop recording, UI/API replay workers, interaction similarity search, and Docker Compose stack under `docker/compose/stack/`. Frontend uses the real API by default (`NEXT_PUBLIC_USE_MOCKS=true` for UI-only dev). See `docs/Proposl_v1.md` for scope and success metrics.

Quick start:

```bash
cd docker/compose/stack && cp .env.example .env && docker compose up --build
```

Smoke test (API running): `./scripts/smoke-e2e.sh`
