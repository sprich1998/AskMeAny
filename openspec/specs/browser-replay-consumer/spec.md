# browser-replay-consumer Specification

## Purpose
TBD - created by archiving change browser-worker-kickstart. Update Purpose after archive.
## Requirements
### Requirement: Consume replay-session jobs
The browser-worker SHALL consume BullMQ jobs from the `replay-session` queue and acknowledge valid replay requests.

#### Scenario: Replay job is accepted
- **WHEN** the worker receives a valid replay job
- **THEN** it validates the payload, logs the replay ID, workflow ID, session ID, and mode, and completes the job

### Requirement: Execute simple UI replay when possible
The browser-worker SHALL attempt a narrow UI replay for workflow steps that include `fill` or `click` selectors and an active page for the session.

#### Scenario: Fill and click steps are executed
- **WHEN** a replay job references a workflow artifact with stored UI replay steps and the session page is active
- **THEN** the worker applies `fill` and `click` steps in order

#### Scenario: Missing page is a controlled failure
- **WHEN** no active page exists for the replay session
- **THEN** the worker logs a controlled error and fails the job for retry
