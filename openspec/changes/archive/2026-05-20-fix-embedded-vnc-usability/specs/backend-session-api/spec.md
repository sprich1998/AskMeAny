## MODIFIED Requirements

### Requirement: Retrieve a browser session
The system SHALL accept `GET /sessions/:id` and return the current state of that session. When a browser runtime is attached, the response SHALL include optional `vncUrl` (WebSocket URL for the noVNC stream).

Response body schema (fields shown; others unchanged):
```ts
{
  id: string
  startUrl: string
  currentUrl: string
  status: "created" | "active" | "recording" | "stopped" | "error"
  vncUrl?: string | null   // present when browser-worker has active VNC
  createdAt: string
}
```

#### Scenario: Existing session is returned
- **WHEN** `GET /sessions/:id` is called with a valid session UUID
- **THEN** the system returns HTTP 200 with the full session object

#### Scenario: Active session includes vncUrl
- **WHEN** `GET /sessions/:id` is called for a session with an attached browser runtime
- **THEN** the response includes `vncUrl` as a non-null WebSocket URL string

#### Scenario: Session without runtime omits or nulls vncUrl
- **WHEN** `GET /sessions/:id` is called for a session in `created` or `error` state without runtime
- **THEN** `vncUrl` is `null` or omitted

#### Scenario: Non-existent session returns 404
- **WHEN** `GET /sessions/:id` is called with a UUID that does not exist in Postgres
- **THEN** the system returns HTTP 404 with `{ "error": "Session not found", "code": "NOT_FOUND" }`

#### Scenario: Malformed UUID returns 400
- **WHEN** `GET /sessions/:id` is called with a non-UUID string
- **THEN** the system returns HTTP 400 with `{ "error": "Validation failed", "code": "INVALID_INPUT" }`
