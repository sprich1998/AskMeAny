import type { FastifyPluginAsync } from "fastify";

import { db } from "../db/client";
import { redis } from "../redis/client";

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", async () => {
    let postgresStatus: "connected" | "error" = "connected";
    let redisStatus: "connected" | "error" = "connected";

    try {
      await db`SELECT 1`;
    } catch {
      postgresStatus = "error";
    }

    try {
      await redis.ping();
    } catch {
      redisStatus = "error";
    }

    const status = postgresStatus === "connected" && redisStatus === "connected" ? "ok" : "degraded";

    return {
      status,
      postgres: postgresStatus,
      redis: redisStatus,
      uptime: Math.floor(process.uptime())
    };
  });
};
