## 1. Project Setup (apps/frontend)

- [x] 1.1 Write `apps/frontend/package.json` with dependencies: `next@14`, `react`, `react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `@radix-ui/react-tabs`, `@radix-ui/react-dialog`, `@radix-ui/react-tooltip`, and dev dependencies: `typescript`, `@types/react`, `@types/node`, `eslint`, `eslint-config-next`
- [x] 1.2 Write `apps/frontend/tsconfig.json` with strict mode, App Router paths (`@/*` → `src/*`), and target `ES2022`
- [x] 1.3 Write `apps/frontend/next.config.mjs` (minimal — no src dir override needed since App Router is in `src/app/`)
- [x] 1.4 Write `apps/frontend/tailwind.config.ts` with content glob covering `src/**/*.{ts,tsx}`, dark mode `class`, and the project's neutral colour palette
- [x] 1.5 Write `apps/frontend/postcss.config.mjs` (tailwind + autoprefixer)
- [x] 1.6 Bootstrap shadcn/ui: write `apps/frontend/src/components/ui/` with `button.tsx`, `card.tsx`, `tabs.tsx`, `badge.tsx`, `input.tsx`, `label.tsx`, `separator.tsx` using Radix primitives + Tailwind variants
- [x] 1.7 Write `apps/frontend/src/app/globals.css` with Tailwind base/components/utilities directives and CSS variables for dark theme tokens

## 2. Domain Types and Gap Layer (apps/frontend)

- [x] 2.1 Write `apps/frontend/src/types/index.ts` defining: `BrowserSession`, `TimelineEvent` (discriminated union on `type: "action" | "network_event" | "dom_mutation" | "intent"`), `Workflow`, `WorkflowStep`, `ApiEquivalent`, `UiReplayStep`, `ReplayResult` — field names matching the DB schema from `docs/Proposl_v1.md`. Mark each type with `// TODO: promote to @teachmeany/shared` comment.
- [x] 2.2 Write `apps/frontend/src/lib/mock-data.ts` with exported factory functions: `mockSession()`, `mockSessions()`, `mockTimelineEvent(type)`, `mockWorkflow()`, `mockReplayResult(mode)` returning realistic data using domain field names
- [x] 2.3 Write `apps/frontend/src/lib/api-client.ts` exporting the `ApiClient` interface and a concrete `apiClient` stub object. Each method wraps a `new Promise(resolve => setTimeout(() => resolve(mock...), 100 + Math.random() * 300))`. Methods: `createSession`, `getSessions`, `getSession`, `startRecording`, `stopRecording`, `getWorkflows`, `getWorkflow`, `triggerReplay`
- [x] 2.4 Write `apps/frontend/src/lib/use-session-ws.ts` exporting `useSessionWs(sessionId: string): { events: TimelineEvent[], connected: boolean }`. Uses `setInterval` to append one new mock event every 1500ms, cycling through all four event types. Cleans up interval on unmount. Reports `connected: true` after 300ms.

## 3. Session Launcher Page (apps/frontend)

- [x] 3.1 Write `apps/frontend/src/app/layout.tsx` — root layout with `<html lang="en" className="dark">`, global font (Inter from next/font), and `globals.css` import
- [x] 3.2 Write `apps/frontend/src/app/page.tsx` — session launcher route. Renders `<SessionLauncher />` centered on a dark background with the TeachMeAny wordmark
- [x] 3.3 Write `apps/frontend/src/components/session-launcher.tsx` — form with a URL `<Input>`, Zod validation (non-empty, valid URL), "Start session" `<Button>` with loading state calling `apiClient.createSession`, then `router.push('/session/[id]')` on success. Renders `<RecentSessions />` below the form.
- [x] 3.4 Write `apps/frontend/src/components/recent-sessions.tsx` — calls `apiClient.getSessions()` in a `useEffect`, renders a list of session cards (url, status badge, relative created_at). Shows empty state when list is empty. Each card is a `Link` to `/session/[id]`.

## 4. Session Workspace Layout (apps/frontend)

- [x] 4.1 Write `apps/frontend/src/app/session/[id]/layout.tsx` — loads the session via `apiClient.getSession(id)` (in a `useEffect` on the client), passes session to child context. Renders the recording controls bar at the top.
- [x] 4.2 Write `apps/frontend/src/components/recording-controls.tsx` — receives `session: BrowserSession`. Shows `start_url`, a status badge, and Start/Stop Recording buttons. Calls `apiClient.startRecording / stopRecording` with optimistic state update. Shows a pulsing red dot when status is `"recording"`.
- [x] 4.3 Write `apps/frontend/src/app/session/[id]/page.tsx` — three-column workspace layout using CSS grid: left column (60%) renders `<BrowserPane sessionId={id} />`, right column top (30% height) renders `<EventTimeline sessionId={id} onSelectNetworkEvent={...} />`, right column bottom (70% height) renders `<DetailPanelTabs sessionId={id} selectedEvent={...} />`.

## 5. Browser Pane Component (apps/frontend)

