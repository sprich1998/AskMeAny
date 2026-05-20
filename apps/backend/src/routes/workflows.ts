import { ListWorkflowsResponseSchema, WorkflowWithStepsSchema } from "@teachmeany/shared";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { findSessionById } from "../db/queries/session.queries";
import {
  findWorkflowWithSteps,
  listWorkflowsBySession
} from "../db/queries/workflow.queries";

const SessionParamsSchema = z.object({
  id: z.string().uuid()
});

const WorkflowParamsSchema = z.object({
  id: z.string().uuid()
});

export const workflowRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/sessions/:id/workflows", async (request, reply) => {
    const params = SessionParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const session = await findSessionById(params.data.id);
    if (!session) {
      return reply.status(404).send({ error: "Session not found", code: "NOT_FOUND" });
    }

    const workflows = await listWorkflowsBySession(params.data.id);
    const response = { workflows, total: workflows.length };
    ListWorkflowsResponseSchema.parse(response);
    return response;
  });

  fastify.get("/workflows/:id", async (request, reply) => {
    const params = WorkflowParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const workflow = await findWorkflowWithSteps(params.data.id);
    if (!workflow) {
      return reply.status(404).send({ error: "Workflow not found", code: "NOT_FOUND" });
    }

    WorkflowWithStepsSchema.parse(workflow);
    return workflow;
  });
};
