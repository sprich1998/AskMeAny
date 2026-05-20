# browser-playwright-capture Specification

## Purpose
TBD - created by archiving change browser-worker-kickstart. Update Purpose after archive.
## Requirements
### Requirement: Capture DOM actions
The browser-worker SHALL capture click and input actions while a session is recording. Each captured action SHALL include type, label, selector, xpath, element metadata, value, and timestamp.

#### Scenario: Click action is captured
- **WHEN** a user clicks an element while recording is active
- **THEN** the worker creates an action record with `type: "click"` and stable DOM metadata

#### Scenario: Input action is captured
- **WHEN** a user changes an input value while recording is active
- **THEN** the worker creates an action record with `type: "input"` and the captured value

#### Scenario: Not recording skips ingest
- **WHEN** the same browser event occurs while the backend session is not `recording`
- **THEN** the worker does not submit an ingest bundle
