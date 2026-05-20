## ADDED Requirements

### Requirement: Embed remote browser stream
The session workspace SHALL embed the live noVNC stream when the session status is `"active"` or `"recording"`. The embed MUST use the configured VNC base URL and MUST auto-connect without requiring the user to open a separate browser tab or click Connect on the standalone vnc.html page.

#### Scenario: Active session shows embed
- **WHEN** `getSession(id)` returns `status: "active"`
- **THEN** the browser pane renders an embedded noVNC iframe at `{NEXT_PUBLIC_VNC_BASE_URL}/vnc.html?autoconnect=true&resize=scale` (or equivalent)

#### Scenario: Bootstrap state
- **WHEN** `getSession(id)` returns `status: "created"`
- **THEN** the browser pane shows a loading state ("Starting remote browser…") and continues polling until `active`

#### Scenario: Session error state
- **WHEN** `getSession(id)` returns `status: "error"`
- **THEN** the browser pane shows an error message and a link back to the session launcher

#### Scenario: Standalone vnc.html without autoconnect
- **WHEN** a user opens `http://localhost:6080/vnc.html` directly without query parameters
- **THEN** they MAY need to click Connect manually (expected for standalone debug use); the embedded app MUST NOT require this step

### Requirement: VNC base URL configuration
The frontend SHALL read a browser-reachable noVNC HTTP base URL from `NEXT_PUBLIC_VNC_BASE_URL` (default `http://localhost:6080`). This URL MUST be used for embedding the remote display in the session workspace.

#### Scenario: Default local compose URL
- **WHEN** `NEXT_PUBLIC_VNC_BASE_URL` is unset
- **THEN** the embedded VNC client uses `http://localhost:6080` as the iframe base URL

#### Scenario: Embed fills browser pane
- **WHEN** the embedded stream is shown
- **THEN** it occupies the full bordered browser pane area with `resize=scale` or equivalent
