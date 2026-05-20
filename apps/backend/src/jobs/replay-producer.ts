import { Queue } from "bullmq";
import {
  REPLAY_SESSION_QUEUE,
  ReplaySessionJobPayloadSchema,
  type ReplaySessionJobPayload
} from "@teachmeany/shared";

import { redis } from "../redis/client";

const replayQueue = new Queue(REPLAY_SESSION_QUEUE, {
  connection: redis
});

export async function enqueueReplaySession(payload: ReplaySessionJobPayload): Promise<void> {
  const validated = ReplaySessionJobPayloadSchema.parse(payload);

  await replayQueue.add("replay-session", validated);
}
