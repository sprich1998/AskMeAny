## MODIFIED Requirements

### Requirement: Consume replay-session jobs
The browser-worker SHALL consume BullMQ jobs from the `replay-session` queue, validate payloads, execute replay for the requested `mode`, and complete or fail the job based on execution outcome.

#### Scenario: Replay job is accepted and executed
- **WHEN** the worker receives a valid replay job with `mode: "ui"` or `mode: "api"`
- **THEN** it loads the workflow with steps, executes replay, logs `replayId`, `workflowId`, `sessionId`, and `mode`, and completes the job on success

#### Scenario: Invalid payload fails the job
- **WHEN** the replay job payload fails schema validation
- **THEN** the job fails without mutating the browser session

### Requirement: Execute simple UI replay when possible
The browser-worker SHALL execute UI replay by applying `fill` and `click` steps using selectors and values loaded from the referenced `actions` rows for each `workflow_step`, in `order_index` order, on the active Playwright page for the session.

#### Scenario: Fill and click steps are executed
- **WHEN** a replay job has `mode: "ui"`, an active page exists, and workflow steps include fill and click types with resolvable selectors
- **THEN** the worker applies each step in order and waits for network settle after steps that have `api_equivalent`

#### Scenario: Missing page is a controlled failure
- **WHEN** no active page exists for the replay session
- **THEN** the worker logs a controlled error and fails the job for retry

#### Scenario: Missing selector fails the job
- **WHEN** a step references an action whose selector does not match any element within a timeout
- **THEN** the job fails with an error describing the step `order_index`

## ADDED Requirements

### Requirement: Execute API replay mode
When `mode` is `api`, the browser-worker SHALL invoke HTTP requests from each step's `api_equivalent` without driving the DOM.

#### Scenario: API steps use stored api_equivalent
- **WHEN** a replay job has `mode: "api"` and steps include non-null `api_equivalent`
- **THEN** the worker issues HTTP requests with the stored method, url, and body for each such step in order

#### Scenario: API step without api_equivalent is skipped with warning
- **WHEN** a step has null `api_equivalent` during API replay
- **THEN** the worker logs a warning and continues with remaining steps

#### Scenario: API replay completes successfully
- **WHEN** all API steps return responses without thrown network errors
- **THEN** the replay job completes successfully
