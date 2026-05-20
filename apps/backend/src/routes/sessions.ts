import {
  CreateSessionBodySchema,
  ListSessionsResponseSchema,
  SessionResponseSchema,
  UpdateSessionRuntimeBodySchema
} from "@teachmeany/shared";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import {
  findSessionById,
  insertSession,
  listSessions,
  updateSessionRuntime,
  updateSessionStatus
} from "../db/queries/session.queries";
import { enqueueBrowserLaunch } from "../jobs/browser-launch-producer";

const SessionParamsSchema = z.object({
  id: z.string().uuid()
});

export const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/sessions", async (request, reply) => {
    const parsed = CreateSessionBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const session = await insertSession(parsed.data.startUrl);
    await enqueueBrowserLaunch({ sessionId: session.id, startUrl: session.startUrl });
    SessionResponseSchema.parse(session);
    return reply.status(201).send(session);
  });

  fastify.get("/sessions", async () => {
    const sessions = await listSessions();
    const response = { sessions, total: sessions.length };
    ListSessionsResponseSchema.parse(response);
    return response;
  });

  fastify.get("/sessions/:id", async (request, reply) => {
    const params = SessionParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const session = await findSessionById(params.data.id);
    if (!session) {
      return reply.status(404).send({ error: "Session not found", code: "NOT_FOUND" });
    }

    return session;
  });

  fastify.delete("/sessions/:id", async (request, reply) => {
    const params = SessionParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const session = await findSessionById(params.data.id);
    if (!session) {
      return reply.status(404).send({ error: "Session not found", code: "NOT_FOUND" });
    }

    const stopped = await updateSessionStatus(params.data.id, "stopped");
    return stopped ?? session;
  });

  fastify.patch("/sessions/:id", async (request, reply) => {
    const params = SessionParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const body = UpdateSessionRuntimeBodySchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const session = await updateSessionRuntime(params.data.id, body.data);
    if (!session) {
      return reply.status(404).send({ error: "Session not found", code: "NOT_FOUND" });
    }

    return session;
  });
};
