# backend-session-api Specification

## Purpose
TBD - created by archiving change backend-kickstart. Update Purpose after archive.
## Requirements
### Requirement: Create a browser session
The system SHALL accept a `POST /sessions` request with a `startUrl` field and create a new `browser_session` record in Postgres with status `created`. The response SHALL include the full session object including its generated UUID.

Request body schema:
```ts
{ startUrl: string }  // validated by Zod; must be a valid HTTP/HTTPS URL
```

Response body schema:
```ts
{
  id: string           // UUID
  startUrl: string
  currentUrl: string   // same as startUrl on creation
  status: "created" | "active" | "recording" | "stopped" | "error"
  createdAt: string    // ISO 8601
}
```

#### Scenario: Valid URL creates session
- **WHEN** `POST /sessions` is called with `{ "startUrl": "https://example.com" }`
- **THEN** the system creates a `browser_session` row with `status = 'created'`, returns HTTP 201, and the response body includes the session `id`, `startUrl`, `currentUrl`, and `createdAt`

#### Scenario: Invalid URL is rejected
- **WHEN** `POST /sessions` is called with `{ "startUrl": "not-a-url" }`
- **THEN** the system returns HTTP 400 with `{ "error": "Validation failed", "code": "INVALID_INPUT" }`

#### Scenario: Missing startUrl is rejected
- **WHEN** `POST /sessions` is called with an empty body `{}`
- **THEN** the system returns HTTP 400 with `{ "error": "Validation failed", "code": "INVALID_INPUT" }`

---

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

### Requirement: List browser sessions
The system SHALL accept `GET /sessions` and return an array of all sessions ordered by `created_at` descending.

#### Scenario: Sessions are listed
- **WHEN** `GET /sessions` is called
- **THEN** the system returns HTTP 200 with `{ "sessions": [...], "total": N }` where each item matches the session object schema

#### Scenario: Empty state returns empty array
- **WHEN** `GET /sessions` is called and no sessions exist
- **THEN** the system returns HTTP 200 with `{ "sessions": [], "total": 0 }`

---

### Requirement: Close a browser session
The system SHALL accept `DELETE /sessions/:id` and set the session's `status` to `stopped`.

#### Scenario: Active session is stopped
- **WHEN** `DELETE /sessions/:id` is called with a valid session UUID
- **THEN** the system sets `status = 'stopped'` in Postgres and returns HTTP 200 with the updated session object

#### Scenario: Already stopped session is idempotent
- **WHEN** `DELETE /sessions/:id` is called on a session already in `stopped` state
- **THEN** the system returns HTTP 200 with the session object (no error)

### Requirement: Session response includes vncUrl
The session object returned by create, get, list, and close endpoints SHALL include an optional `vncUrl` field.

Extended response schema:
```ts
{
  id: string
  startUrl: string
  currentUrl: string
  status: "created" | "active" | "recording" | "stopped" | "error"
  createdAt: string
  vncUrl: string | null   // WebSocket URL for noVNC; null when no live browser
}
```

#### Scenario: Active session includes vncUrl
- **WHEN** `GET /sessions/:id` is called for a session with status `active` and a running browser-worker
- **THEN** the response includes a non-null `vncUrl` string

#### Scenario: Created session has null vncUrl
- **WHEN** `GET /sessions/:id` is called immediately after session creation before the worker activates
- **THEN** `vncUrl` is `null`

### Requirement: Update session runtime accepts vncUrl
The browser-worker SHALL PATCH session runtime with optional `vncUrl` alongside `status` and `currentUrl`.

#### Scenario: Worker sets vncUrl on launch
- **WHEN** the browser-worker PATCHes runtime after successful launch
- **THEN** Postgres stores the provided `vncUrl` and subsequent GET responses include it

