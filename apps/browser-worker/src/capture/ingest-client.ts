import type { IngestInteractionBundle } from "@teachmeany/shared";

import { ingestInteraction } from "../backend/client";

export async function submitCaptureBundle(
  sessionId: string,
  bundle: IngestInteractionBundle
): Promise<void> {
  await ingestInteraction(sessionId, bundle);
}
