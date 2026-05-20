# interaction-similarity-search Specification

## Purpose
TBD - created by archiving change v1-e2e-product-loop. Update Purpose after archive.
## Requirements
### Requirement: Search similar interactions via API
The backend SHALL expose `POST /interactions/search` that accepts a natural-language `query` string and returns ranked similar past interactions.

Request body schema:
```ts
{ query: string; limit?: number }  // limit default 5, max 20
```

Response body schema:
```ts
{
  results: Array<{
    actionId: string
    sessionId: string
    score: number
    label: string | null
    requestMethod: string | null
    requestUrl: string | null
    inferredIntent: string | null
  }>
  total: number
}
```

#### Scenario: Query returns ranked results
- **WHEN** `POST /interactions/search` is called with `{ "query": "search client by id" }` and Qdrant contains matching vectors
- **THEN** the system returns HTTP 200 with `results` ordered by descending `score`

#### Scenario: Empty index returns empty results
- **WHEN** Qdrant has no points in `interaction_memory`
- **THEN** the system returns HTTP 200 with `{ "results": [], "total": 0 }`

#### Scenario: Embedding service unavailable
- **WHEN** the embedding provider (Ollama) is unreachable
- **THEN** the system returns HTTP 503 with `{ "error": "Embedding service unavailable", "code": "SERVICE_UNAVAILABLE" }`

### Requirement: Search uses Qdrant interaction_memory collection
The backend SHALL query the `interaction_memory` Qdrant collection and MUST NOT treat Qdrant as source of truth for action facts.

#### Scenario: Results hydrate from Postgres
- **WHEN** Qdrant returns payload `action_id` hits
- **THEN** response fields are consistent with Postgres `actions`, `network_events`, and `intents` where present

### Requirement: Search query is embedded with configured model
The backend SHALL embed the search `query` using the same vector dimension as the `interaction_memory` collection (`EMBEDDING_VECTOR_SIZE`).

#### Scenario: Vector dimension mismatch fails fast
- **WHEN** the embedding vector length does not match the Qdrant collection size
- **THEN** the system returns HTTP 500 with a structured error and does not return partial results

