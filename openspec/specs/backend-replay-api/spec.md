# backend-replay-api Specification

## Purpose
TBD - created by archiving change backend-kickstart. Update Purpose after archive.
## Requirements
### Requirement: Trigger workflow replay
The system SHALL accept `POST /workflows/:id/replay` and enqueue a `replay-session` BullMQ job. The endpoint MUST return immediately with an accepted response; it SHALL NOT wait for the replay to complete. The payload MUST include a `replayId` (new UUID) that the caller can use to track replay progress (via WebSocket in future changes).

Request body schema:
```ts
{
  mode: "ui" | "api"   // "ui" = drive browser via Playwright; "api" = call API directly
}
```

Response body schema:
```ts
{
  accepted: true
  replayId: string     // UUID for tracking this specific replay run
  workflowId: string
  mode: "ui" | "api"
}
```

The BullMQ job payload (defined in `@teachmeany/shared/src/schemas/replay-job.schema.ts`):
```ts
{
  replayId: string
  workflowId: string
  sessionId: string
  mode: "ui" | "api"
}
```

#### Scenario: Replay is accepted and job is enqueued
- **WHEN** `POST /workflows/:id/replay` is called with `{ "mode": "ui" }`
- **THEN** the system enqueues a `replay-session` job on the BullMQ queue, returns HTTP 202 with `{ "accepted": true, "replayId": "...", "workflowId": "...", "mode": "ui" }`

#### Scenario: Invalid mode is rejected
- **WHEN** `POST /workflows/:id/replay` is called with `{ "mode": "browser" }` (invalid value)
- **THEN** the system returns HTTP 400 with `{ "error": "Validation failed", "code": "INVALID_INPUT" }`

#### Scenario: Non-existent workflow returns 404
- **WHEN** `POST /workflows/:id/replay` is called with an unknown workflow UUID
- **THEN** the system returns HTTP 404 with `{ "error": "Workflow not found", "code": "NOT_FOUND" }`

#### Scenario: Missing mode defaults gracefully
- **WHEN** `POST /workflows/:id/replay` is called with an empty body `{}`
- **THEN** the system returns HTTP 400 with `{ "error": "Validation failed", "code": "INVALID_INPUT" }` (mode is required)
