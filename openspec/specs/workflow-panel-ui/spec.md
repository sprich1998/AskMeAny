# workflow-panel-ui Specification

## Purpose
TBD - created by archiving change frontend-kickstart. Update Purpose after archive.
## Requirements
### Requirement: Workflow list
The workflow panel SHALL call `apiClient.getWorkflows(sessionId)` and display a list of extracted workflows for the session.

#### Scenario: Workflows available
- **WHEN** `getWorkflows` returns one or more workflows
- **THEN** each workflow is shown with its `name`, `description`, and step count

#### Scenario: No workflows yet
- **WHEN** `getWorkflows` returns an empty array
- **THEN** an empty state is shown: "No workflows extracted yet"

#### Scenario: Workflow selected
- **WHEN** the user clicks a workflow in the list
- **THEN** the workflow detail view opens showing `ui_replay` steps and `api_equivalent`

### Requirement: Workflow detail — dual-path view
The workflow detail view SHALL render the `ui_replay` step list and the `api_equivalent` block side by side, reflecting the product's dual-path output.

#### Scenario: ui_replay steps displayed
- **WHEN** the workflow has one or more `ui_replay` steps
- **THEN** each step is shown as a numbered row with `type`, `selector`, and `value` (if present)

#### Scenario: api_equivalent displayed
- **WHEN** the workflow has an `api_equivalent`
- **THEN** the method, URL, and body are shown as a code block with syntax highlighting

#### Scenario: Missing api_equivalent
- **WHEN** the workflow's `api_equivalent` is null
- **THEN** the API equivalent section shows "API equivalent not yet extracted"

### Requirement: Link to full workflow view
The workflow detail panel SHALL include a "View full workflow" link that navigates to `/session/[id]/workflow/[wid]`.

#### Scenario: Full workflow link clicked
- **WHEN** the user clicks "View full workflow"
- **THEN** the browser navigates to the full workflow detail route

