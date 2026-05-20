# Compose stack

Run the full V1 stack:

```bash
cd docker/compose/stack
cp .env.example .env
docker compose up --build
```

Optional Ollama in compose (for embeddings + similarity search):

```bash
docker compose --profile ollama up --build
```

Then set `OLLAMA_URL=http://ollama:11434` in compose overrides for `backend` and `embedding-worker`.

## Ports

| Service | Port |
|---------|------|
| frontend | 3000 |
| backend | 4000 |
| noVNC (browser-worker) | 6080 |
| postgres | 5432 |
| redis | 6379 |
| qdrant | 6333 |
| ollama (profile) | 11434 |

## Smoke test

From repo root (stack running):

```bash
./scripts/smoke-e2e.sh
```

Manual path: open http://localhost:3000 → create session → wait for `active` → interact via noVNC → start/stop recording → check Workflow tab → replay UI/API.
