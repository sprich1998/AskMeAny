import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { findSessionById, updateSessionStatus } from "../db/queries/session.queries";
import { env } from "../env";
import { extractWorkflowForSession } from "../services/workflow-extractor";

const SessionParamsSchema = z.object({
  id: z.string().uuid()
});

export const recordingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/sessions/:id/recording/start", async (request, reply) => {
    const params = SessionParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const session = await findSessionById(params.data.id);
    if (!session) {
      return reply.status(404).send({ error: "Session not found", code: "NOT_FOUND" });
    }

    if (session.status === "recording") {
      return reply
        .status(409)
        .send({ error: "Session is already recording", code: "INVALID_STATE" });
    }

    if (session.status === "stopped") {
      return reply.status(409).send({ error: "Session is stopped", code: "INVALID_STATE" });
    }

    if (session.status !== "active") {
      return reply.status(409).send({ error: "Session is not active", code: "INVALID_STATE" });
    }

    await updateSessionStatus(session.id, "recording");
    return { sessionId: session.id, status: "recording" };
  });

  fastify.post("/sessions/:id/recording/stop", async (request, reply) => {
    const params = SessionParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const session = await findSessionById(params.data.id);
    if (!session) {
      return reply.status(404).send({ error: "Session not found", code: "NOT_FOUND" });
    }

    if (session.status !== "recording") {
      return reply
        .status(409)
        .send({ error: "Session is not recording", code: "INVALID_STATE" });
    }

    await updateSessionStatus(session.id, "active");

    let workflowId: string | null = null;
    if (env.WORKFLOW_EXTRACT_ON_STOP) {
      const workflow = await extractWorkflowForSession(session.id);
      workflowId = workflow?.id ?? null;
    }

    return { sessionId: session.id, status: "active", workflowId };
  });
};
