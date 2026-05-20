FROM node:22-slim AS builder

WORKDIR /app

COPY packages/shared/package.json packages/shared/package.json
COPY apps/embedding-worker/package.json apps/embedding-worker/package.json
RUN npm install --prefix /app/apps/embedding-worker

COPY packages/shared packages/shared
COPY apps/embedding-worker apps/embedding-worker

WORKDIR /app/apps/embedding-worker
RUN npm run build

FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/packages/shared /app/packages/shared
COPY --from=builder /app/apps/embedding-worker/package.json /app/apps/embedding-worker/package.json
COPY --from=builder /app/apps/embedding-worker/node_modules /app/apps/embedding-worker/node_modules
COPY --from=builder /app/apps/embedding-worker/dist /app/apps/embedding-worker/dist

WORKDIR /app/apps/embedding-worker
CMD ["node", "dist/index.js"]
