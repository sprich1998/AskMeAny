## ADDED Requirements

### Requirement: VNC base URL configuration
The frontend SHALL read a browser-reachable noVNC HTTP base URL from `NEXT_PUBLIC_VNC_BASE_URL` (default `http://localhost:6080`). This URL MUST be used for embedding the remote display in the session workspace and MUST NOT rely on Docker-internal hostnames.

#### Scenario: Default local compose URL
- **WHEN** `NEXT_PUBLIC_VNC_BASE_URL` is unset
- **THEN** the embedded VNC client uses `http://localhost:6080` as the iframe base URL

#### Scenario: Compose override
- **WHEN** `NEXT_PUBLIC_VNC_BASE_URL=http://localhost:6080` is set in the frontend service environment
- **THEN** the iframe `src` is built from that base URL

---

### Requirement: Embed remote browser stream
The session workspace SHALL embed the live noVNC stream when the session has a browser runtime attached. The embed MUST use the configured VNC base URL and MUST auto-connect without requiring the user to open a separate browser tab.

#### Scenario: Active session with stream
- **WHEN** `getSession(id)` returns `status: "active"` and a truthy `vnc_url` (mapped from API `vncUrl`)
- **THEN** the browser pane renders an embedded noVNC view (iframe or equivalent) instead of the unavailable placeholder

#### Scenario: Bootstrap state
- **WHEN** `getSession(id)` returns `status: "created"`
- **THEN** the browser pane shows a loading state ("Starting remote browser…") and continues polling

#### Scenario: Stream failure after timeout
- **WHEN** `status` is `"active"` but `vnc_url` remains falsy for longer than the configured poll timeout (default 60 seconds)
- **THEN** the browser pane shows an error with guidance to create a new session and an optional link to the standalone VNC page

#### Scenario: Session error state
- **WHEN** `getSession(id)` returns `status: "error"`
- **THEN** the browser pane shows an error message and a link back to the session launcher

---

### Requirement: Embed must not break workspace layout
The embedded VNC view SHALL fill the browser pane region (width and height) with `resize=scale` or equivalent so the remote desktop is visible without horizontal page scroll in the workspace.

#### Scenario: Pane dimensions
- **WHEN** the embedded stream is shown
- **THEN** it occupies the full bordered browser pane area in the three-column layout
