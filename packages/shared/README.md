# `@teachmeany/shared`

Shared TypeScript package for all apps.

## Contents

| Path | Purpose |
|------|---------|
| [`src/types/`](src/types/) | Domain types: `Action`, `NetworkEvent`, `Intent`, `Workflow` |
| [`src/schemas/`](src/schemas/) | Zod validation for API payloads and stored JSONB |
| [`src/constants/`](src/constants/) | Queue names, collection names, correlation defaults |

Keep this package free of Node-only or browser-only APIs so both frontend and workers can import it.
