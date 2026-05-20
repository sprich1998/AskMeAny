## ADDED Requirements

### Requirement: Browser worker exposes VNC display stack
The browser-worker container SHALL run a virtual display (Xvfb), VNC server (x11vnc), and WebSocket proxy (websockify) alongside Playwright so Chromium renders to a viewable framebuffer.

#### Scenario: VNC stack starts with launch job
- **WHEN** a valid `browser-launch` job is processed
- **THEN** the worker starts the VNC stack before navigating Playwright to `startUrl`

#### Scenario: VNC stack failure marks session error
- **WHEN** the VNC stack fails to start
- **THEN** the worker patches the backend session to `error` and the launch job fails for retry

### Requirement: Chromium runs on the virtual display
The browser-worker SHALL launch Chromium in headed mode attached to the virtual display so user pointer events from noVNC reach the page.

#### Scenario: Page is visible over VNC
- **WHEN** the session is `active` and a user connects to the session `vncUrl`
- **THEN** the navigated `startUrl` page is visible and accepts click and keyboard input

### Requirement: Session runtime reports vncUrl to backend
After a successful launch, the browser-worker SHALL PATCH the backend session runtime with a `vncUrl` WebSocket URL reachable from the user's browser.

#### Scenario: vncUrl is set on active session
- **WHEN** Chromium launch and navigation succeed
- **THEN** the worker patches the session with `status: "active"` and a non-null `vncUrl`

#### Scenario: vncUrl is cleared on teardown
- **WHEN** the session enters `stopped` or `error` and browser resources close
- **THEN** subsequent `GET /sessions/:id` returns `vncUrl: null`

### Requirement: VNC URL is configurable for Docker networking
The browser-worker SHALL build `vncUrl` using environment configuration (`VNC_PUBLIC_HOST`, `VNC_PUBLIC_PORT`) so the URL works when the frontend runs on the host and the worker runs in Docker.

#### Scenario: Compose documented URL
- **WHEN** `VNC_PUBLIC_HOST=localhost` and port `6080` is published
- **THEN** `vncUrl` uses `ws://localhost:6080/...` (or equivalent path) documented in compose `.env.example`
