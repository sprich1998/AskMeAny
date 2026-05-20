## 1. Frontend HTTP client (`apps/frontend`)

- [x] 1.1 Update `apiFetch` in `apps/frontend/src/lib/http.ts` to omit `Content-Type: application/json` when `init.body` is undefined or empty
- [x] 1.2 Verify `startRecording` and `stopRecording` in `api-client.real.ts` resolve without 400 on an active session

## 2. Smoke script (`scripts/`)

- [x] 2.1 Fix `scripts/smoke-e2e.sh` recording start/stop curls (use `-d '{}'` or omit Content-Type)

## 3. Manual verification

- [x] 3.1 Create session → confirm embedded browser visible (already working)
- [x] 3.2 Click Start Recording — no `FST_ERR_CTP_EMPTY_JSON_BODY`; status becomes `recording`
- [x] 3.3 Click Stop Recording — status returns to `active`

## 4. Spec archive (after code verified)

- [x] 4.1 Run `openspec archive fix-recording-api-and-vnc-spec` to merge spec deltas into `openspec/specs/`
