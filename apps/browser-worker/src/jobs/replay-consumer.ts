import { Worker, type Job } from "bullmq";
import {
  REPLAY_SESSION_QUEUE,
  ReplaySessionJobPayloadSchema,
  type ReplaySessionJobPayload
} from "@teachmeany/shared";

import { getWorkflow } from "../backend/client";
import { runReplay } from "../playwright/replay-runner";
import { redis } from "../redis/client";

async function handleReplay(payload: ReplaySessionJobPayload): Promise<void> {
  console.info("Received replay job", {
    replayId: payload.replayId,
    workflowId: payload.workflowId,
    sessionId: payload.sessionId,
    mode: payload.mode
  });

  const workflow = await getWorkflow(payload.workflowId);
  await runReplay(payload.sessionId, workflow, payload.mode);
}

export function createReplayWorker(): Worker<ReplaySessionJobPayload> {
  return new Worker<ReplaySessionJobPayload>(
    REPLAY_SESSION_QUEUE,
    async (job: Job<ReplaySessionJobPayload>) => {
      const payload = ReplaySessionJobPayloadSchema.parse(job.data);
      await handleReplay(payload);
    },
    {
      connection: redis
    }
  );
}
