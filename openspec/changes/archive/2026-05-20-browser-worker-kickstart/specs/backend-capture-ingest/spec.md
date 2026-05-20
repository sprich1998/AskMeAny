## ADDED Requirements

### Requirement: Enqueue browser launch on session creation
The backend SHALL enqueue a `browser-launch` BullMQ job when `POST /sessions` successfully creates a browser session.

#### Scenario: Session creation schedules worker launch
- **WHEN** `POST /sessions` returns HTTP 201
- **THEN** the backend enqueues `{ sessionId, startUrl }` on `browser-launch`

### Requirement: Accept runtime session updates
The backend SHALL accept `PATCH /sessions/:id` from the browser-worker with optional `status` and `currentUrl` fields.

#### Scenario: Worker marks session active
- **WHEN** the worker patches a valid session with `{ "status": "active" }`
- **THEN** the backend updates the session and returns the full session object

### Requirement: Ingest captured interaction bundles
The backend SHALL accept `POST /sessions/:id/ingest` with an action, optional network event, optional intent, and optional DOM mutation.

#### Scenario: Correlated bundle is persisted
- **WHEN** a valid ingest bundle includes action and network event data
- **THEN** the backend inserts the action, inserts the network event linked to the action, publishes timeline events for both records, and enqueues an embed interaction job

#### Scenario: Invalid session is rejected
- **WHEN** the session ID does not exist
- **THEN** the backend returns HTTP 404 with `{ "error": "Session not found", "code": "NOT_FOUND" }`

#### Scenario: Invalid payload is rejected
- **WHEN** the request body does not match the shared ingest schema
- **THEN** the backend returns HTTP 400 with `{ "error": "Validation failed", "code": "INVALID_INPUT" }`
