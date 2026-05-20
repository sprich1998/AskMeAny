## ADDED Requirements

### Requirement: Bodyless POST requests
The gap layer SHALL NOT send `Content-Type: application/json` on HTTP POST requests that have no request body. Recording control methods MUST succeed against Fastify without triggering empty JSON body parser errors.

#### Scenario: startRecording on active session
- **WHEN** `apiClient.startRecording(sessionId)` is called against a running backend and the session `status` is `"active"`
- **THEN** it sends `POST /sessions/:id/recording/start` without an empty JSON body or without a JSON Content-Type header, and the call resolves without HTTP 400

#### Scenario: stopRecording on recording session
- **WHEN** `apiClient.stopRecording(sessionId)` is called and the session `status` is `"recording"`
- **THEN** it sends `POST /sessions/:id/recording/stop` without an empty JSON body or without a JSON Content-Type header, and the call resolves without HTTP 400

#### Scenario: Fastify empty body error is not returned
- **WHEN** `apiClient.startRecording(sessionId)` is called on an active session
- **THEN** the backend MUST NOT respond with `FST_ERR_CTP_EMPTY_JSON_BODY`

## MODIFIED Requirements

### Requirement: Session API methods
`apiClient` SHALL implement session lifecycle methods against the backend session and recording routes. Request and response bodies MUST be validated with `@teachmeany/shared` Zod schemas at the gap layer boundary where a response body is returned.

| Method | HTTP |
|--------|------|
| `createSession(startUrl)` | `POST /sessions` body `{ startUrl }` |
| `getSessions()` | `GET /sessions` |
| `getSession(id)` | `GET /sessions/:id` |
| `startRecording(sessionId)` | `POST /sessions/:id/recording/start` (no body) |
| `stopRecording(sessionId)` | `POST /sessions/:id/recording/stop` (no body) |

#### Scenario: createSession returns real session
- **WHEN** `apiClient.createSession("https://example.com")` is called against a running backend
- **THEN** it sends `POST /sessions` with `{ "startUrl": "https://example.com" }` and returns a mapped `BrowserSession` with a UUID `id`, matching URLs, status from backend (typically `"created"`), and ISO `created_at`

#### Scenario: getSessions returns session list
- **WHEN** `apiClient.getSessions()` is called
- **THEN** it sends `GET /sessions`, validates `{ sessions, total }` with `ListSessionsResponseSchema`, and returns mapped `BrowserSession[]`

#### Scenario: startRecording requires active session
- **WHEN** `apiClient.startRecording(sessionId)` is called and backend returns HTTP 409 with code `INVALID_STATE`
- **THEN** the client throws an `ApiError` with the backend `code` and message (does not silently succeed)

#### Scenario: stopRecording returns to active
- **WHEN** `apiClient.stopRecording(sessionId)` succeeds
- **THEN** the session status reflected in subsequent `getSession` is `"active"` (not `"idle"`)
