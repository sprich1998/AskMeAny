## ADDED Requirements

### Requirement: Capture network request and response pairs
The browser-worker SHALL attach a Chrome DevTools Protocol session to each Playwright page and capture eligible `fetch` and `XHR` request/response pairs.

#### Scenario: Fetch request is captured
- **WHEN** a page issues a `fetch` request during recording
- **THEN** the worker records method, URL, request headers, request body when available, response status, response headers, response body when available, frame ID, and timestamp

#### Scenario: Response body cannot be read
- **WHEN** CDP does not expose a response body
- **THEN** the worker stores `responseBody: null` and continues capture

#### Scenario: Non-API document noise is ignored
- **WHEN** the page loads documents, stylesheets, images, or fonts
- **THEN** the worker excludes them from correlation candidates
