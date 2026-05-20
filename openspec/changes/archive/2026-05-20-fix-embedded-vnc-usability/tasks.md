## 1. Shared schema (`packages/shared`)

- [x] 1.1 Confirm `SessionResponseSchema` includes `vncUrl: z.string().optional().nullable()` in `packages/shared/src/schemas/session.schema.ts`
- [x] 1.2 Rebuild `@teachmeany/shared` and verify exported schema includes `vncUrl` key (grep dist or run a quick parse test)

## 2. Frontend API client (`apps/frontend`)

- [x] 2.1 Verify `mapSession` in `apps/frontend/src/lib/mappers.ts` maps `vncUrl` → `vnc_url` (fix if missing)
- [x] 2.2 Add or update a unit test: API JSON with `vncUrl` survives `SessionResponseSchema.parse` and maps correctly

## 3. Embedded VNC client (`apps/frontend`)

- [x] 3.1 Add `NEXT_PUBLIC_VNC_BASE_URL` env support (default `http://localhost:6080`) in frontend config
- [x] 3.2 Replace hollow `VncViewer` with iframe embed to `{VNC_BASE_URL}/vnc.html?autoconnect=true&resize=scale` (or refactor `BrowserPane` directly)
- [x] 3.3 Update `BrowserPane` state machine: loading (`created`), embed (`active` + `vnc_url`), timeout error, `error` status
- [x] 3.4 Remove or deprecate broken `@novnc/novnc` dynamic import path if iframe is chosen (keep dep only if still used)

## 4. Browser worker lifecycle (`apps/browser-worker`)

- [x] 4.1 In `session-manager.close()` (and shutdown handler), PATCH backend `{ status: "error", vncUrl: null }` when tearing down without explicit user stop
- [x] 4.2 Log session_id on teardown PATCH for operability

## 5. Docker Compose (`docker/compose/stack`, `docker/standalone/frontend`)

- [x] 5.1 Add `NEXT_PUBLIC_VNC_BASE_URL=http://localhost:6080` to frontend service in `docker-compose.yml`
- [x] 5.2 Verify frontend Dockerfile builds `packages/shared` before `next build` (fix copy order if stale)
- [x] 5.3 Rebuild and restart: `docker compose build --no-cache frontend && docker compose up -d frontend`

## 6. Manual verification (smoke)

- [x] 6.1 `docker compose up` full stack; create session with target URL (e.g. `https://nextgen.oncallinterpreters.com/`)
- [x] 6.2 Confirm `GET /sessions/:id` returns `vncUrl` and frontend network tab shows same field before Zod parse
- [x] 6.3 Confirm session workspace browser pane shows live site (not "stream is not available") within 30s
- [x] 6.4 Confirm keyboard/mouse interaction works in embedded pane; note if standalone `:6080/vnc.html` is required as fallback
- [x] 6.5 Restart browser-worker; confirm old session moves to `error` (not `active` + null `vncUrl`)
