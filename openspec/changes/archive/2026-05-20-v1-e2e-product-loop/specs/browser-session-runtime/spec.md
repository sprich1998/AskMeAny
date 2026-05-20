## MODIFIED Requirements

### Requirement: Consume browser launch jobs
The browser-worker SHALL consume BullMQ jobs from the `browser-launch` queue with `{ sessionId, startUrl }`, start the VNC display stack, launch Chromium on the virtual display, navigate to `startUrl`, register the page in an in-memory session manager, and PATCH the backend with `status: "active"` and a non-null `vncUrl`.

#### Scenario: Launch job starts a browser session
- **WHEN** the worker receives a valid launch job
- **THEN** it starts VNC, launches Chromium, creates a page for the session, navigates to the URL, patches the backend session to `active` with `vncUrl`, and registers the handle in memory

#### Scenario: Launch failure marks session as error
- **WHEN** Chromium launch, VNC startup, or navigation fails
- **THEN** the worker patches the backend session to `error` and the job fails for retry

## ADDED Requirements

### Requirement: Teardown clears vncUrl
When browser resources close, the browser-worker SHALL PATCH the backend so `vncUrl` is cleared.

#### Scenario: Stopped session clears stream URL
- **WHEN** the worker closes a session because status is `stopped`
- **THEN** the backend session no longer exposes a `vncUrl` on subsequent GET requests
