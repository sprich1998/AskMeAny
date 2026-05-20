## MODIFIED Requirements

### Requirement: UI replay trigger
Clicking "Replay via UI" SHALL call `apiClient.triggerReplay(workflowId, 'ui')` and show the acceptance result for V1 (replay runs asynchronously in the browser-worker).

#### Scenario: UI replay initiated
- **WHEN** the user clicks "Replay via UI"
- **THEN** the button shows a loading state and `triggerReplay(workflowId, 'ui')` is called

#### Scenario: UI replay queued result shown
- **WHEN** `triggerReplay` resolves with HTTP 202 acceptance (`status: "accepted"`, `replay_id` present)
- **THEN** a result card shows "Replay queued" with the `replay_id` rather than implying immediate DOM success

#### Scenario: UI replay request failure
- **WHEN** `triggerReplay` rejects with a network or API error
- **THEN** an error state is shown: "Replay failed: [error message]"

### Requirement: API equivalent trigger
Clicking "Call API directly" SHALL call `apiClient.triggerReplay(workflowId, 'api')` and show the acceptance result for V1.

#### Scenario: API replay initiated
- **WHEN** the user clicks "Call API directly"
- **THEN** the button shows a loading state and `triggerReplay(workflowId, 'api')` is called

#### Scenario: API replay queued result shown
- **WHEN** `triggerReplay` resolves with acceptance
- **THEN** a result card shows "API replay queued" with `replay_id`

## ADDED Requirements

### Requirement: Replay requires extracted workflow
The replay panel SHALL disable replay buttons when the session has no workflows, with copy directing the user to record and stop recording first.

#### Scenario: No workflows disables replay
- **WHEN** `getWorkflows(sessionId)` returns an empty list
- **THEN** replay buttons are disabled and the message reads "Record a workflow first (stop recording to extract)"
