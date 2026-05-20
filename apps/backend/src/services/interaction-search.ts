import { QdrantClient } from "@qdrant/js-client-rest";
import type { InteractionSearchResult } from "@teachmeany/shared";

import { db } from "../db/client";
import { env } from "../env";
import { embedQueryText } from "./ollama-embedder";

const INTERACTION_MEMORY_COLLECTION = "interaction_memory";

const qdrant = new QdrantClient({ url: env.QDRANT_URL });

type IntentRow = {
  action_id: string;
  name: string;
};

export async function searchInteractions(
  query: string,
  limit: number
): Promise<InteractionSearchResult[]> {
  const vector = await embedQueryText(query);

  const search = await qdrant.search(INTERACTION_MEMORY_COLLECTION, {
    vector,
    limit,
    with_payload: true
  });

  if (search.length === 0) {
    return [];
  }

  const actionIds = search
    .map((point) => point.payload?.action_id)
    .filter((id): id is string => typeof id === "string");

  if (actionIds.length === 0) {
    return [];
  }

  const intentRows = await db<IntentRow[]>`
    SELECT action_id, name
    FROM intents
    WHERE action_id = ANY(${actionIds})
  `;
  const intentByActionId = new Map(intentRows.map((row) => [row.action_id, row.name]));

  return search.map((point) => {
    const payload = point.payload ?? {};
    const actionId =
      typeof payload.action_id === "string" ? payload.action_id : "";
    const sessionId =
      typeof payload.session_id === "string" ? payload.session_id : "";

    return {
      actionId,
      sessionId,
      score: point.score ?? 0,
      label: typeof payload.label === "string" ? payload.label : null,
      requestMethod:
        typeof payload.request_method === "string" ? payload.request_method : null,
      requestUrl: typeof payload.request_url === "string" ? payload.request_url : null,
      inferredIntent: intentByActionId.get(actionId) ?? null
    };
  });
}