- [x] 5.1 Write `apps/frontend/src/components/browser-pane.tsx` — accepts `sessionId: string`. Renders a bordered placeholder div filling the column height with a centered label "Remote browser" and a muted note "noVNC stream will appear here when backend is connected". Include a `// BACKEND_HOOK: mount noVNC WebSocket here` comment at the integration point.

## 6. Event Timeline Component (apps/frontend)

- [x] 6.1 Write `apps/frontend/src/components/event-timeline.tsx` — accepts `sessionId: string` and `onSelectNetworkEvent: (event: NetworkEvent) => void`. Calls `useSessionWs(sessionId)`. Renders a scrollable `<ul>` auto-scrolling to the bottom on new events. Shows disconnected banner when `connected` is false. Shows empty state when `events` is empty.
- [x] 6.2 Write `apps/frontend/src/components/timeline-row.tsx` — receives a single `TimelineEvent`. Renders different icons and content per `type`: action (cursor icon + label), network_event (arrow icon + method + short URL), dom_mutation (code icon + summary), intent (sparkle icon + name + confidence badge). Clickable for `network_event` type (calls `onSelectNetworkEvent`). Highlights when selected.

## 7. Network Details Panel (apps/frontend)

- [x] 7.1 Write `apps/frontend/src/components/network-details-panel.tsx` — accepts `event: NetworkEventDetail | null`. When null, shows "Select a network event from the timeline to inspect it". When set, renders: HTTP method badge, full URL, response status with colour coding (green 2xx, amber 3xx, red 4xx/5xx), "Triggered by" chip if `action_id` is non-null, request body JSON block (or "No request body"), response body JSON block (or "No response body").
- [x] 7.2 Write `apps/frontend/src/components/json-viewer.tsx` — renders a JSON value as a syntax-highlighted `<pre>` block with Tailwind prose colours. Handles `null`, objects, and arrays.

## 8. Workflow Panel (apps/frontend)

- [x] 8.1 Write `apps/frontend/src/components/workflow-panel.tsx` — accepts `sessionId: string`. Calls `apiClient.getWorkflows(sessionId)` in `useEffect`. Renders a list of workflow cards (name, description, step count). Selecting a card opens `<WorkflowDetail workflow={...} />` inline.
- [x] 8.2 Write `apps/frontend/src/components/workflow-detail.tsx` — accepts `workflow: Workflow`. Renders two columns: left is a numbered list of `ui_replay` steps (type + selector + value), right is the `api_equivalent` block using `<JsonViewer>`. Shows "API equivalent not yet extracted" when `api_equivalent` is null. Includes a `<Link>` to `/session/[id]/workflow/[wid]` labelled "View full workflow →".
- [x] 8.3 Write `apps/frontend/src/app/session/[id]/workflow/[wid]/page.tsx` — full-page workflow view. Loads `apiClient.getWorkflow(sessionId, workflowId)`. Renders `<WorkflowDetail>` and `<ReplayPanel workflowId={wid} />` stacked vertically.

## 9. Replay Panel (apps/frontend)

- [x] 9.1 Write `apps/frontend/src/components/replay-panel.tsx` — accepts `workflowId: string | null`. When null, shows disabled buttons and "Select a workflow to replay". When set, renders two `<Button>` components: "Replay via UI" and "Call API directly". Each calls `apiClient.triggerReplay(workflowId, mode)`, shows a loading state, then renders `<ReplayResult result={...} />`.
- [x] 9.2 Write `apps/frontend/src/components/replay-result-card.tsx` — accepts `mode: 'ui' | 'api'` and `result: ReplayResult`. Shows status (success/failure with icon), elapsed time, and result body. When both UI and API results are available (parent manages state), parent renders them in a two-column layout with a visual match indicator.

## 10. Detail Panel Tabs and Final Wiring (apps/frontend)

- [x] 10.1 Write `apps/frontend/src/components/detail-panel-tabs.tsx` — wraps shadcn/ui `<Tabs>` with three values: `"network"`, `"workflow"`, `"replay"`. Accepts `sessionId`, `selectedNetworkEvent`. Passes props to `<NetworkDetailsPanel>`, `<WorkflowPanel>`, `<ReplayPanel>`. Defaults to `"network"` tab; switches to `"network"` tab automatically when `selectedNetworkEvent` changes.
- [x] 10.2 Wire state in `apps/frontend/src/app/session/[id]/page.tsx`: add `useState<NetworkEventDetail | null>` for selected network event, pass `onSelectNetworkEvent` down to `<EventTimeline>`, pass `selectedNetworkEvent` to `<DetailPanelTabs>`.
- [x] 10.3 Run `npm install` and `npm run dev` in `apps/frontend/` and verify all routes load without TypeScript errors: `/`, `/session/mock-id`, `/session/mock-id/workflow/mock-wid`.
- [x] 10.4 Verify gap layer contracts: confirm no component file contains a direct `fetch(` call or `new WebSocket(` — all backend calls go through `apiClient` or `useSessionWs`.
