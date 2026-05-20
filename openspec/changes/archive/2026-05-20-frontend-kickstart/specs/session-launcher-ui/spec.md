## ADDED Requirements

### Requirement: URL input and session creation
The session launcher page at route `/` SHALL render a URL input field and a "Start session" button. Submitting the form SHALL call `apiClient.createSession(url)` and navigate to `/session/[id]` on success.

#### Scenario: Valid URL submitted
- **WHEN** the user enters a valid URL and clicks "Start session"
- **THEN** `createSession` is called with the entered URL, a loading state is shown, and the user is navigated to `/session/[new-session-id]`

#### Scenario: Empty URL submitted
- **WHEN** the user submits the form with an empty URL field
- **THEN** the form shows a validation error "URL is required" and does not call `createSession`

#### Scenario: Invalid URL submitted
- **WHEN** the user enters a value that is not a valid URL (no protocol or malformed)
- **THEN** the form shows a validation error "Enter a valid URL (e.g. https://example.com)" and does not call `createSession`

#### Scenario: Session creation in progress
- **WHEN** `createSession` is pending
- **THEN** the "Start session" button is disabled and shows a loading spinner

#### Scenario: Session creation failure
- **WHEN** `createSession` rejects
- **THEN** an error message is displayed below the form and the button returns to its default state

### Requirement: Recent sessions list
The session launcher SHALL display a list of recent sessions returned by `apiClient.getSessions()`.

#### Scenario: Sessions available
- **WHEN** `getSessions` returns one or more sessions
- **THEN** each session is shown with its `start_url`, `status`, and formatted `created_at`

#### Scenario: No sessions yet
- **WHEN** `getSessions` returns an empty array
- **THEN** a "No sessions yet" empty state is shown instead of the list

#### Scenario: Clicking a recent session
- **WHEN** the user clicks a session in the list
- **THEN** the user is navigated to `/session/[id]` for that session
