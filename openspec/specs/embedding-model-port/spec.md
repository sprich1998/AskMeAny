# embedding-model-port Specification

## Purpose
TBD - created by archiving change embedding-worker-kickstart. Update Purpose after archive.
## Requirements
### Requirement: EmbeddingClient port interface
The embedding-worker SHALL define an `EmbeddingClient` interface decoupled from any specific model:

```ts
interface EmbeddingClient {
  embed(text: string): Promise<number[]>;
}
```

Implementations live in `embedding-worker/src/embeddings/`. The queue job schema MUST NOT reference model name or vector size.

#### Scenario: Port accepts text and returns vector
- **WHEN** `embed()` is called with non-empty text
- **THEN** it returns a numeric array whose length matches the configured vector size

#### Scenario: Empty text is rejected
- **WHEN** `embed()` is called with empty or whitespace-only text
- **THEN** it throws an error before calling the model

### Requirement: V1 default implementation
The embedding-worker SHALL ship one default `EmbeddingClient` implementation selected during implementation (Ollama HTTP API or `@xenova/transformers` in Node).

#### Scenario: Model is configured via environment
- **WHEN** the worker starts
- **THEN** it reads embedding provider settings from environment variables documented in `.env.example`

#### Scenario: Model failure surfaces as job error
- **WHEN** the embedding provider returns an error or timeout
- **THEN** the job fails and BullMQ retries according to worker retry policy

### Requirement: Vector size is configurable
The embedding-worker SHALL expose vector dimension via environment configuration so it matches the Qdrant collection and chosen model.

#### Scenario: Vector length matches configured size
- **WHEN** a vector is generated for a valid text input
- **THEN** the returned array length equals `EMBEDDING_VECTOR_SIZE`

