## 1. OpenSpec scaffold

- [x] 1.1 `openspec/changes/embedding-worker-kickstart` — Create `.openspec.yaml`, `proposal.md`, `design.md`, capability specs, and `tasks.md`

## 2. Shared contracts

- [x] 2.1 `packages/shared` — Add `INTERACTION_MEMORY_COLLECTION` constant
- [x] 2.2 `packages/shared` — Add Zod schema and TypeScript type for `InteractionMemoryPayload`
- [x] 2.3 `packages/shared` — Export new constant and schema from the package barrel

## 3. Embedding-worker bootstrap

- [x] 3.1 `apps/embedding-worker` — Add `package.json`, `tsconfig.json`, env parsing, and service entry point
- [x] 3.2 `apps/embedding-worker` — Add Redis client and BullMQ worker registration
- [x] 3.3 `apps/embedding-worker` — Add graceful shutdown on SIGTERM/SIGINT

## 4. Postgres reader

- [x] 4.1 `apps/embedding-worker` — Add typed Postgres client and env configuration for `DATABASE_URL`
- [x] 4.2 `apps/embedding-worker` — Add query helpers: action by id, network event by id or action, intent by action, session by id

## 5. Interaction text builder

- [x] 5.1 `apps/embedding-worker` — Add deterministic text template builder in `src/embeddings/`
- [x] 5.2 `apps/embedding-worker` — Add safe top-level JSON key extraction for request/response bodies

## 6. Embedding model port

- [x] 6.1 `apps/embedding-worker` — Define `EmbeddingClient` interface in `src/embeddings/`
- [x] 6.2 `apps/embedding-worker` — Implement V1 default provider (resolve Ollama vs `@xenova/transformers` open question)
- [x] 6.3 `apps/embedding-worker` — Wire provider selection via environment variables

## 7. Qdrant store

- [x] 7.1 `apps/embedding-worker` — Add Qdrant client with `QDRANT_URL` configuration
- [x] 7.2 `apps/embedding-worker` — Ensure `interaction_memory` collection on startup with configurable vector size
- [x] 7.3 `apps/embedding-worker` — Upsert points by `action_id` with required payload fields

## 8. Job consumer wiring

- [x] 8.1 `apps/embedding-worker` — Implement `embed-interaction` job handler orchestrating fetch → text → embed → upsert
- [x] 8.2 `apps/embedding-worker` — Add structured logging for job start, completion, and failure
- [x] 8.3 `apps/embedding-worker` — Validate job payload with `EmbedInteractionJobPayloadSchema`

## 9. Docker and smoke test

- [x] 9.1 `docker/standalone/embedding-worker` — Add Dockerfile and `.dockerignore`
- [x] 9.2 `docker/standalone/embedding-worker` — Add `.env.example` documenting Redis, Postgres, Qdrant, and embedding env vars
- [x] 9.3 `apps/embedding-worker` — Update README with local run and smoke-test steps (capture ingest → Qdrant point visible)
- [x] 9.4 `apps/embedding-worker` — Build TypeScript successfully
