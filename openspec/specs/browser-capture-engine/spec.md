# browser-capture-engine Specification

## Purpose
TBD - created by archiving change browser-worker-kickstart. Update Purpose after archive.
## Requirements
### Requirement: Correlate action to network request
The capture engine SHALL correlate an action to the strongest eligible network event that starts between 0 and 1500 milliseconds after the action timestamp.

Correlation rule:
```ts
network.timestamp >= action.timestamp
  && network.timestamp - action.timestamp <= 1500
  && network.resourceType in ["fetch", "xhr"]
```

#### Scenario: Nearby fetch request correlates to action
- **WHEN** a click is followed by a fetch request within 1500 milliseconds
- **THEN** the ingest bundle links the network event to that action

#### Scenario: No nearby request remains uncorrelated
- **WHEN** no eligible request occurs within the correlation window
- **THEN** the action is still ingested with no network event

### Requirement: Infer deterministic intent hints
The capture engine SHALL infer an intent name, description, confidence, and source from the action label and network URL.

#### Scenario: Search label produces search intent
- **WHEN** the action label or URL contains `search`
- **THEN** the intent name starts with `search_` and source is `rule-based`
