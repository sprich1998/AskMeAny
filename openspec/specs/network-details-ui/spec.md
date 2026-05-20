# network-details-ui Specification

## Purpose
TBD - created by archiving change frontend-kickstart. Update Purpose after archive.
## Requirements
### Requirement: Network event detail display
The network details panel SHALL display the full detail of a selected `network_event`: method, URL, response status, request body, and response body.

#### Scenario: Network event selected
- **WHEN** a `network_event` is selected (from the timeline or programmatically)
- **THEN** the panel renders: HTTP method badge, full URL, response status code (with colour: green for 2xx, red for 4xx/5xx), request body as formatted JSON, and response body as formatted JSON

#### Scenario: No network event selected
- **WHEN** no network event is selected
- **THEN** the panel shows "Select a network event from the timeline to inspect it"

#### Scenario: Request body is empty
- **WHEN** the selected network event has a null or empty `request_body`
- **THEN** the request body section shows "No request body"

#### Scenario: Response body is empty
- **WHEN** the selected network event has a null or empty `response_body`
- **THEN** the response body section shows "No response body"

### Requirement: Correlated action linkback
If the selected `network_event` has a non-null `action_id`, the panel SHALL show a "Triggered by" chip linking to that action in the timeline.

#### Scenario: Correlated action present
- **WHEN** the network event has a non-null `action_id`
- **THEN** a "Triggered by: [action label]" chip is shown above the URL

#### Scenario: No correlated action
- **WHEN** the network event has a null `action_id`
- **THEN** the "Triggered by" chip is not rendered

