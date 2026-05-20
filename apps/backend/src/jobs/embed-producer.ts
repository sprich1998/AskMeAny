import { Queue } from "bullmq";
import {
  EMBED_INTERACTION_QUEUE,
  EmbedInteractionJobPayloadSchema,
  type EmbedInteractionJobPayload
} from "@teachmeany/shared";

import { redis } from "../redis/client";

const embedQueue = new Queue(EMBED_INTERACTION_QUEUE, {
  connection: redis
});

export async function enqueueEmbedInteraction(payload: EmbedInteractionJobPayload): Promise<void> {
  const validated = EmbedInteractionJobPayloadSchema.parse(payload);

  await embedQueue.add("embed-interaction", validated);
}
