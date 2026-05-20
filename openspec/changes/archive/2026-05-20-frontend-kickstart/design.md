## Context

`apps/frontend` is currently a scaffold with only README stubs. The V1 product design in `docs/Proposl_v1.md` specifies six screens: session launcher, remote browser pane, live event timeline, network details panel, extracted workflow panel, and replay panel. The backend (`apps/backend`) and browser-worker (`apps/browser-worker`) are not yet implemented. This design delivers the complete frontend UI first using a gap layer so the product can be demoed and UX-validated independently of backend readiness.

The frontend sits at the edge of the system: it talks to the backend via REST (session management, workflow retrieval) and WebSocket (real-time timeline events), and embeds the remote Chromium view via noVNC. None of these integrations exist yet, so every external call is handled by a typed stub that will be replaced when the backend is ready.

## Goals / Non-Goals

**Goals:**
- Implement all six V1 screens with realistic mock data using Next.js 14 App Router
- Define a typed gap layer (`api-client.ts` + `use-session-ws.ts`) whose interfaces are stable contracts for the future real backend integration
- Apply Tailwind CSS + shadcn/ui for a clean, dark-mode-ready developer tool aesthetic
- Keep component code 100% free of direct `fetch` or `WebSocket` calls — all such calls go through the gap layer

**Non-Goals:**
- Real HTTP calls to `apps/backend`
- Live noVNC browser stream
- Authentication or session persistence across page reloads
- Mobile or responsive breakpoints below 1024px (tool is desktop-only)
- Any route handler (API routes in Next.js) — frontend only, no server-side data fetching in this change

## Decisions

### Decision 1: App Router route structure

Three routes cover all six screens:

```
/                            → session launcher (Screen 1)
/session/[id]                → session workspace (Screens 2–5 composed in a panel layout)
/session/[id]/workflow/[wid] → workflow detail + replay (Screens 5–6 full view)
```

**Why this over a single-page panel layout**: The session workspace is a long-lived view; giving it its own URL enables future deep-linking and browser-back navigation. The workflow detail view needs its own URL for sharing and replay triggering.

**Alternatives considered**: Single-page with client-side tab state — rejected because URL-driven state is simpler to debug and aligns with the product's "inspect a past session" use case.

### Decision 2: Gap layer design

Two modules in `src/lib/` act as the only seam between UI components and external systems:

```typescript
// src/lib/api-client.ts
export interface ApiClient {
  createSession(startUrl: string): Promise<BrowserSession>;
  getSessions(): Promise<BrowserSession[]>;
  getSession(id: string): Promise<BrowserSession>;
  stopRecording(sessionId: string): Promise<void>;
  startRecording(sessionId: string): Promise<void>;
  getWorkflows(sessionId: string): Promise<Workflow[]>;
  getWorkflow(sessionId: string, workflowId: string): Promise<Workflow>;
  triggerReplay(workflowId: string, mode: 'ui' | 'api'): Promise<ReplayResult>;
}

// src/lib/use-session-ws.ts
export interface UseSessionWsResult {
  events: TimelineEvent[];
  connected: boolean;
}
export function useSessionWs(sessionId: string): UseSessionWsResult;
```

The stub implementations:
- `api-client.ts` exports a concrete `apiClient` object where every method returns mock data after a short `setTimeout` (100–400ms, randomised to feel real)
- `use-session-ws.ts` emits a new mock `TimelineEvent` every 1.5 seconds via `setInterval`

**Why not MSW (Mock Service Worker)**: MSW intercepts real `fetch` calls and requires service worker setup. The gap layer is simpler — no fetch calls to intercept — and the swap to real backend is one file change, not a configuration flag.

**Why two modules, not one**: The REST client and WebSocket hook have different lifecycles (one is called imperatively, one is a React hook). Keeping them separate makes each easier to replace independently.

### Decision 3: Styling — Tailwind CSS + shadcn/ui

shadcn/ui provides unstyled-but-accessible Radix UI primitives with Tailwind utility classes. This matches the project's developer-tool aesthetic: dense, information-rich, dark by default. Components are copied into `src/components/ui/` (shadcn convention) so they are fully owned and modifiable.

**Alternatives considered**: Chakra UI, MUI — both add heavy runtime CSS-in-JS overhead that is unnecessary for a local tool.

### Decision 4: Frontend-only types vs shared types

`packages/shared` will eventually hold isomorphic domain types used by frontend and backend. Since the backend is not implemented yet, shared types don't exist. For this change:
- Domain view types are defined in `apps/frontend/src/types/` using the exact field names from the DB schema in `docs/Proposl_v1.md`
- When `packages/shared` gains types in a backend change, the frontend types should be replaced with imports from `@teachmeany/shared`
- Types that need to be promoted are marked with a `// TODO: promote to @teachmeany/shared` comment

### Decision 5: Session workspace panel layout

The session workspace (`/session/[id]`) uses a three-column layout:
- Left: browser pane (noVNC placeholder) — takes ~60% of width
- Right top: event timeline — scrollable, 30% of height
- Right bottom: tab-switched panel (network details | workflow | replay) — 70% of height

This layout matches the Proposl_v1 wireframe description and is common in developer tool UIs (e.g. Chrome DevTools, Playwright Trace Viewer).

## Risks / Trade-offs

- **[Risk] Type drift between frontend stubs and future backend** → Mitigation: gap layer types are derived directly from the DB schema field names in `docs/Proposl_v1.md`. When the backend types land in `packages/shared`, a TypeScript import swap will surface any mismatches at compile time.

- **[Risk] noVNC pane placeholder gives a false impression of capability** → Mitigation: the browser pane renders a clearly labelled "Remote browser will appear here" placeholder with an explanatory note, so the stub state is unambiguous to any reviewer.

- **[Risk] Mock WebSocket events don't reflect the real event burst pattern** → Mitigation: the stub emits events in the correct domain types (`action`, `network_event`, `dom_mutation`, `intent`) at a plausible rate. Real event ordering is a backend concern and irrelevant to UI validation.

- **[Trade-off] No server-side rendering (all `'use client'` components)** → This is acceptable for a local tool; SSR adds complexity without benefit for a single-user Docker app.

## Open Questions

- Does `packages/shared` need to be bootstrapped (package.json, tsconfig) before `apps/frontend` can reference it, or should that be a prerequisite task?
  - Decision: bootstrap `packages/shared` minimally (package.json + index.ts exporting nothing) to satisfy the monorepo resolver, but do NOT add domain types yet. Frontend types live locally for this change.

- Should the session launcher include a URL history / recent sessions list?
  - Decision: no, V1 launcher is a single URL input field only. History is a future extension.
