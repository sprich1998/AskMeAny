import {
  IngestInteractionBundleSchema,
  TimelineEventEnvelopeSchema
} from "@teachmeany/shared";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { insertAction } from "../db/queries/action.queries";
import { insertDomMutation, insertIntent } from "../db/queries/capture.queries";
import { findSessionById } from "../db/queries/session.queries";
import { insertNetworkEvent } from "../db/queries/network-event.queries";
import { enqueueEmbedInteraction } from "../jobs/embed-producer";

const SessionParamsSchema = z.object({
  id: z.string().uuid()
});

export const captureIngestRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/sessions/:id/ingest", async (request, reply) => {
    const params = SessionParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const parsed = IngestInteractionBundleSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation failed", code: "INVALID_INPUT" });
    }

    const session = await findSessionById(params.data.id);
    if (!session) {
      return reply.status(404).send({ error: "Session not found", code: "NOT_FOUND" });
    }

    const action = await insertAction({
      sessionId: session.id,
      pageSnapshotId: null,
      type: parsed.data.action.type,
      label: parsed.data.action.label,
      selector: parsed.data.action.selector,
      xpath: parsed.data.action.xpath,
      element: parsed.data.action.element,
      value: parsed.data.action.value ?? null
    });

    let networkEvent = null;
    if (parsed.data.networkEvent) {
      networkEvent = await insertNetworkEvent({
        sessionId: session.id,
        actionId: action.id,
        method: parsed.data.networkEvent.method,
        url: parsed.data.networkEvent.url,
        requestHeaders: parsed.data.networkEvent.requestHeaders ?? null,
        requestBody: parsed.data.networkEvent.requestBody ?? null,
        responseStatus: parsed.data.networkEvent.responseStatus,
        responseHeaders: parsed.data.networkEvent.responseHeaders ?? null,
        responseBody: parsed.data.networkEvent.responseBody ?? null
      });
    }

    const actionEvent = TimelineEventEnvelopeSchema.parse({
      type: "action",
      data: {
        ...action,
        networkEventId: networkEvent?.id ?? null
      }
    });
    await fastify.redis.publish(`timeline:${session.id}`, JSON.stringify(actionEvent));

    if (networkEvent) {
      const networkTimelineEvent = TimelineEventEnvelopeSchema.parse({
        type: "network_event",
        data: networkEvent
      });
      await fastify.redis.publish(`timeline:${session.id}`, JSON.stringify(networkTimelineEvent));
    }

    let intent = null;
    if (parsed.data.intent) {
      intent = await insertIntent({
        actionId: action.id,
        name: parsed.data.intent.name,
        description: parsed.data.intent.description,
        confidence: parsed.data.intent.confidence,
        source: parsed.data.intent.source
      });

      const intentEvent = TimelineEventEnvelopeSchema.parse({
        type: "intent",
        data: intent
      });
      await fastify.redis.publish(`timeline:${session.id}`, JSON.stringify(intentEvent));
    }

    let domMutation = null;
    if (parsed.data.domMutation) {
      domMutation = await insertDomMutation({
        sessionId: session.id,
        actionId: action.id,
        beforeHash: parsed.data.domMutation.beforeHash,
        afterHash: parsed.data.domMutation.afterHash,
        mutationSummary: parsed.data.domMutation.mutationSummary
      });

      const domMutationEvent = TimelineEventEnvelopeSchema.parse({
        type: "dom_mutation",
        data: domMutation
      });
      await fastify.redis.publish(`timeline:${session.id}`, JSON.stringify(domMutationEvent));
    }

    await enqueueEmbedInteraction({
      sessionId: session.id,
      actionId: action.id,
      networkEventId: networkEvent?.id ?? null,
      timestamp: action.timestamp
    });

    return reply.status(201).send({
      action,
      networkEvent,
      intent,
      domMutation
    });
  });
};
