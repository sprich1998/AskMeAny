FROM node:20-alpine AS builder

WORKDIR /app

COPY packages/shared/package.json packages/shared/package-lock.json ./packages/shared/
RUN npm ci --prefix /app/packages/shared

COPY packages/shared ./packages/shared
COPY apps/frontend/package.json apps/frontend/package-lock.json ./apps/frontend/

WORKDIR /app/apps/frontend
RUN npm ci

COPY apps/frontend ./

ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app/apps/frontend

ENV NODE_ENV=production

COPY --from=builder /app/packages/shared /app/packages/shared
COPY --from=builder /app/apps/frontend/package.json ./
COPY --from=builder /app/apps/frontend/package-lock.json ./
COPY --from=builder /app/apps/frontend/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/next.config.mjs ./next.config.mjs

EXPOSE 3000
CMD ["npm", "run", "start"]
