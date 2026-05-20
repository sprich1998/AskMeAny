# embedding-qdrant-store Specification

## Purpose
TBD - created by archiving change embedding-worker-kickstart. Update Purpose after archive.
## Requirements
### Requirement: Ensure interaction_memory collection
The embedding-worker SHALL ensure the Qdrant collection `interaction_memory` exists on startup.

Collection configuration:
- **Name:** `interaction_memory` (constant in `packages/shared`)
- **Vector size:** configurable via `EMBEDDING_VECTOR_SIZE` environment variable
- **Distance:** Cosine

#### Scenario: Collection created on first start
- **WHEN** the worker starts and `interaction_memory` does not exist
- **THEN** it creates the collection with the configured vector size

#### Scenario: Existing collection is reused
- **WHEN** the worker starts and `interaction_memory` already exists with matching vector size
- **THEN** startup succeeds without recreating the collection

### Requirement: Upsert vector with required payload
The embedding-worker SHALL upsert each interaction as a Qdrant point with point ID equal to `action_id`.

Payload fields (all required when data exists; nullable when source data is absent):

```ts
{
  action_id: string;        // UUID
  session_id: string;       // UUID
  url: string;              // session current_url or start_url
  action_type: string;      // e.g. "click", "input"
  label: string;            // action label
  request_method: string | null;
  request_url: string | null;
  inferred_intent: string | null;  // intent name or description
}
```

#### Scenario: Correlated interaction upserts full payload
- **WHEN** action, network event, and intent are present
- **THEN** the Qdrant point includes all payload fields with network and intent values populated

#### Scenario: Uncorrelated interaction upserts with null network fields
- **WHEN** no network event is linked
- **THEN** `request_method` and `request_url` are null

#### Scenario: Upsert is idempotent by action_id
- **WHEN** the same `action_id` is upserted twice
- **THEN** Qdrant retains one point with the latest vector and payload

### Requirement: Qdrant client is configured via environment
The embedding-worker SHALL connect to Qdrant using `QDRANT_URL` (default `http://localhost:6333`).

#### Scenario: Connection failure fails startup
- **WHEN** Qdrant is unreachable at startup
- **THEN** the worker fails to start with a clear connection error

