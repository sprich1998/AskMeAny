## REMOVED Requirements

### Requirement: Browser pane placeholder
**Reason**: Replaced by live noVNC integration when `vncUrl` is available.
**Migration**: Browser pane mounts noVNC client; placeholder only shown when `vncUrl` is null.

## ADDED Requirements

### Requirement: Browser pane mounts noVNC when vncUrl is present
The left-side browser pane SHALL mount a noVNC client connected to `session.vncUrl` when the session status is `active` or `recording` and `vncUrl` is non-null.

#### Scenario: Live stream displayed
- **WHEN** the workspace loads and `getSession` returns `status: "active"` with a valid `vncUrl`
- **THEN** the browser pane renders the noVNC canvas filling the pane height without the placeholder message

#### Scenario: Placeholder when stream unavailable
- **WHEN** `vncUrl` is null and status is `created`
- **THEN** the browser pane shows a short waiting message (e.g. "Starting remote browser…") instead of a broken noVNC connection

#### Scenario: Stream reconnects after poll
- **WHEN** session polling transitions from `created` to `active` and `vncUrl` becomes available
- **THEN** the noVNC client mounts without requiring a full page reload

### Requirement: noVNC connection uses environment-safe host
The frontend SHALL connect to `vncUrl` from the API response without rewriting the host, so Docker and local dev work when the backend supplies the correct public URL.

#### Scenario: Uses API-provided vncUrl
- **WHEN** `getSession` returns `vncUrl: "ws://localhost:6080/..."`
- **THEN** the noVNC client connects to that exact URL
