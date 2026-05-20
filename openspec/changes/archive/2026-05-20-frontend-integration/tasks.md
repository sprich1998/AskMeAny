## 1. Dependencies and configuration (apps/frontend)

- [x] 1.1 Add `"@teachmeany/shared": "file:../../packages/shared"` to `apps/frontend/package.json` and run `npm install`
- [x] 1.2 Write `apps/frontend/.env.example` with `NEXT_PUBLIC_API_URL=http://localhost:4000`, `NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws`, and `NEXT_PUBLIC_USE_MOCKS=false`
- [x] 1.3 Write `apps/frontend/.env.local.example` (or document in README) for local dev defaults

## 2. HTTP and mapping layer (apps/frontend)

- [x] 2.1 Write `apps/frontend/src/lib/http.ts` — `apiFetch`, `ApiError`, base URL from env
- [x] 2.2 Write `apps/frontend/src/lib/mappers.ts` — map `SessionResponse`, `WorkflowWithSteps`, `TimelineEventEnvelope`, and replay acceptance to frontend view types (camelCase → snake_case)
- [x] 2.3 Update `apps/frontend/src/types/index.ts` — extend `BrowserSessionStatus` to `created | active | recording | stopped | error`; update `ReplayResult` to support `status: "accepted"` with `replay_id`

## 3. Real ApiClient (apps/frontend)

- [x] 3.1 Refactor `apps/frontend/src/lib/api-client.ts` — extract mock implementation to `api-client.mock.ts`; default export delegates to real or mock based on `NEXT_PUBLIC_USE_MOCKS`
- [x] 3.2 Implement real session methods: `createSession`, `getSessions`, `getSession` using shared Zod schemas
- [x] 3.3 Implement real recording methods: `startRecording`, `stopRecording` with error handling for 409 `INVALID_STATE`
- [x] 3.4 Implement real workflow methods: `getWorkflows`, `getWorkflow` (handle empty list)
- [x] 3.5 Implement real `triggerReplay` — map HTTP 202 + `ReplayJobAcceptedSchema` to frontend `ReplayResult`

## 4. Real WebSocket hook (apps/frontend)

- [x] 4.1 Refactor `apps/frontend/src/lib/use-session-ws.ts` — extract mock to `use-session-ws.mock.ts`; default uses real WebSocket
- [x] 4.2 Implement subscribe protocol, `TimelineEventEnvelopeSchema` parsing, mapper integration, and reconnect with backoff
- [x] 4.3 Verify `event-timeline.tsx` renders real action/network/intent/dom_mutation events without mock enrichment where WS data suffices

## 5. Component fixes (apps/frontend)

- [x] 5.1 Update `recording-controls.tsx` — stop recording sets status `"active"` (refetch session from API); disable Start Recording when status is `created` or `error`
- [x] 5.2 Update `session/[id]/layout.tsx` — poll `getSession` every 2s while status is `created` until `active` or `error`
- [x] 5.3 Update `replay-panel.tsx` and `replay-result-card.tsx` — display "Replay queued" for `status: "accepted"` instead of mock success
- [x] 5.4 Update `network-details-panel.tsx` — use timeline/WS event fields for detail view; optionally fetch `GET /sessions/:id/network-events` on select for full request/response bodies

## 6. Verification and docs

- [x] 6.1 Run `npm run build` in `apps/frontend` — zero TypeScript errors
- [ ] 6.2 Manual E2E: with postgres, redis, backend, browser-worker running — create session, wait for `active`, start recording, interact in Playwright session, confirm timeline events appear in UI within 2s
- [x] 6.3 Update `apps/frontend/README.md` with env vars and mock mode instructions
- [x] 6.4 Update root `README.md` status line — frontend gap layer wired to backend (mock mode opt-in)
