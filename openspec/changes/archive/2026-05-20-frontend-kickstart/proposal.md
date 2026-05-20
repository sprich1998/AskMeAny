## Why

TeachMeAny has a fully designed V1 architecture (see `docs/Proposl_v1.md`) but zero implementation. The frontend is the highest-leverage first step: it defines the product's interaction model, surfaces the six core screens users need, and can be built independently of the backend by using a stub gap layer. Building the frontend first lets us validate UX and screen flow before any browser-worker or backend work is committed.

**Success metric**: All six V1 screens render correctly with realistic mock data, and the API client module exports typed function contracts that can be swapped for real HTTP + WebSocket calls without touching any component code.

## What Changes

- **New**: `apps/frontend` is bootstrapped as a working Next.js 14 App Router application (currently scaffold-only with README stubs).
- **New**: Six screens implemented: session launcher, session workspace (remote browser pane + recording controls), live event timeline, network details panel, extracted workflow panel, and replay panel.
- **New**: A typed gap layer (`src/lib/api-client.ts` + `src/lib/use-session-ws.ts`) that stubs all backend interactions; components depend only on these contracts, not on HTTP or WebSocket details.
- **New**: Shared domain types consumed from `packages/shared` where they exist; frontend-only view types defined locally in `apps/frontend/src/types/`.
- **Not built yet**: Real backend calls, live noVNC stream, authentication persistence, actual recording controls.

## Capabilities

### New Capabilities

- `session-launcher-ui`: URL input form that creates a session and navigates to the session workspace. Calls `createSession` from the gap layer.
- `session-workspace-ui`: The main recording workspace — browser pane placeholder, recording start/stop controls, and panel layout composing timeline, network, workflow, and replay panels.
- `event-timeline-ui`: Live event timeline that consumes the `useSessionWs` stub hook and renders rows for action, network_event, dom_mutation, and intent events in chronological order.
- `network-details-ui`: Slide-in panel triggered by selecting a network_event row; shows method, URL, request body, response status, and response body as formatted JSON.
- `workflow-panel-ui`: Reads a workflow artifact via `getWorkflow` stub; renders the `ui_replay` step list and the `api_equivalent` block side by side.
- `replay-panel-ui`: Two trigger buttons — "Replay via UI" and "Call API directly" — that call stub replay functions and display a mock result status.
- `frontend-gap-layer`: The typed stub contracts for `ApiClient` (async functions returning mock domain objects) and `useSessionWs` hook (interval-driven mock event stream). These are the explicit backend hookup points.

### Modified Capabilities

_(none — this is a greenfield frontend build; no existing specs are modified)_

## Impact

- **`apps/frontend`**: Entire source tree implemented from scaffold.
- **`packages/shared`**: Consumes existing types only (read). No changes to shared types in this change — if types are missing they are defined locally and flagged for promotion in a follow-up.
- **No backend changes**: `apps/backend`, `apps/browser-worker`, `apps/embedding-worker` are untouched.
- **No infra changes**: No migrations, no new Docker services, no compose changes.
- **Dependencies added** (to `apps/frontend/package.json`): `next`, `react`, `react-dom`, `tailwindcss`, `@shadcn/ui` component primitives, `zod`, TypeScript toolchain.
