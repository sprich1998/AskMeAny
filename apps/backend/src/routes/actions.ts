import { ListActionsResponseSchema } from "@teachmeany/shared";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { listActionsBySession } from "../db/queries/action.queries";
import { findSessionById } from "../db/queries/session.queries";

const SessionParamsSchema = z.object({
  id: z.string().uuid()
});

export const actionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/sessions/:id/actions", async (request, reply) => {
    const params = SessionParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const session = await findSessionById(params.data.id);
    if (!session) {
      return reply.status(404).send({ error: "Session not found", code: "NOT_FOUND" });
    }

    const actions = await listActionsBySession(params.data.id);
    const response = { actions, total: actions.length };
    ListActionsResponseSchema.parse(response);
    return response;
  });
};
