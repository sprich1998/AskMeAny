# browser-session-runtime Specification

## Purpose
TBD - created by archiving change browser-worker-kickstart. Update Purpose after archive.
## Requirements
### Requirement: Consume browser launch jobs
The browser-worker SHALL consume BullMQ jobs from the `browser-launch` queue with `{ sessionId, startUrl }`, launch a Chromium page, navigate to `startUrl`, and register the page in an in-memory session manager.

#### Scenario: Launch job starts a browser session
- **WHEN** the worker receives a valid launch job
- **THEN** it launches Chromium, creates a page for the session, navigates to the URL, and patches the backend session to `active`

#### Scenario: Launch failure marks session as error
- **WHEN** Chromium launch or navigation fails
- **THEN** the worker patches the backend session to `error` and the job fails for retry

### Requirement: Mirror session lifecycle
The browser-worker SHALL periodically retrieve session state from the backend and close browser resources when a session enters `stopped` or `error`. When the worker tears down browser resources unexpectedly (process shutdown, crash, or lost page) it SHALL PATCH the backend session to `status: "error"` and clear `vncUrl`.

#### Scenario: Stopped session closes browser resources
- **WHEN** `GET /sessions/:id` returns `status: "stopped"`
- **THEN** the worker closes the Playwright context and removes the session from memory

#### Scenario: Worker teardown marks session error
- **WHEN** the worker closes a session's browser resources due to shutdown or runtime loss without an explicit user stop
- **THEN** it PATCHes the backend with `status: "error"` and `vncUrl: null`

