## ADDED Requirements

### Requirement: ApiClient interface
`src/lib/api-client.ts` SHALL export an `ApiClient` interface and a default `apiClient` instance. All component code SHALL import from this module only — no direct `fetch` calls in components.

#### Scenario: createSession stub
- **WHEN** `apiClient.createSession(url)` is called
- **THEN** it returns a `Promise<BrowserSession>` that resolves after a simulated delay with a mock session object having `id`, `start_url`, `status: "idle"`, and `created_at`

#### Scenario: getSessions stub
- **WHEN** `apiClient.getSessions()` is called
- **THEN** it returns a `Promise<BrowserSession[]>` resolving with 2–3 mock sessions

#### Scenario: getSession stub
- **WHEN** `apiClient.getSession(id)` is called
- **THEN** it returns a `Promise<BrowserSession>` resolving with a mock session matching the given `id`

#### Scenario: startRecording stub
- **WHEN** `apiClient.startRecording(sessionId)` is called
- **THEN** it returns `Promise<void>` that resolves after a short delay

#### Scenario: stopRecording stub
- **WHEN** `apiClient.stopRecording(sessionId)` is called
- **THEN** it returns `Promise<void>` that resolves after a short delay

#### Scenario: getWorkflows stub
- **WHEN** `apiClient.getWorkflows(sessionId)` is called
- **THEN** it returns a `Promise<Workflow[]>` resolving with 1–2 mock workflows each containing `id`, `session_id`, `name`, `description`, `created_at`

#### Scenario: getWorkflow stub
- **WHEN** `apiClient.getWorkflow(sessionId, workflowId)` is called
- **THEN** it returns a `Promise<Workflow>` resolving with a mock workflow whose `steps` include at least one `ui_replay` step and one `api_equivalent` block

#### Scenario: triggerReplay stub
- **WHEN** `apiClient.triggerReplay(workflowId, mode)` is called
- **THEN** it returns a `Promise<ReplayResult>` resolving with `{ status: "success", elapsed_ms: <number>, result: <mock> }` after a simulated delay

### Requirement: useSessionWs hook
`src/lib/use-session-ws.ts` SHALL export a `useSessionWs(sessionId: string)` React hook that returns `{ events: TimelineEvent[], connected: boolean }`. It SHALL simulate a live event stream using `setInterval` without any real WebSocket connection.

#### Scenario: Hook emits events on interval
- **WHEN** `useSessionWs` is mounted with a `sessionId`
- **THEN** it emits one new `TimelineEvent` approximately every 1500ms, cycling through event types: `action`, `network_event`, `dom_mutation`, `intent`

#### Scenario: Hook reports connected
- **WHEN** `useSessionWs` is mounted
- **THEN** `connected` is `true` after a brief simulated connection delay (300ms)

#### Scenario: Hook cleans up on unmount
- **WHEN** the component using `useSessionWs` unmounts
- **THEN** the interval is cleared and no more events are emitted

### Requirement: Gap layer type definitions
`src/types/` SHALL define the domain view types used by components. All types SHALL use field names matching the PostgreSQL schema in `docs/Proposl_v1.md`.

#### Scenario: BrowserSession type
- **WHEN** any component imports `BrowserSession`
- **THEN** the type has: `id: string`, `start_url: string`, `current_url: string`, `status: "idle" | "recording" | "stopped"`, `created_at: string`

#### Scenario: TimelineEvent union type
- **WHEN** any component imports `TimelineEvent`
- **THEN** it is a discriminated union on `type`: `"action" | "network_event" | "dom_mutation" | "intent"`, each with its appropriate fields from the domain schema

#### Scenario: Workflow type
- **WHEN** any component imports `Workflow`
- **THEN** the type has: `id: string`, `session_id: string`, `name: string`, `description: string`, `created_at: string`, `steps: WorkflowStep[]`

#### Scenario: WorkflowStep type
- **WHEN** any component imports `WorkflowStep`
- **THEN** the type has: `id: string`, `workflow_id: string`, `action_id: string`, `order_index: number`, `step_type: string`, `api_equivalent: ApiEquivalent | null`, `ui_replay: UiReplayStep[]`
