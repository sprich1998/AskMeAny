## MODIFIED Requirements

### Requirement: Browser pane placeholder
The left-side browser pane SHALL mount the live noVNC embed when the session has `vnc_url` set. A placeholder SHALL appear only during bootstrap (`status === "created"`) or when the stream is unavailable after the configured timeout.

#### Scenario: Live stream mounted
- **WHEN** the workspace loads and polling returns `status: "active"` with a truthy `vnc_url`
- **THEN** the browser pane shows the embedded remote browser stream (not the static placeholder text)

#### Scenario: Bootstrap placeholder
- **WHEN** the workspace loads and the session `status` is `"created"`
- **THEN** the browser pane shows a loading indicator with label "Starting remote browser…"

#### Scenario: Unavailable stream
- **WHEN** the session `status` is `"active"` but `vnc_url` is falsy after the poll timeout
- **THEN** the browser pane shows "Remote browser stream is not available for this session" with recovery guidance
