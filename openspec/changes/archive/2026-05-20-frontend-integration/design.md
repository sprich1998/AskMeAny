## Context

The frontend kickstart delivered all six V1 screens with a deliberate gap layer: `api-client.ts` and `use-session-ws.ts` stub all backend interactions so UI could be built and demoed without a running API. The backend kickstart, browser-worker kickstart, and embedding-worker kickstart are complete and archived. Server-side data flow works today:

```
POST /sessions → browser-launch job → capture → POST /ingest → Postgres + Redis timeline + embed queue
```

The frontend is the only consumer that still uses mocks. Components correctly depend on the gap layer interface — no component calls `fetch` or `WebSocket` directly.

**Constraints:**
- Preserve the gap layer contract: components import only `apiClient` and `useSessionWs`.
- Backend API uses camelCase JSON (`startUrl`, `createdAt`); frontend view types currently use snake_case.
- `@teachmeany/shared` is isomorphic and already defines Zod schemas for all API shapes.
- Next.js App Router: gap layer modules are `"use client"` where needed; env vars must be `NEXT_PUBLIC_*`.

## Goals / Non-Goals

### Goals

- Wire `apiClient` to real Fastify REST endpoints.
- Wire `useSessionWs` to backend `/ws` subscribe protocol.
- Align session status enum with backend (`created`, `active`, `recording`, `stopped`, `error`).
- Validate API responses with shared Zod schemas at the gap layer boundary.
- Support opt-in mock mode for UI-only development (`NEXT_PUBLIC_USE_MOCKS=true`).

### Non-Goals

- noVNC browser pane integration.
- Workflow generation or replay result polling.
- Backend route or schema changes.
- Auth, Docker Compose, or shared package restructuring beyond frontend consumption.

## Decisions

### Decision 1: Mapper layer at gap boundary (not in components)

**Choice:** Add `src/lib/mappers.ts` to convert shared camelCase API records → frontend snake_case view types.

**Why:** Components already use snake_case field names throughout (matching DB column naming in the proposal). Rewriting every component to camelCase is high churn with no user benefit. Mappers keep the swap localized to two files.

**Alternative considered:** Migrate all frontend types to camelCase and import directly from `@teachmeany/shared`. Rejected for this change — larger diff, touches every component file.

### Decision 2: Add `@teachmeany/shared` as workspace dependency

**Choice:** `"@teachmeany/shared": "file:../../packages/shared"` in `apps/frontend/package.json`.

**Why:** Single source of truth for Zod validation at the HTTP boundary. Prevents type drift that caused the original `idle` vs `active` bug.

**Alternative considered:** Duplicate Zod schemas in frontend. Rejected — violates monorepo convention.

### Decision 3: Central HTTP helper with structured errors

**Choice:** `src/lib/http.ts` with `apiFetch<T>(path, init)` that:
- Prefixes `NEXT_PUBLIC_API_URL`
- Parses JSON error body `{ error, code }` on non-2xx
- Throws `ApiError` with `code` for component-level handling

**Why:** DRY for all apiClient methods; consistent error surface.

### Decision 4: WebSocket hook with reconnect

**Choice:** `useSessionWs` opens `NEXT_PUBLIC_WS_URL` (default derived from API URL: `ws://localhost:4000/ws`), sends subscribe on `open`, parses messages with `TimelineEventEnvelopeSchema`, maps to view types, appends to state.

**Reconnect:** Simple exponential backoff (max 5 attempts) on abnormal close; no reconnect on unmount.

**Why:** Backend relay is ready; minimal hook keeps components unchanged.

### Decision 5: Mock mode via env flag, default off

**Choice:** When `NEXT_PUBLIC_USE_MOCKS=true`, `api-client.ts` and `use-session-ws.ts` delegate to existing mock implementations.

**Why:** Preserves UI-only dev workflow from frontend kickstart without making mocks the default.

### Decision 6: Replay returns job acceptance, not result

**Choice:** `triggerReplay` maps backend `202` + `ReplayJobAccepted` to a frontend `ReplayResult` with `status: "accepted"` and includes `replayId`. UI shows "Replay queued" rather than fake success.

**Why:** Backend has no replay result endpoint yet; honest UX beats mock success.

**Alternative considered:** Keep returning mock success. Rejected — misleading when wired to real backend with empty workflows.

## API Mapping Reference

| ApiClient method | HTTP | Notes |
|------------------|------|-------|
| `createSession(url)` | `POST /sessions` `{ startUrl }` | Returns mapped session |
| `getSessions()` | `GET /sessions` | Unwrap `{ sessions }` |
| `getSession(id)` | `GET /sessions/:id` | |
| `startRecording(id)` | `POST /sessions/:id/recording/start` | Refetch session or optimistic `"recording"` |
| `stopRecording(id)` | `POST /sessions/:id/recording/stop` | Sets `"active"`, not `"idle"` |
| `getWorkflows(id)` | `GET /sessions/:id/workflows` | Unwrap `{ workflows }`; empty list OK |
| `getWorkflow(sid, wid)` | `GET /workflows/:wid` | Map steps to view shape |
| `triggerReplay(wid, mode)` | `POST /workflows/:wid/replay` `{ mode }` | Map 202 response |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Session stuck in `created` until browser-worker launches | Show status badge; disable Start Recording until `active` |
| WebSocket events arrive before REST session load | Hook subscribes on mount; events buffer in state regardless |
| CORS issues in production | Backend CORS is dev-open; document production config separately |
| Workflow/replay panels empty (no generator yet) | Empty states already exist; spec accepts empty arrays |
| Timeline network detail panel uses mock enrichment | Map real `network_event` WS data; fetch full detail via `GET /sessions/:id/network-events` on select (optional enhancement in tasks) |

## Migration Plan

1. Add shared dependency + env files (non-breaking).
2. Implement real api-client behind same interface (breaking for mock-only dev unless flag set).
3. Implement real use-session-ws.
4. Fix recording-controls status handling.
5. Manual E2E: start postgres/redis/backend/browser-worker/frontend; verify timeline.

**Rollback:** Set `NEXT_PUBLIC_USE_MOCKS=true` or revert api-client/use-session-ws to previous mock implementations.

## Open Questions

- Should network detail panel fetch `GET /sessions/:id/network-events/:id` or filter from a list endpoint? Backend exposes list only — select from timeline event data + optional list fetch on click.
- Should frontend poll session status while `created`? Recommended: poll `getSession` every 2s until `active` or `error` in session layout.
