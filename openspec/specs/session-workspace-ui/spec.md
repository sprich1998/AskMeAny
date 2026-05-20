# session-workspace-ui Specification

## Purpose
TBD - created by archiving change frontend-kickstart. Update Purpose after archive.
## Requirements
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

#### Scenario: Status is active — start recording
- **WHEN** the session `status` is `"active"`
- **THEN** the "Start Recording" button is enabled and "Stop Recording" is disabled

#### Scenario: Status is recording — stop recording
- **WHEN** the session `status` is `"recording"`
- **THEN** the "Stop Recording" button is enabled and "Start Recording" is disabled; a recording indicator (pulsing red dot) is shown

#### Scenario: Start recording clicked
- **WHEN** the user clicks "Start Recording"
- **THEN** `apiClient.startRecording(sessionId)` is called and the UI optimistically transitions to recording state

#### Scenario: Stop recording clicked
- **WHEN** the user clicks "Stop Recording"
- **THEN** `apiClient.stopRecording(sessionId)` is called and the UI refreshes session state to `"active"`

### Requirement: Detail panel tab switching
The lower-right panel SHALL have three tabs: "Network", "Workflow", and "Replay". Clicking a tab switches the panel content.

#### Scenario: Default tab on load
- **WHEN** the workspace first loads
- **THEN** the "Network" tab is active by default

#### Scenario: Switching tabs
- **WHEN** the user clicks a different tab
- **THEN** the panel content switches to that tab's view without a page navigation

### Requirement: Browser pane embeds live noVNC stream
The left-side browser pane SHALL embed the remote Chromium display via noVNC when the session status is `"active"` or `"recording"`. The embed MUST use an iframe pointed at `{NEXT_PUBLIC_VNC_BASE_URL}/vnc.html` with autoconnect enabled so the user does not need to click Connect in a separate tab.

#### Scenario: Active session shows remote site
- **WHEN** the workspace loads and `getSession` returns `status: "active"`
- **THEN** the browser pane renders an embedded noVNC iframe showing the target website (not a static placeholder)

#### Scenario: Recording session keeps embed visible
- **WHEN** the session `status` is `"recording"`
- **THEN** the browser pane continues to show the embedded noVNC iframe

#### Scenario: Bootstrap loading state
- **WHEN** the session `status` is `"created"`
- **THEN** the browser pane shows "Starting remote browser…" until status becomes `active`

#### Scenario: Error session
- **WHEN** the session `status` is `"error"`
- **THEN** the browser pane shows an unavailable message with a link back to the launcher

