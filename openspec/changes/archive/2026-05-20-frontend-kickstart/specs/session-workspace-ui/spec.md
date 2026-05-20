## ADDED Requirements

### Requirement: Session workspace layout
The session workspace at route `/session/[id]` SHALL render a three-column layout: browser pane on the left (~60% width), event timeline in the upper right, and a tab-switched detail panel in the lower right.

#### Scenario: Workspace renders for a valid session ID
- **WHEN** the user navigates to `/session/[id]` with a valid session ID
- **THEN** the workspace layout renders with all three regions visible

#### Scenario: Session not found
- **WHEN** `getSession(id)` rejects with a not-found error
- **THEN** a "Session not found" message is shown with a link back to the launcher

### Requirement: Recording controls bar
The workspace SHALL render a recording controls bar at the top showing the session's `start_url`, current `status`, and Start/Stop Recording buttons.

#### Scenario: Status is idle — start recording
- **WHEN** the session `status` is `"idle"`
- **THEN** the "Start Recording" button is enabled and "Stop Recording" is disabled

#### Scenario: Status is recording — stop recording
- **WHEN** the session `status` is `"recording"`
- **THEN** the "Stop Recording" button is enabled and "Start Recording" is disabled; a recording indicator (pulsing red dot) is shown

#### Scenario: Start recording clicked
- **WHEN** the user clicks "Start Recording"
- **THEN** `apiClient.startRecording(sessionId)` is called and the UI optimistically transitions to recording state

#### Scenario: Stop recording clicked
- **WHEN** the user clicks "Stop Recording"
- **THEN** `apiClient.stopRecording(sessionId)` is called and the UI optimistically transitions to idle state

### Requirement: Browser pane placeholder
The left-side browser pane SHALL render a placeholder that clearly communicates that the live noVNC stream will mount here.

#### Scenario: Placeholder rendered
- **WHEN** the workspace loads
- **THEN** the browser pane shows a bordered placeholder with the label "Remote browser" and a note "noVNC stream will appear here when backend is connected"

### Requirement: Detail panel tab switching
The lower-right panel SHALL have three tabs: "Network", "Workflow", and "Replay". Clicking a tab switches the panel content.

#### Scenario: Default tab on load
- **WHEN** the workspace first loads
- **THEN** the "Network" tab is active by default

#### Scenario: Switching tabs
- **WHEN** the user clicks a different tab
- **THEN** the panel content switches to that tab's view without a page navigation
