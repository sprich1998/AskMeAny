## ADDED Requirements

### Requirement: Retrieve workflows for a session
The system SHALL accept `GET /sessions/:id/workflows` and return all workflow records for the given session, ordered by `created_at` descending.

Response body schema:
```ts
{
  workflows: Array<{
    id: string          // UUID
    sessionId: string   // UUID
    name: string
    description: string
    createdAt: string   // ISO 8601
    stepCount: number   // derived from workflow_steps count
  }>
  total: number
}
```

#### Scenario: Workflows are returned for a session
- **WHEN** `GET /sessions/:id/workflows` is called for a session with extracted workflows
- **THEN** the system returns HTTP 200 with a `workflows` array ordered by `created_at` descending

#### Scenario: No workflows returns empty array
- **WHEN** `GET /sessions/:id/workflows` is called for a session with no workflows yet
- **THEN** the system returns HTTP 200 with `{ "workflows": [], "total": 0 }`

#### Scenario: Non-existent session returns 404
- **WHEN** `GET /sessions/:id/workflows` is called with an unknown session UUID
- **THEN** the system returns HTTP 404 with `{ "error": "Session not found", "code": "NOT_FOUND" }`

---

### Requirement: Retrieve a single workflow with steps
The system SHALL accept `GET /workflows/:id` and return the workflow record with its full ordered list of steps. Each step MUST include the `apiEquivalent` JSONB field so the frontend can display the dual-path output.

Response body schema:
```ts
{
  id: string
  sessionId: string
  name: string
  description: string
  createdAt: string
  steps: Array<{
    id: string
    workflowId: string
    actionId: string
    orderIndex: number
    stepType: string           // "click" | "fill" | "navigate" | etc.
    apiEquivalent: {           // JSONB — null if not yet computed
      method: string
      url: string
      body: unknown
    } | null
  }>
}
```

#### Scenario: Workflow is returned with steps
- **WHEN** `GET /workflows/:id` is called with a valid workflow UUID
- **THEN** the system returns HTTP 200 with the workflow and its `steps` array ordered by `orderIndex` ascending

#### Scenario: Non-existent workflow returns 404
- **WHEN** `GET /workflows/:id` is called with an unknown UUID
- **THEN** the system returns HTTP 404 with `{ "error": "Workflow not found", "code": "NOT_FOUND" }`
