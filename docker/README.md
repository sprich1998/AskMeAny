# Docker

Two deployment options for TeachMeAny V1.

## Option A — Standalone (`standalone/`)

Build and run **one container at a time**. Useful for debugging a single service or running infra only.

```bash
# Example (once Dockerfiles exist)
docker build -f docker/standalone/backend/Dockerfile -t teachmeany-backend .
docker run -p 4000:4000 teachmeany-backend
```

Each service has its own folder under [`standalone/`](standalone/).

## Option B — Compose (`compose/stack/`)

Run the **full stack** with one command.

```bash
# Example (once compose file exists)
docker compose -f docker/compose/stack/docker-compose.yml up
```

## Containers

| Service | Standalone path | App / image |
|---------|-----------------|-------------|
| frontend | [`standalone/frontend/`](standalone/frontend/) | `apps/frontend` |
| backend | [`standalone/backend/`](standalone/backend/) | `apps/backend` |
| browser-worker | [`standalone/browser-worker/`](standalone/browser-worker/) | `apps/browser-worker` |
| embedding-worker | [`standalone/embedding-worker/`](standalone/embedding-worker/) | `apps/embedding-worker` |
| postgres | [`standalone/postgres/`](standalone/postgres/) | `postgres:16` |
| redis | [`standalone/redis/`](standalone/redis/) | `redis:7` |
| qdrant | [`standalone/qdrant/`](standalone/qdrant/) | `qdrant/qdrant` |
