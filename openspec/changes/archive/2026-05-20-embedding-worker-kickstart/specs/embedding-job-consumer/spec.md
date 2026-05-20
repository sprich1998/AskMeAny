## ADDED Requirements

### Requirement: Consume embed interaction jobs
The embedding-worker SHALL consume BullMQ jobs from the `embed-interaction` queue with a payload matching `EmbedInteractionJobPayloadSchema`:

```ts
{
  sessionId: string;      // UUID
  actionId: string;       // UUID
  networkEventId?: string;  // UUID | null
  timestamp?: string;       // ISO datetime
}
```

#### Scenario: Valid job is processed end-to-end
- **WHEN** the worker receives a valid embed job
- **THEN** it loads interaction facts from Postgres, builds embedding text, generates a vector, and upserts into Qdrant `interaction_memory`

#### Scenario: Invalid payload fails fast
- **WHEN** the job payload does not match `EmbedInteractionJobPayloadSchema`
- **THEN** the job fails with a validation error and is not retried indefinitely without correction

### Requirement: Jobs are idempotent
The embedding-worker SHALL treat embed jobs as idempotent using `action_id` as the Qdrant point identifier.

#### Scenario: Retry overwrites existing point
- **WHEN** the same `actionId` is processed more than once
- **THEN** Qdrant contains exactly one point for that `action_id` with the latest vector and payload

### Requirement: Log job lifecycle
The embedding-worker SHALL log job ID, `session_id`, and `action_id` at job start and completion.

#### Scenario: Successful job logs completion
- **WHEN** a job completes successfully
- **THEN** the worker logs the job ID, `session_id`, `action_id`, and Qdrant point ID

#### Scenario: Failed job logs error context
- **WHEN** a job fails during processing
- **THEN** the worker logs the job ID, `session_id`, `action_id`, and error message before rethrowing for BullMQ retry

### Requirement: Missing action fails the job
The embedding-worker SHALL fail the job when the referenced action does not exist in Postgres.

#### Scenario: Action not found
- **WHEN** `actionId` does not exist in the `actions` table
- **THEN** the job fails with a not-found error suitable for BullMQ retry or dead-letter handling
