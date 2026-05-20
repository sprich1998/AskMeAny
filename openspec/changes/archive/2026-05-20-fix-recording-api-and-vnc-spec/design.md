## Context

**Recording bug:** `apiFetch` always sets `Content-Type: application/json`. `startRecording` / `stopRecording` POST with no body. Fastify 4 returns 400 `FST_ERR_CTP_EMPTY_JSON_BODY`. Verified: `{}` body returns 200.

**VNC embed (already shipped):** `BrowserPane` shows iframe when `status === "active" | "recording"`. `VncViewer` loads `{NEXT_PUBLIC_VNC_BASE_URL}/vnc.html?autoconnect=true&resize=scale&reconnect=true`. User confirmed the remote site displays in the app. Canonical `session-workspace-ui` spec still says "placeholder".

## Goals / Non-Goals

**Goals:**

- Start/stop recording work from the UI without 400 errors.
- Smoke script recording steps pass.
- Main specs document actual VNC embed and recording HTTP contract.

**Non-Goals:**

- Change Fastify server body parser globally unless frontend fix is insufficient.
- Rebuild Docker images as part of this change (frontend hotfix is source-level; rebuild on deploy).

## Decisions

### 1. Fix in `apiFetch` (preferred over per-method `{}`)

**Choice:** Only set `Content-Type: application/json` when `init.body` is defined and non-empty. For POST/PUT/PATCH without a body, omit Content-Type entirely.

**Rationale:** Fixes all bodyless POSTs in one place (`startRecording`, `stopRecording`, any future routes). Matches HTTP semantics — no body, no JSON content-type.

**Alternative:** Send `body: "{}"` on every bodyless POST — works but misleading and masks the pattern.

### 2. Smoke script: use `-d '{}'` or drop Content-Type

**Choice:** Use `-d '{}'` for recording curls for explicit compatibility if someone re-adds strict JSON parsing later.

### 3. Spec updates only — no embed re-implementation

**Choice:** Archive deltas for `session-workspace-ui` and `embedded-vnc-client` reflecting:

- iframe embed on `active` / `recording`
- autoconnect query params
- `created` → loading; `error` / `stopped` → appropriate messages

Remove obsolete placeholder requirement.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Some endpoints expect JSON body | Only endpoints with actual bodies use Content-Type (createSession, triggerReplay already send body) |
| Spec drift again | Archive this change after apply so main specs match code |

## Migration Plan

1. Patch `http.ts` and smoke script.
2. Manual test: start/stop recording on active session.
3. Archive OpenSpec change to merge spec deltas into `openspec/specs/`.
4. Rebuild frontend Docker image when deploying.

## Open Questions

- None — root cause confirmed via curl.
