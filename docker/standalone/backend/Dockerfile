FROM node:20-alpine AS builder
WORKDIR /app

COPY packages/shared ./packages/shared
COPY apps/backend/package.json apps/backend/package-lock.json ./apps/backend/
RUN npm ci --prefix /app/apps/backend

COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/packages/shared /app/packages/shared
COPY --from=builder /app/apps/backend/package.json /app/apps/backend/package.json
COPY --from=builder /app/apps/backend/package-lock.json /app/apps/backend/package-lock.json
COPY --from=builder /app/apps/backend/node_modules /app/apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist /app/apps/backend/dist
COPY infra/postgres/migrations /app/infra/postgres/migrations

WORKDIR /app/apps/backend
EXPOSE 4000
CMD ["node", "dist/index.js"]
