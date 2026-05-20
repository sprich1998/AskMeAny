## ADDED Requirements

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
