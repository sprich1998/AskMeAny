# Docker volumes

Documentation for named volumes used in Compose:

| Volume | Service | Mount |
|--------|---------|-------|
| `postgres_data` | postgres | `/var/lib/postgresql/data` |
| `redis_data` | redis | `/data` |
| `qdrant_data` | qdrant | `/qdrant/storage` |

Optional export artifacts may use a local bind mount under this folder in dev.
