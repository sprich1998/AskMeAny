# backend-workflows-api Specification

## Purpose
TBD - created by archiving change backend-kickstart. Update Purpose after archive.
## Requirements
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

### Requirement: Workflow steps expose replay selectors via action join
`GET /workflows/:id` step objects SHALL include fields needed for UI replay: at minimum `stepType`, `apiEquivalent`, and action-derived `selector` and `value` when the step references an `action_id`.

Extended step schema (additive fields):
```ts
{
  id: string
  workflowId: string
  actionId: string
  orderIndex: number
  stepType: string
  apiEquivalent: { method: string; url: string; body: unknown } | null
  selector: string | null      // from actions.selector
  value: unknown | null        // from actions.value JSONB
}
```

#### Scenario: Click step includes selector
- **WHEN** `GET /workflows/:id` is called for a workflow whose step references a click action with selector `button[data-testid='search']`
- **THEN** that step includes `selector` equal to the stored action selector

#### Scenario: Fill step includes value
- **WHEN** a workflow step references an input action with `value` JSONB
- **THEN** the step response includes that `value` for replay UI

### Requirement: Workflows appear after stop recording without manual seeding
After workflow extraction runs on stop recording, `GET /sessions/:id/workflows` SHALL return the newly created workflow without requiring direct database seeding.

#### Scenario: Workflow visible after stop
- **WHEN** a user stops recording after capturing at least one action
- **THEN** `GET /sessions/:id/workflows` returns HTTP 200 with `total >= 1` within the same request flow as the stop response (or on immediate subsequent GET)

