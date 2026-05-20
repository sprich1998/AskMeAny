## ADDED Requirements

### Requirement: WebSocket configuration
The frontend SHALL connect to `NEXT_PUBLIC_WS_URL` (default: derive from `NEXT_PUBLIC_API_URL` by replacing `http` with `ws` and appending `/ws`). When `NEXT_PUBLIC_USE_MOCKS=true`, the hook SHALL use the existing mock interval behavior.

#### Scenario: Default connects to backend WebSocket
- **WHEN** `NEXT_PUBLIC_USE_MOCKS` is unset or `false` and `useSessionWs(sessionId)` mounts
- **THEN** it opens a WebSocket to the configured WS URL

---

### Requirement: Session subscription protocol
On WebSocket `open`, the hook SHALL send `{ "type": "subscribe", "sessionId": "<sessionId>" }`. On receiving `{ "type": "subscribed", "sessionId" }`, `connected` SHALL become `true`.

#### Scenario: Subscribe on connect
- **WHEN** the WebSocket connection opens for session `abc`
- **THEN** the hook sends `{ "type": "subscribe", "sessionId": "abc" }`

#### Scenario: Subscribed acknowledgement sets connected
- **WHEN** the server sends `{ "type": "subscribed", "sessionId": "abc" }`
- **THEN** `connected` is `true`

#### Scenario: Invalid message from server
- **WHEN** the server sends `{ "type": "error", "code": "INVALID_MESSAGE", "message": "..." }`
- **THEN** `connected` remains `false` and the error is logged to console

---

### Requirement: Timeline event parsing and mapping
Incoming timeline messages (excluding control messages) SHALL be parsed with `TimelineEventEnvelopeSchema` from `@teachmeany/shared`, mapped to frontend `TimelineEvent` view types, and appended to the `events` array in arrival order.

Supported event types: `action`, `network_event`, `dom_mutation`, `intent`.

#### Scenario: Action event appended
- **WHEN** the WebSocket receives `{ "type": "action", "data": { ...ActionRecord } }`
- **THEN** a new `TimelineEvent` with `type: "action"` is appended to `events`

#### Scenario: Network event appended
- **WHEN** the WebSocket receives `{ "type": "network_event", "data": { ...NetworkEventRecord } }`
- **THEN** a new `TimelineEvent` with `type: "network_event"` is appended to `events`

#### Scenario: Intent event appended
- **WHEN** the WebSocket receives `{ "type": "intent", "data": { ...IntentRecord } }`
- **THEN** a new `TimelineEvent` with `type: "intent"` is appended to `events`

#### Scenario: DOM mutation event appended
- **WHEN** the WebSocket receives `{ "type": "dom_mutation", "data": { ...DomMutationRecord } }`
- **THEN** a new `TimelineEvent` with `type: "dom_mutation"` is appended to `events`

---

### Requirement: Connection lifecycle
The hook SHALL close the WebSocket and cancel reconnect timers on unmount. On abnormal disconnect, it MAY attempt reconnect with exponential backoff (max 5 attempts).

#### Scenario: Cleanup on unmount
- **WHEN** the component using `useSessionWs` unmounts
- **THEN** the WebSocket is closed and no further events are appended

#### Scenario: Disconnect shows disconnected state
- **WHEN** the WebSocket closes before subscribed acknowledgement
- **THEN** `connected` is `false` and the event timeline shows its disconnected banner
