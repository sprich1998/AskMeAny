## ADDED Requirements

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
