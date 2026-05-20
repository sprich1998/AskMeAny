# Standalone: `postgres`

**Image:** `postgres:16`

**Port:** `5432`

**Planned files:** `Dockerfile` (optional wrapper) or run script, `.env.example`

**Volumes:** mount [`infra/postgres/init/`](../../../infra/postgres/init/) and migrations from [`infra/postgres/migrations/`](../../../infra/postgres/migrations/).
