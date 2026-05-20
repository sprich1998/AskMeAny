FROM mcr.microsoft.com/playwright:v1.52.0-jammy AS builder

WORKDIR /app

COPY packages/shared/package.json packages/shared/package.json
COPY apps/browser-worker/package.json apps/browser-worker/package-lock.json ./apps/browser-worker/
RUN npm ci --prefix /app/apps/browser-worker

COPY packages/shared packages/shared
COPY apps/browser-worker apps/browser-worker

WORKDIR /app/apps/browser-worker
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.52.0-jammy AS runner

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=Etc/UTC

RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata \
    xvfb \
    x11vnc \
    novnc \
    websockify \
  && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
  && echo $TZ > /etc/timezone \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production
ENV DISPLAY=:99
ENV ENABLE_VNC=true

COPY --from=builder /app/packages/shared /app/packages/shared
COPY --from=builder /app/apps/browser-worker/package.json /app/apps/browser-worker/package.json
COPY --from=builder /app/apps/browser-worker/node_modules /app/apps/browser-worker/node_modules
COPY --from=builder /app/apps/browser-worker/dist /app/apps/browser-worker/dist
COPY apps/browser-worker/scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /app/apps/browser-worker
EXPOSE 6080
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
