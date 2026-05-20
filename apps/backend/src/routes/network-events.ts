import { ListNetworkEventsResponseSchema } from "@teachmeany/shared";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { listNetworkEventsBySession } from "../db/queries/network-event.queries";
import { findSessionById } from "../db/queries/session.queries";

const SessionParamsSchema = z.object({
  id: z.string().uuid()
});

export const networkEventRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/sessions/:id/network-events", async (request, reply) => {
    const params = SessionParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const session = await findSessionById(params.data.id);
    if (!session) {
      return reply.status(404).send({ error: "Session not found", code: "NOT_FOUND" });
    }

    const networkEvents = await listNetworkEventsBySession(params.data.id);
    const response = { networkEvents, total: networkEvents.length };
    ListNetworkEventsResponseSchema.parse(response);
    return response;
  });
};
