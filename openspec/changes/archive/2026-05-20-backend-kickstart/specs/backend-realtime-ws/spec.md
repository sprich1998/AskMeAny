## ADDED Requirements

### Requirement: WebSocket connection and session subscription
The system SHALL expose a WebSocket endpoint at `ws://host:4000/ws`. After connecting, a client MUST send a subscription message to begin receiving events for a specific session. Subscriptions are scoped to a single `session_id` per connection.

Subscription message (client → server):
```ts
{ type: "subscribe", sessionId: string }
```

Acknowledgement (server → client):
```ts
{ type: "subscribed", sessionId: string }
```

#### Scenario: Client subscribes to a session
- **WHEN** a WebSocket client connects to `/ws` and sends `{ "type": "subscribe", "sessionId": "..." }`
- **THEN** the server responds with `{ "type": "subscribed", "sessionId": "..." }` and registers the client for that session's Redis pub/sub channel

#### Scenario: Invalid subscription message is rejected
- **WHEN** a WebSocket client sends a message that does not match the subscription schema (e.g. missing `sessionId`)
- **THEN** the server sends `{ "type": "error", "code": "INVALID_MESSAGE", "message": "..." }` and does not subscribe the client

---

### Requirement: Real-time timeline event delivery
The system SHALL relay timeline events published to Redis channel `timeline:{session_id}` to all WebSocket clients subscribed to that session. Events MUST be forwarded as-is (JSON string) within 100ms of Redis delivery under normal load.

Event types that can be received from Redis (and forwarded):
- `{ type: "action", data: ActionRecord }` — a captured user action
- `{ type: "network_event", data: NetworkEventRecord }` — a captured HTTP request/response
- `{ type: "dom_mutation", data: DomMutationRecord }` — a DOM change after an action
- `{ type: "intent", data: IntentRecord }` — an inferred intent for an action

#### Scenario: Action event is delivered to subscribers
- **WHEN** browser-worker publishes `{ "type": "action", "data": {...} }` to Redis channel `timeline:{session_id}`
- **THEN** all WebSocket clients subscribed to that `session_id` receive the same JSON message

#### Scenario: Events for unsubscribed session are not delivered
- **WHEN** a client is subscribed to `session_id` A and an event is published for `session_id` B
- **THEN** the client does NOT receive the event for session B

#### Scenario: Multiple clients receive the same event
- **WHEN** two WebSocket clients are both subscribed to the same `session_id` and an event is published
- **THEN** both clients receive the event

---

### Requirement: WebSocket connection cleanup
The system SHALL clean up internal subscriptions when a WebSocket client disconnects, and MUST unsubscribe from the Redis channel when the last client for a session disconnects.

#### Scenario: Disconnect removes client from session map
- **WHEN** a subscribed WebSocket client disconnects
- **THEN** the server removes the client from the in-process session-to-clients map

#### Scenario: Last client disconnect unsubscribes Redis channel
- **WHEN** the last WebSocket client for a session disconnects
- **THEN** the server calls `UNSUBSCRIBE` on the Redis subscriber for `timeline:{session_id}` to avoid orphaned subscriptions

---

### Requirement: Health check endpoint
The system SHALL expose `GET /health` as an unauthenticated HTTP endpoint that returns the backend's operational status, including database connectivity.

Response body schema:
```ts
{
  status: "ok" | "degraded"
  postgres: "connected" | "error"
  redis: "connected" | "error"
  uptime: number    // seconds since process start
}
```

#### Scenario: All services healthy
- **WHEN** `GET /health` is called and Postgres + Redis are reachable
- **THEN** the system returns HTTP 200 with `{ "status": "ok", "postgres": "connected", "redis": "connected", "uptime": N }`

#### Scenario: Postgres unreachable
- **WHEN** `GET /health` is called and Postgres is not reachable
- **THEN** the system returns HTTP 200 with `{ "status": "degraded", "postgres": "error", ... }` (still 200 so load balancers can log; consumers check the body)
