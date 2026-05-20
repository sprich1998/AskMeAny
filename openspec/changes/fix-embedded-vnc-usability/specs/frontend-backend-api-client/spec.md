## MODIFIED Requirements

### Requirement: Session API methods
`apiClient` SHALL implement session lifecycle methods against the backend session and recording routes. Request and response bodies MUST be validated with `@teachmeany/shared` Zod schemas at the gap layer boundary. The session response schema MUST include optional nullable `vncUrl` so the field is preserved through validation and mapped to `BrowserSession.vnc_url`.

| Method | HTTP |
|--------|------|
| `createSession(startUrl)` | `POST /sessions` body `{ startUrl }` |
| `getSessions()` | `GET /sessions` |
| `getSession(id)` | `GET /sessions/:id` |
| `startRecording(sessionId)` | `POST /sessions/:id/recording/start` |
| `stopRecording(sessionId)` | `POST /sessions/:id/recording/stop` |

#### Scenario: createSession returns real session
- **WHEN** `apiClient.createSession("https://example.com")` is called against a running backend
- **THEN** it sends `POST /sessions` with `{ "startUrl": "https://example.com" }` and returns a mapped `BrowserSession` with a UUID `id`, matching URLs, status from backend (typically `"created"`), and ISO `created_at`

#### Scenario: getSessions returns session list
- **WHEN** `apiClient.getSessions()` is called
- **THEN** it sends `GET /sessions`, validates `{ sessions, total }` with `ListSessionsResponseSchema`, and returns mapped `BrowserSession[]`

#### Scenario: getSession preserves vncUrl
- **WHEN** `apiClient.getSession(id)` is called and the backend returns `{ ..., "vncUrl": "ws://localhost:6080", "status": "active" }`
- **THEN** the client validates with `SessionResponseSchema`, maps to `BrowserSession`, and `vnc_url` equals `"ws://localhost:6080"`

#### Scenario: startRecording requires active session
- **WHEN** `apiClient.startRecording(sessionId)` is called and backend returns HTTP 409 with code `INVALID_STATE`
- **THEN** the client throws an `ApiError` with the backend `code` and message (does not silently succeed)

#### Scenario: stopRecording returns to active
- **WHEN** `apiClient.stopRecording(sessionId)` succeeds
- **THEN** the session status reflected in subsequent `getSession` is `"active"` (not `"idle"`)
