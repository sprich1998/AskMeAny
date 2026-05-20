## REMOVED Requirements

### Requirement: Browser pane placeholder
**Reason**: Replaced by live noVNC iframe embed for active/recording sessions (shipped in fix-embedded-vnc-usability).
**Migration**: Browser pane shows iframe when status is `active` or `recording`; loading state only for `created`.

## ADDED Requirements

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

## MODIFIED Requirements

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
