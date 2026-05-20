# Embedding Worker

**Container:** `embedding-worker`

BullMQ consumer that turns captured interactions into searchable vectors.

## Responsibilities

- Consume embed jobs from Redis queue
- Build text representation of action + network + intent
- Generate embeddings via Ollama (V1 default provider)
- Upsert vectors into Qdrant `interaction_memory` collection

## Source layout

| Path | Purpose |
|------|---------|
| [`src/jobs/`](src/jobs/) | BullMQ workers and job handlers |
| [`src/embeddings/`](src/embeddings/) | Model client, text templates, Qdrant client |
| [`src/db/`](src/db/) | Postgres read queries for interaction facts |

## Data roles

- **Postgres** = source of truth
- **Qdrant** = similarity search only

## Prerequisites

- Postgres, Redis, and Qdrant running (see repo root README)
- Backend running and enqueueing `embed-interaction` jobs after capture ingest
- Ollama running locally with an embedding model pulled, e.g.:

```bash
ollama pull nomic-embed-text
```

## Local run

From repo root:

```bash
cd apps/embedding-worker
cp ../../docker/standalone/embedding-worker/.env.example .env
npm install
npm run dev
```

Required environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | — | Postgres connection string |
| `REDIS_URL` | `redis://localhost:6379` | BullMQ queue |
| `QDRANT_URL` | `http://localhost:6333` | Vector store |
| `EMBEDDING_PROVIDER` | `ollama` | Embedding backend |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama HTTP API |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text` | Model name |
| `EMBEDDING_VECTOR_SIZE` | `768` | Must match model output and Qdrant collection |

## Smoke test

1. Start Postgres, Redis, Qdrant, Ollama, backend, browser-worker, and embedding-worker.
2. Create a session and capture one correlated interaction (see `apps/browser-worker/README.md`).
3. Confirm the worker logs `Embed job completed` with the `actionId`.
4. Verify the Qdrant point exists:

```bash
curl "http://localhost:6333/collections/interaction_memory/points/scroll" \
  -H "Content-Type: application/json" \
  -d '{"limit": 1, "with_payload": true, "with_vector": false}'
```

The payload should include `action_id`, `session_id`, `url`, `action_type`, `label`, and optional network/intent fields.

## Docker

- Standalone: [`docker/standalone/embedding-worker/`](../../docker/standalone/embedding-worker/)
- Compose: [`docker/compose/stack/`](../../docker/compose/stack/)

Build standalone image from repo root:

```bash
docker build -f docker/standalone/embedding-worker/Dockerfile -t teachmeany/embedding-worker .
```
