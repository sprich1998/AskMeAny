## ADDED Requirements

### Requirement: Recording POST accepts empty body
The recording start and stop endpoints SHALL accept `POST` requests with no request body or with an empty JSON object `{}`. The server MUST NOT reject valid session IDs solely because the client omitted a JSON body.

#### Scenario: Start recording with no body
- **WHEN** `POST /sessions/:id/recording/start` is called on an active session with no `Content-Type` header or with `Content-Type: application/json` and body `{}`
- **THEN** the system returns HTTP 200 with `{ "sessionId": "...", "status": "recording" }`

#### Scenario: Stop recording with no body
- **WHEN** `POST /sessions/:id/recording/stop` is called on a recording session with no body or body `{}`
- **THEN** the system returns HTTP 200 with `{ "sessionId": "...", "status": "active", ... }`
