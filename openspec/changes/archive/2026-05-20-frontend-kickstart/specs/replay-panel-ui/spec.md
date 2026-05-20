## ADDED Requirements

### Requirement: Replay mode selection
The replay panel SHALL display two clearly labelled trigger options for a selected workflow: "Replay via UI" and "Call API directly".

#### Scenario: No workflow selected
- **WHEN** the replay panel is open but no workflow is selected
- **THEN** both replay buttons are disabled and a message reads "Select a workflow to replay"

#### Scenario: Workflow selected — buttons enabled
- **WHEN** a workflow is selected
- **THEN** both "Replay via UI" and "Call API directly" buttons are enabled

### Requirement: UI replay trigger
Clicking "Replay via UI" SHALL call `apiClient.triggerReplay(workflowId, 'ui')` and show the result.

#### Scenario: UI replay initiated
- **WHEN** the user clicks "Replay via UI"
- **THEN** the button shows a loading state and `triggerReplay(workflowId, 'ui')` is called

#### Scenario: UI replay result shown
- **WHEN** `triggerReplay` resolves with a `ReplayResult`
- **THEN** a result card is shown with `status` ("success" or "failure"), elapsed time, and any error message

#### Scenario: UI replay failure
- **WHEN** `triggerReplay` rejects
- **THEN** an error state is shown: "Replay failed: [error message]"

### Requirement: API equivalent trigger
Clicking "Call API directly" SHALL call `apiClient.triggerReplay(workflowId, 'api')` and show the result.

#### Scenario: API replay initiated
- **WHEN** the user clicks "Call API directly"
- **THEN** the button shows a loading state and `triggerReplay(workflowId, 'api')` is called

#### Scenario: API replay result shown
- **WHEN** `triggerReplay` resolves
- **THEN** a result card is shown with HTTP status, response body, and elapsed time

### Requirement: Side-by-side result comparison
After both replay modes have been run, the panel SHALL display the two results side by side for comparison.

#### Scenario: Both results available
- **WHEN** both UI and API results are available
- **THEN** they are shown in a two-column layout with a visual match/mismatch indicator
