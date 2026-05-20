# embedding-interaction-text Specification

## Purpose
TBD - created by archiving change embedding-worker-kickstart. Update Purpose after archive.
## Requirements
### Requirement: Build deterministic embedding text
The embedding-worker SHALL build embedding input text from action, optional network event, optional intent, and session page context using a deterministic template.

Template sections (include when data is present):

```text
User {action.type} {action.label} on {pageContext}.
Button text: {action.label}.
Request: {network.method} {network.url}.
Payload fields: {requestBodyTopLevelKeys}.
Response fields: {responseBodyTopLevelKeys}.
Likely intent: {intent.description or intent.name}.
```

#### Scenario: Correlated action with intent produces full text
- **WHEN** action, network event, and intent records are all present
- **THEN** the text includes action type/label, request method/URL, payload/response field names, and inferred intent

#### Scenario: Uncorrelated action omits network sections
- **WHEN** no network event is linked to the action
- **THEN** the text includes action and page context but omits request, payload, and response sections

#### Scenario: Missing intent omits intent line
- **WHEN** no intent record exists for the action
- **THEN** the text is built without the "Likely intent" line

### Requirement: Extract JSON field names safely
The text builder SHALL extract top-level keys from `request_body` and `response_body` JSONB values when they are objects.

#### Scenario: Object body yields comma-separated keys
- **WHEN** `request_body` is `{ "clientId": "123", "status": "active" }`
- **THEN** payload fields are listed as `clientId, status`

#### Scenario: Non-object body yields no field list
- **WHEN** `request_body` is a string, array, or null
- **THEN** the payload fields section is omitted

### Requirement: Page context uses session URL
The text builder SHALL use the session `current_url` or `start_url` as page context when no page snapshot title is available.

#### Scenario: Session URL appears in page context
- **WHEN** the session has `current_url` set
- **THEN** the page context line references that URL

