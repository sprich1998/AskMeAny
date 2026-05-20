# Docker — Option A (Standalone)

One folder per container. Each will hold:

- `Dockerfile` (or reference to app `Dockerfile`)
- `.env.example` for required env vars
- Optional `docker run` helper notes

Run services independently; point them at shared Postgres/Redis/Qdrant URLs on the host network or a user-defined Docker network.

| Folder | Image |
|--------|-------|
| [`frontend/`](frontend/) | TeachMeAny UI |
| [`backend/`](backend/) | Fastify API |
| [`browser-worker/`](browser-worker/) | Playwright + Chromium |
| [`embedding-worker/`](embedding-worker/) | BullMQ worker |
| [`postgres/`](postgres/) | `postgres:16` |
| [`redis/`](redis/) | `redis:7` |
| [`qdrant/`](qdrant/) | `qdrant/qdrant` |

For the full stack, use [`../compose/stack/`](../compose/stack/) instead.
