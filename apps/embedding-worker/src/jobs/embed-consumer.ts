import { Worker, type Job } from "bullmq";
import {
  EMBED_INTERACTION_QUEUE,
  EmbedInteractionJobPayloadSchema,
  type EmbedInteractionJobPayload,
  type InteractionMemoryPayload
} from "@teachmeany/shared";

import {
  findActionById,
  findIntentByActionId,
  findNetworkEventByActionId,
  findNetworkEventById,
  findSessionById
} from "../db/queries/interaction.queries";
import { createEmbeddingClient } from "../embeddings/create-embedding-client";
import { buildInteractionText } from "../embeddings/interaction-text";
import { upsertInteractionMemory } from "../embeddings/qdrant-store";
import { redis } from "../redis/client";

const embeddingClient = createEmbeddingClient();

async function handleEmbedInteraction(
  job: Job<EmbedInteractionJobPayload>,
  payload: EmbedInteractionJobPayload
): Promise<void> {
  console.info("Embed job started", {
    jobId: job.id,
    sessionId: payload.sessionId,
    actionId: payload.actionId
  });

  const action = await findActionById(payload.actionId);
  if (!action) {
    throw new Error(`Action not found: ${payload.actionId}`);
  }

  if (action.sessionId !== payload.sessionId) {
    throw new Error(
      `Action ${payload.actionId} belongs to session ${action.sessionId}, not ${payload.sessionId}`
    );
  }

  const session = await findSessionById(payload.sessionId);
  if (!session) {
    throw new Error(`Session not found: ${payload.sessionId}`);
  }

  let networkEvent = null;
  if (payload.networkEventId) {
    networkEvent = await findNetworkEventById(payload.networkEventId);
  } else {
    networkEvent = await findNetworkEventByActionId(payload.actionId);
  }

  const intent = await findIntentByActionId(payload.actionId);
  const text = buildInteractionText({
    action,
    session,
    networkEvent,
    intent
  });

  const vector = await embeddingClient.embed(text);

  const qdrantPayload: InteractionMemoryPayload = {
    action_id: action.id,
    session_id: session.id,
    url: session.currentUrl || session.startUrl,
    action_type: action.type,
    label: action.label,
    request_method: networkEvent?.method ?? null,
    request_url: networkEvent?.url ?? null,
    inferred_intent: intent ? intent.description || intent.name : null
  };

  await upsertInteractionMemory(action.id, vector, qdrantPayload);

  console.info("Embed job completed", {
    jobId: job.id,
    sessionId: payload.sessionId,
    actionId: payload.actionId,
    pointId: action.id
  });
}

export function createEmbedWorker(): Worker<EmbedInteractionJobPayload> {
  return new Worker<EmbedInteractionJobPayload>(
    EMBED_INTERACTION_QUEUE,
    async (job: Job<EmbedInteractionJobPayload>) => {
      const payload = EmbedInteractionJobPayloadSchema.parse(job.data);

      try {
        await handleEmbedInteraction(job, payload);
      } catch (error: unknown) {
        console.error("Embed job failed", {
          jobId: job.id,
          sessionId: payload.sessionId,
          actionId: payload.actionId,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    },
    {
      connection: redis
    }
  );
}
