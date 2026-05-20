# frontend-backend-api-client Specification

## Purpose

Real HTTP implementation of the frontend `ApiClient` gap layer, calling Fastify REST endpoints with `@teachmeany/shared` Zod validation at the boundary.
## Requirements
### Requirement: HTTP configuration
The frontend SHALL read backend base URL from `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`). When `NEXT_PUBLIC_USE_MOCKS=true`, the api client SHALL delegate to mock implementations and SHALL NOT perform HTTP requests.

#### Scenario: Default uses real backend
- **WHEN** `NEXT_PUBLIC_USE_MOCKS` is unset or `false`
- **THEN** `apiClient` methods issue HTTP requests to `NEXT_PUBLIC_API_URL`

#### Scenario: Mock mode skips HTTP
- **WHEN** `NEXT_PUBLIC_USE_MOCKS=true`
- **THEN** `apiClient` methods use existing mock-data factories

---

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

### Requirement: Workflow and replay API methods
`apiClient` SHALL implement workflow read and replay trigger methods.

| Method | HTTP |
|--------|------|
| `getWorkflows(sessionId)` | `GET /sessions/:id/workflows` |
| `getWorkflow(sessionId, workflowId)` | `GET /workflows/:workflowId` |
| `triggerReplay(workflowId, mode)` | `POST /workflows/:workflowId/replay` body `{ mode }` |

#### Scenario: getWorkflows returns empty list when none exist
- **WHEN** no workflows exist for a session
- **THEN** `apiClient.getWorkflows(sessionId)` returns `[]` without error

#### Scenario: getWorkflow maps steps
- **WHEN** `apiClient.getWorkflow(sessionId, workflowId)` is called for an existing workflow
- **THEN** it validates response with `WorkflowWithStepsSchema` and returns a mapped `Workflow` including `steps` array

#### Scenario: triggerReplay accepts job
- **WHEN** `apiClient.triggerReplay(workflowId, "ui")` is called for an existing workflow
- **THEN** it sends `POST /workflows/:id/replay` with `{ "mode": "ui" }`, validates HTTP 202 body with `ReplayJobAcceptedSchema`, and returns `ReplayResult` with `status: "accepted"` and `replay_id` populated

#### Scenario: triggerReplay handles not found
- **WHEN** `apiClient.triggerReplay(workflowId, mode)` is called for a missing workflow
- **THEN** it throws `ApiError` with code `NOT_FOUND`

---

### Requirement: Structured API errors
HTTP responses with status ≥ 400 SHALL be parsed as `{ error: string, code: string }` and thrown as `ApiError`. The gap layer SHALL NOT swallow errors into successful return values.

#### Scenario: Network failure surfaces error
- **WHEN** the backend is unreachable
- **THEN** `apiClient` methods reject with a descriptive error (connection failed), not mock data

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

