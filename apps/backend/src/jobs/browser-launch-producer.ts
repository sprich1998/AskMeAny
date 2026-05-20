import { Queue } from "bullmq";
import {
  BROWSER_LAUNCH_QUEUE,
  BrowserLaunchJobPayloadSchema,
  type BrowserLaunchJobPayload
} from "@teachmeany/shared";

import { redis } from "../redis/client";

const browserLaunchQueue = new Queue(BROWSER_LAUNCH_QUEUE, {
  connection: redis
});

export async function enqueueBrowserLaunch(payload: BrowserLaunchJobPayload): Promise<void> {
  const validated = BrowserLaunchJobPayloadSchema.parse(payload);

  await browserLaunchQueue.add("browser-launch", validated);
}
