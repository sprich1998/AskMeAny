## ADDED Requirements

### Requirement: Retrieve actions for a session
The system SHALL accept `GET /sessions/:id/actions` and return all action records for the given session, ordered by `timestamp` ascending.

Response body schema:
```ts
{
  actions: Array<{
    id: string            // UUID
    sessionId: string     // UUID
    pageSnapshotId: string | null
    type: string          // "click" | "fill" | "select" | "keydown" | etc.
    label: string
    selector: string
    xpath: string
    element: unknown      // JSONB — validated by ActionElementSchema from @teachmeany/shared
    value: unknown        // JSONB — input value, null for clicks
    timestamp: string     // ISO 8601
    networkEventId: string | null  // correlated network_event UUID, if any
  }>
  total: number
}
```

#### Scenario: Actions are returned for a session
- **WHEN** `GET /sessions/:id/actions` is called for a session that has captured actions
- **THEN** the system returns HTTP 200 with an `actions` array ordered by `timestamp` ascending and a `total` count

#### Scenario: No actions returns empty array
- **WHEN** `GET /sessions/:id/actions` is called for a session with no captured actions
- **THEN** the system returns HTTP 200 with `{ "actions": [], "total": 0 }`

#### Scenario: Non-existent session returns 404
- **WHEN** `GET /sessions/:id/actions` is called with an unknown session UUID
- **THEN** the system returns HTTP 404 with `{ "error": "Session not found", "code": "NOT_FOUND" }`

---

### Requirement: Retrieve network events for a session
The system SHALL accept `GET /sessions/:id/network-events` and return all network_event records for the given session, ordered by `timestamp` ascending.

Response body schema:
```ts
{
  networkEvents: Array<{
    id: string
    sessionId: string
    actionId: string | null     // correlated action UUID, null if uncorrelated
    method: string              // "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | etc.
    url: string
    requestHeaders: unknown     // JSONB
    requestBody: unknown        // JSONB, null if no body
    responseStatus: number
    responseHeaders: unknown    // JSONB
    responseBody: unknown       // JSONB
    timestamp: string           // ISO 8601
  }>
  total: number
}
```

#### Scenario: Network events are returned
- **WHEN** `GET /sessions/:id/network-events` is called for a session with captured network events
- **THEN** the system returns HTTP 200 with a `networkEvents` array and `total` count

#### Scenario: Correlated network events include actionId
- **WHEN** a `network_event` has been correlated to an action by the capture engine
- **THEN** the returned network event object has a non-null `actionId` field

#### Scenario: No network events returns empty array
- **WHEN** `GET /sessions/:id/network-events` is called for a session with no network events
- **THEN** the system returns HTTP 200 with `{ "networkEvents": [], "total": 0 }`

#### Scenario: Non-existent session returns 404
- **WHEN** `GET /sessions/:id/network-events` is called with an unknown session UUID
- **THEN** the system returns HTTP 404 with `{ "error": "Session not found", "code": "NOT_FOUND" }`
