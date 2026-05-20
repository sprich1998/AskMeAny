## Context

`apps/embedding-worker` is a scaffold. The backend already enqueues `embed-interaction` jobs after capture ingest, and Postgres holds the source-of-truth action, network event, intent, and session records. The worker must now become the async intelligence layer that turns those facts into searchable vectors in Qdrant.

## Goals / Non-Goals

**Goals:**
- Start a runnable TypeScript embedding-worker service.
- Consume `embed-interaction` BullMQ jobs with the existing shared payload schema.
- Read interaction facts from Postgres (not via backend API).
- Build deterministic embedding text from action + network + intent + session context.
- Generate vectors through a swappable `EmbeddingClient` port.
- Upsert idempotent points into Qdrant collection `interaction_memory`.
- Bootstrap the collection on startup with configurable vector size.

**Non-goals:**
- Backend similarity-search endpoints.
- LLM-powered intent extraction.
- Qdrant rebuild tooling.
- Docker Compose full-stack wiring.
- Authentication between local services.

## Decisions

### 1. Postgres is the read source for embed facts

The worker reads action, network event, intent, and session URL directly from Postgres. This matches the standalone Docker dependency list and keeps Qdrant as a derived layer. Postgres remains source of truth; Qdrant can be rebuilt from Postgres at any time.

### 2. Job payload stays minimal

The existing `EmbedInteractionJobPayload` (`sessionId`, `actionId`, `networkEventId?`, `timestamp?`) is sufficient. The worker hydrates full context from Postgres using `actionId` as the primary key and optionally `networkEventId` when present.

### 3. Embedding model is a port

Define an `EmbeddingClient` interface with `embed(text: string): Promise<number[]>`. Implementations live in `embedding-worker/src/embeddings/`. The queue job schema must not depend on a specific model or vector size.

### 4. Idempotency via Qdrant point ID

Use `action_id` as the Qdrant point ID. BullMQ retries safely overwrite the same point instead of creating duplicates.

### 5. Collection bootstrap on startup

On service start, ensure the `interaction_memory` collection exists. Vector size comes from environment configuration and must match the chosen embedding model.

### 6. Text template is deterministic and rule-based

Build embedding input from structured fields, not LLM summarization. Example shape:

```text
User clicked Search button on Client page.
Button text: Search.
Request: POST /api/client/search.
Payload fields: clientId.
Response fields: clientName, status.
Likely intent: search client by client ID.
```

Extract top-level JSON keys from request/response bodies when present. Omit sections when data is missing (e.g. uncorrelated actions without network events).

### 7. Failure handling does not block capture

Embedding failures log with job ID, `session_id`, and `action_id`, then rethrow for BullMQ retry. The capture pipeline is already async; failed embed jobs must not affect recording.

### 8. Bootstrap pattern matches browser-worker

ESM TypeScript, BullMQ + ioredis, `@teachmeany/shared`, `tsx` for dev, `tsc` for build. Postgres client uses the same typed query pattern as the backend.

## Risks / Trade-offs

- **Direct Postgres access duplicates read logic** — acceptable for V1; a backend read API can be added later if credentials or coupling become a concern.
- **Vector size must match model** — misconfigured env causes upsert failures; startup should validate or log clearly when collection size differs.
- **Embedding provider adds external dependency** — Ollama requires a sidecar; `@xenova/transformers` increases container size. Provider choice is deferred (see Open Questions).
- **Missing intent or network data produces thinner text** — embeddings still run; similarity quality may be lower for uncorrelated actions.

## Migration Plan

1. Add shared Qdrant constants and interaction memory payload schema.
2. Bootstrap embedding-worker service and BullMQ consumer.
3. Add Postgres reader and interaction text builder.
4. Add embedding port implementation and Qdrant client.
5. Add Dockerfile and smoke-test documentation.

## Open Questions

- **Embedding provider for V1:** Ollama HTTP embeddings API vs `@xenova/transformers` in Node. Both satisfy the port interface; decide during `/opsx:apply` based on local dev ergonomics and container size.
- **Default vector size and model name:** Must be set together via env (e.g. `EMBEDDING_MODEL`, `EMBEDDING_VECTOR_SIZE`). Document in `.env.example` once provider is chosen.
