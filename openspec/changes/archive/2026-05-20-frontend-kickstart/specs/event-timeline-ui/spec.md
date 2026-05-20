## ADDED Requirements

### Requirement: Timeline event stream
The event timeline SHALL consume the `useSessionWs(sessionId)` hook and render a scrollable chronological list of `TimelineEvent` items.

#### Scenario: Events arriving
- **WHEN** `useSessionWs` yields new events
- **THEN** each event is appended to the bottom of the timeline list and the list auto-scrolls to the latest event

#### Scenario: Empty timeline on session start
- **WHEN** no events have arrived yet
- **THEN** the timeline shows an empty state: "Waiting for events…"

#### Scenario: WebSocket disconnected
- **WHEN** `useSessionWs` returns `connected: false`
- **THEN** a "Disconnected" badge is shown at the top of the timeline

### Requirement: Event row rendering by type
Each `TimelineEvent` row SHALL render differently based on its `type` field: `action`, `network_event`, `dom_mutation`, or `intent`.

#### Scenario: Action row
- **WHEN** the event type is `"action"`
- **THEN** the row shows an action icon, the action `type` (e.g. "click"), and the element `label`

#### Scenario: Network event row
- **WHEN** the event type is `"network_event"`
- **THEN** the row shows a network icon, the HTTP `method`, and a shortened `url`

#### Scenario: DOM mutation row
- **WHEN** the event type is `"dom_mutation"`
- **THEN** the row shows a DOM icon and a brief mutation summary

#### Scenario: Intent row
- **WHEN** the event type is `"intent"`
- **THEN** the row shows an intent icon, the intent `name`, and the `confidence` as a percentage badge

### Requirement: Timeline row selection
Clicking a `network_event` row in the timeline SHALL select it and open the network details panel.

#### Scenario: Selecting a network event
- **WHEN** the user clicks a network_event row
- **THEN** the row is highlighted, the detail panel tab switches to "Network", and the network details panel shows that event's data
