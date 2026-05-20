# docker-compose-v1-stack Specification

## Purpose
TBD - created by archiving change v1-e2e-product-loop. Update Purpose after archive.
## Requirements
### Requirement: Full V1 stack compose file
The repository SHALL provide `docker/compose/stack/docker-compose.yml` that starts all V1 application and infrastructure services with one command.

#### Scenario: Compose up starts all services
- **WHEN** a developer runs `docker compose up --build` from `docker/compose/stack/`
- **THEN** containers for `frontend`, `backend`, `browser-worker`, `embedding-worker`, `postgres`, `redis`, and `qdrant` reach a running state

### Requirement: Browser worker Chromium memory settings
The `browser-worker` service in compose SHALL set `shm_size: "2gb"` for Chromium stability.

#### Scenario: shm_size is configured
- **WHEN** inspecting `docker-compose.yml` for `browser-worker`
- **THEN** `shm_size` is set to at least `2gb`

### Requirement: VNC port published for noVNC
The compose file SHALL publish the browser-worker VNC/WebSocket port (default host `6080`) so the frontend on the host can connect to `vncUrl`.

#### Scenario: Port mapping documented
- **WHEN** reading `docker/compose/stack/.env.example`
- **THEN** `VNC_PUBLIC_HOST` and `VNC_PUBLIC_PORT` explain how `vncUrl` is formed for local access

### Requirement: Named volumes for stateful services
Compose SHALL declare named volumes for Postgres, Redis, and Qdrant data matching `docs/Proposl_v1.md` §11.

#### Scenario: Volumes persist data across restarts
- **WHEN** compose is stopped and restarted without volume removal
- **THEN** prior Postgres sessions and Qdrant points remain available

### Requirement: Environment template for local development
The stack directory SHALL include `.env.example` with connection strings for `DATABASE_URL`, `REDIS_URL`, `QDRANT_URL`, `OLLAMA_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, and VNC public host settings.

#### Scenario: Copy env enables first run
- **WHEN** a developer copies `.env.example` to `.env` and runs compose
- **THEN** backend migrations run and frontend can reach the API without additional manual env wiring

### Requirement: Frontend container image
The repository SHALL include `docker/standalone/frontend/Dockerfile` (or equivalent under compose build context) so `frontend` is buildable in compose.

#### Scenario: Frontend builds in compose
- **WHEN** `docker compose build frontend` runs
- **THEN** the image builds successfully and serves on port `3000`

### Requirement: Documented smoke test script
The repository SHALL include a POSIX script under `scripts/` that documents or automates the V1 E2E path: create session, wait for active, open UI, record, stop, verify workflow, optional search, optional replay.

#### Scenario: Smoke script is executable from repo root
- **WHEN** a developer runs the documented smoke script with the compose stack up
- **THEN** the script exits zero when the CRUD fixture flow produces a workflow with at least one correlated step

