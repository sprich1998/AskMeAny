# frontend-gap-layer Specification

## Purpose

Typed boundary between Next.js UI components and the Fastify backend. Components import only `apiClient` and `useSessionWs` — never `fetch` or `WebSocket` directly. Real backend is the default; mock mode is opt-in via `NEXT_PUBLIC_USE_MOCKS=true`.

## Requirements

### Requirement: ApiClient interface
`src/lib/api-client.ts` SHALL export an `ApiClient` interface and a default `apiClient` instance. All component code SHALL import from this module only — no direct `fetch` calls in components. **By default**, methods SHALL call the real Fastify backend. Mock behavior is opt-in via `NEXT_PUBLIC_USE_MOCKS=true`.

#### Scenario: createSession calls backend
- **WHEN** `apiClient.createSession(url)` is called with mocks disabled
- **THEN** it returns a `Promise<BrowserSession>` from `POST /sessions`, not mock data

#### Scenario: getSessions calls backend
- **WHEN** `apiClient.getSessions()` is called with mocks disabled
- **THEN** it returns sessions from `GET /sessions`, not a fixed mock list

#### Scenario: getSession calls backend
- **WHEN** `apiClient.getSession(id)` is called with mocks disabled
- **THEN** it returns the session from `GET /sessions/:id`

#### Scenario: startRecording calls backend
- **WHEN** `apiClient.startRecording(sessionId)` is called with mocks disabled
- **THEN** it sends `POST /sessions/:id/recording/start` and resolves on HTTP 200

#### Scenario: stopRecording calls backend
- **WHEN** `apiClient.stopRecording(sessionId)` is called with mocks disabled
- **THEN** it sends `POST /sessions/:id/recording/stop` and resolves on HTTP 200

#### Scenario: getWorkflows calls backend
- **WHEN** `apiClient.getWorkflows(sessionId)` is called with mocks disabled
- **THEN** it returns workflows from `GET /sessions/:id/workflows` (may be empty)

#### Scenario: getWorkflow calls backend
- **WHEN** `apiClient.getWorkflow(sessionId, workflowId)` is called with mocks disabled
- **THEN** it returns the workflow from `GET /workflows/:workflowId`

#### Scenario: triggerReplay calls backend
- **WHEN** `apiClient.triggerReplay(workflowId, mode)` is called with mocks disabled
- **THEN** it sends `POST /workflows/:id/replay` and returns an accepted replay result (not mock success body)

---

### Requirement: useSessionWs hook
`src/lib/use-session-ws.ts` SHALL export a `useSessionWs(sessionId: string)` React hook that returns `{ events: TimelineEvent[], connected: boolean }`. **By default**, it SHALL connect to the backend WebSocket and receive real timeline events. Mock interval behavior is opt-in via `NEXT_PUBLIC_USE_MOCKS=true`.

#### Scenario: Hook receives real events
- **WHEN** `useSessionWs` is mounted with mocks disabled and the backend publishes a timeline event for the session
- **THEN** the event appears in `events` without using `setInterval` mock generation

#### Scenario: Hook reports connected after subscription
- **WHEN** `useSessionWs` is mounted with mocks disabled and the backend sends `subscribed`
- **THEN** `connected` is `true`

#### Scenario: Hook cleans up on unmount
- **WHEN** the component using `useSessionWs` unmounts
- **THEN** the WebSocket is closed and no more events are emitted

---

### Requirement: Gap layer type definitions
`src/types/` SHALL define frontend view types used by components. Session status SHALL align with `@teachmeany/shared` `SESSION_STATUS_VALUES`: `"created" | "active" | "recording" | "stopped" | "error"`. The gap layer SHALL map shared camelCase API records to snake_case view types via dedicated mappers.

#### Scenario: BrowserSession type includes all backend statuses
- **WHEN** any component imports `BrowserSession`
- **THEN** the status union includes `created`, `active`, `recording`, `stopped`, and `error`

#### Scenario: TimelineEvent union type unchanged
- **WHEN** any component imports `TimelineEvent`
- **THEN** it remains a discriminated union on `type`: `"action" | "network_event" | "dom_mutation" | "intent"`

#### Scenario: Workflow type
- **WHEN** any component imports `Workflow`
- **THEN** the type has: `id: string`, `session_id: string`, `name: string`, `description: string`, `created_at: string`, `steps: WorkflowStep[]`

#### Scenario: WorkflowStep type
- **WHEN** any component imports `WorkflowStep`
- **THEN** the type has: `id: string`, `workflow_id: string`, `action_id: string`, `order_index: number`, `step_type: string`, `api_equivalent: ApiEquivalent | null`, `ui_replay: UiReplayStep[]`
