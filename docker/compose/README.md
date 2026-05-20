# Docker — Option B (Compose)

Orchestrate all V1 services with a single Compose project.

## Layout

| Path | Purpose |
|------|---------|
| [`stack/`](stack/) | `docker-compose.yml`, overrides, `.env.example` |

## Planned services

`frontend`, `backend`, `browser-worker`, `embedding-worker`, `postgres`, `redis`, `qdrant`

Named volumes: `postgres_data`, `redis_data`, `qdrant_data` (see `Proposl_v1.md` §11).
