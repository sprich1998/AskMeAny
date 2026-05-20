## MODIFIED Requirements

### Requirement: Mirror session lifecycle
The browser-worker SHALL periodically retrieve session state from the backend and close browser resources when a session enters `stopped` or `error`. When the worker tears down browser resources unexpectedly (process shutdown, crash, or lost page) it SHALL PATCH the backend session to `status: "error"` and clear `vncUrl`.

#### Scenario: Stopped session closes browser resources
- **WHEN** `GET /sessions/:id` returns `status: "stopped"`
- **THEN** the worker closes the Playwright context and removes the session from memory

#### Scenario: Worker teardown marks session error
- **WHEN** the worker closes a session's browser resources due to shutdown or runtime loss without an explicit user stop
- **THEN** it PATCHes the backend with `status: "error"` and `vncUrl: null`
