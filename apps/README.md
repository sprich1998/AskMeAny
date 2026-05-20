# Apps

Application services for TeachMeAny V1. Each subdirectory is a **separate Docker container**.

| App | Container | Stack |
|-----|-----------|-------|
| [`frontend/`](frontend/) | `frontend` | Next.js, React, TypeScript, noVNC client |
| [`backend/`](backend/) | `backend` | Fastify, WebSocket, session API |
| [`browser-worker/`](browser-worker/) | `browser-worker` | Playwright, Chromium, CDP, capture engine |
| [`embedding-worker/`](embedding-worker/) | `embedding-worker` | BullMQ consumer, embeddings → Qdrant |

Shared code lives in [`packages/shared/`](../packages/shared/).
