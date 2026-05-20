# Postgres

**Source of truth** for TeachMeAny V1.

## Layout

| Path | Purpose |
|------|---------|
| [`migrations/`](migrations/) | Versioned SQL migrations |
| [`init/`](init/) | First-boot scripts (extensions, roles) |

## Tables (V1)

`browser_sessions`, `page_snapshots`, `actions`, `network_events`, `dom_mutations`, `intents`, `workflows`, `workflow_steps`

See `Proposl_v1.md` §6 for field-level design.
