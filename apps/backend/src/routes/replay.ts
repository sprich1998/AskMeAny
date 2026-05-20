import { ReplayJobAcceptedSchema, ReplayJobBodySchema } from "@teachmeany/shared";
import type { FastifyPluginAsync } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { findWorkflowById } from "../db/queries/workflow.queries";
import { enqueueReplaySession } from "../jobs/replay-producer";

const WorkflowParamsSchema = z.object({
  id: z.string().uuid()
});

export const replayRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/workflows/:id/replay", async (request, reply) => {
    const params = WorkflowParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const body = ReplayJobBodySchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const workflow = await findWorkflowById(params.data.id);
    if (!workflow) {
      return reply.status(404).send({ error: "Workflow not found", code: "NOT_FOUND" });
    }

    const replayId = randomUUID();
    await enqueueReplaySession({
      replayId,
      workflowId: workflow.id,
      sessionId: workflow.sessionId,
      mode: body.data.mode
    });

    const response = {
      accepted: true as const,
      replayId,
      workflowId: workflow.id,
      mode: body.data.mode
    };
    ReplayJobAcceptedSchema.parse(response);

    return reply.status(202).send(response);
  });
};
