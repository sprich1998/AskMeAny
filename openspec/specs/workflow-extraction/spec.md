# workflow-extraction Specification

## Purpose
TBD - created by archiving change v1-e2e-product-loop. Update Purpose after archive.
## Requirements
### Requirement: Extract workflow on stop recording
When `POST /sessions/:id/recording/stop` completes successfully, the backend SHALL run a deterministic workflow extractor that creates at least one `workflows` row and ordered `workflow_steps` for that session from captured `actions`.

#### Scenario: Stop recording produces a workflow
- **WHEN** a session has one or more recorded `actions` and recording is stopped
- **THEN** `GET /sessions/:id/workflows` returns at least one workflow with `stepCount` matching the number of included actions

#### Scenario: Empty recording produces no workflow
- **WHEN** recording is stopped and the session has zero `actions`
- **THEN** no workflow row is created and `GET /sessions/:id/workflows` returns an empty array

### Requirement: Workflow steps include api_equivalent
Each `workflow_step` for an action with a correlated `network_event` SHALL store `api_equivalent` JSONB with `method`, `url`, and `body` derived from the captured request.

#### Scenario: Correlated POST step has api_equivalent
- **WHEN** an action has a correlated `network_event` with method `POST` and a JSON request body
- **THEN** the corresponding workflow step has non-null `api_equivalent` matching that method, url, and body shape

#### Scenario: Uncorrelated action step has null api_equivalent
- **WHEN** an action has no correlated `network_event`
- **THEN** the workflow step is still created with `api_equivalent: null`

### Requirement: Workflow steps preserve action order
Workflow steps SHALL be ordered by `order_index` ascending matching the chronological order of `actions.timestamp` for the session.

#### Scenario: Steps ordered by capture time
- **WHEN** three actions were captured at times T1 < T2 < T3
- **THEN** workflow steps have `order_index` 0, 1, 2 referencing those actions respectively

### Requirement: Workflow step types map from actions
Each workflow step `step_type` SHALL reflect the source action type (`click`, `fill`, or `input` mapped to `fill`).

#### Scenario: Click action becomes click step
- **WHEN** the source action `type` is `click`
- **THEN** the workflow step `step_type` is `click`

#### Scenario: Input action becomes fill step
- **WHEN** the source action `type` is `input`
- **THEN** the workflow step `step_type` is `fill`

### Requirement: Workflow metadata is human-readable
The extractor SHALL set workflow `name` and `description` from session context (e.g. page URL host and action count) without requiring LLM inference.

#### Scenario: Default workflow name
- **WHEN** a workflow is extracted for a session that recorded actions on `https://app.example.com/form`
- **THEN** the workflow `name` is non-empty and references the session or host in a readable form

