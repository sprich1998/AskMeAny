## ADDED Requirements

### Requirement: Start recording a session
The system SHALL accept `POST /sessions/:id/recording/start` and transition the session status from `active` to `recording`. The response SHALL confirm the new status.

A session MUST be in `active` status before recording can start. The backend sets the status in Postgres; it does not directly control the browser-worker (that communication path is owned by browser-worker's change).

#### Scenario: Active session transitions to recording
- **WHEN** `POST /sessions/:id/recording/start` is called on a session with `status = 'active'`
- **THEN** the system sets `status = 'recording'` in Postgres and returns HTTP 200 with `{ "sessionId": "...", "status": "recording" }`

#### Scenario: Recording on a non-active session returns 409
- **WHEN** `POST /sessions/:id/recording/start` is called on a session already in `recording` status
- **THEN** the system returns HTTP 409 with `{ "error": "Session is already recording", "code": "INVALID_STATE" }`

#### Scenario: Recording on a stopped session returns 409
- **WHEN** `POST /sessions/:id/recording/start` is called on a session with `status = 'stopped'`
- **THEN** the system returns HTTP 409 with `{ "error": "Session is stopped", "code": "INVALID_STATE" }`

#### Scenario: Non-existent session returns 404
- **WHEN** `POST /sessions/:id/recording/start` is called with an unknown session UUID
- **THEN** the system returns HTTP 404 with `{ "error": "Session not found", "code": "NOT_FOUND" }`

---

### Requirement: Stop recording a session
The system SHALL accept `POST /sessions/:id/recording/stop` and transition the session status from `recording` back to `active`.

#### Scenario: Recording session transitions to active
- **WHEN** `POST /sessions/:id/recording/stop` is called on a session with `status = 'recording'`
- **THEN** the system sets `status = 'active'` in Postgres and returns HTTP 200 with `{ "sessionId": "...", "status": "active" }`

#### Scenario: Stopping a non-recording session returns 409
- **WHEN** `POST /sessions/:id/recording/stop` is called on a session not in `recording` status
- **THEN** the system returns HTTP 409 with `{ "error": "Session is not recording", "code": "INVALID_STATE" }`
