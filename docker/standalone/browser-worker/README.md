# Standalone: `browser-worker`

**Build context:** repo root (or `apps/browser-worker`)

**Planned files:** `Dockerfile`, `.env.example`

**Docker notes:** set `shm_size: 2gb` for Chromium.

**Depends on:** `redis` (optional queue), `backend` or `postgres` for persistence.
