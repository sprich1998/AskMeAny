import { QdrantClient } from "@qdrant/js-client-rest";
import {
  INTERACTION_MEMORY_COLLECTION,
  InteractionMemoryPayloadSchema,
  type InteractionMemoryPayload
} from "@teachmeany/shared";

import { env } from "../env";

export const qdrant = new QdrantClient({
  url: env.QDRANT_URL
});

export async function ensureInteractionMemoryCollection(): Promise<void> {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some(
    (collection) => collection.name === INTERACTION_MEMORY_COLLECTION
  );

  if (!exists) {
    await qdrant.createCollection(INTERACTION_MEMORY_COLLECTION, {
      vectors: {
        size: env.EMBEDDING_VECTOR_SIZE,
        distance: "Cosine"
      }
    });
    return;
  }

  const info = await qdrant.getCollection(INTERACTION_MEMORY_COLLECTION);
  const vectorSize = info.config?.params?.vectors;
  const configuredSize =
    typeof vectorSize === "object" && vectorSize !== null && "size" in vectorSize
      ? vectorSize.size
      : null;

  if (configuredSize !== null && configuredSize !== env.EMBEDDING_VECTOR_SIZE) {
    throw new Error(
      `Qdrant collection ${INTERACTION_MEMORY_COLLECTION} vector size ${configuredSize} does not match EMBEDDING_VECTOR_SIZE ${env.EMBEDDING_VECTOR_SIZE}`
    );
  }
}

export async function upsertInteractionMemory(
  actionId: string,
  vector: number[],
  payload: InteractionMemoryPayload
): Promise<void> {
  const validated = InteractionMemoryPayloadSchema.parse(payload);

  await qdrant.upsert(INTERACTION_MEMORY_COLLECTION, {
    wait: true,
    points: [
      {
        id: actionId,
        vector,
        payload: validated
      }
    ]
  });
}
