import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import Fastify from "fastify";

import { db } from "./db/client";
import { runMigrations } from "./db/migrate";
import { env } from "./env";
import { actionRoutes } from "./routes/actions";
import { captureIngestRoutes } from "./routes/capture-ingest";
import { healthRoutes } from "./routes/health";
import { networkEventRoutes } from "./routes/network-events";
import { recordingRoutes } from "./routes/recording";
import { replayRoutes } from "./routes/replay";
import { sessionRoutes } from "./routes/sessions";
import { websocketRoutes } from "./routes/ws";
import { interactionSearchRoutes } from "./routes/interaction-search";
import { workflowRoutes } from "./routes/workflows";
import { redis } from "./redis/client";
import { redisSubscriber } from "./redis/subscriber";

async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: env.NODE_ENV === "development" ? true : false
  });

  await app.register(websocket);

  app.decorate("db", db);
  app.decorate("redis", redis);

  await app.register(healthRoutes);
  await app.register(sessionRoutes);
  await app.register(recordingRoutes);
  await app.register(actionRoutes);
  await app.register(networkEventRoutes);
  await app.register(captureIngestRoutes);
  await app.register(workflowRoutes);
  await app.register(interactionSearchRoutes);
  await app.register(replayRoutes);
  await app.register(websocketRoutes);
  app.log.info("\n" + app.printRoutes());

  return app;
}

async function main() {
  await runMigrations();
  const app = await buildServer();

  const close = async () => {
    await app.close();
    await Promise.all([db.end(), redis.quit(), redisSubscriber.quit()]);
  };

  process.on("SIGTERM", () => {
    close().finally(() => process.exit(0));
  });
  process.on("SIGINT", () => {
    close().finally(() => process.exit(0));
  });

  await app.listen({ host: "0.0.0.0", port: env.PORT });
}

main().catch(async (error) => {
  console.error(error);
  await Promise.allSettled([db.end(), redis.quit(), redisSubscriber.quit()]);
  process.exit(1);
});
