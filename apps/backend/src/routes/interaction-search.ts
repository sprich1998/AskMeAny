import {
  InteractionSearchRequestSchema,
  InteractionSearchResponseSchema
} from "@teachmeany/shared";
import type { FastifyPluginAsync } from "fastify";

import { searchInteractions } from "../services/interaction-search";

export const interactionSearchRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/interactions/search", async (request, reply) => {
    const parsed = InteractionSearchRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    try {
      const results = await searchInteractions(parsed.data.query, parsed.data.limit);
      const response = { results, total: results.length };
      InteractionSearchResponseSchema.parse(response);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed";
      if (message.includes("Ollama") || message.includes("fetch")) {
        return reply.status(503).send({
          error: "Embedding service unavailable",
          code: "SERVICE_UNAVAILABLE"
        });
      }

      fastify.log.error(error);
      return reply.status(500).send({
        error: message,
        code: "SEARCH_FAILED"
      });
    }
  });
};
