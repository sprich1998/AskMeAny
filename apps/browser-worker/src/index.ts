import { createReplayWorker } from "./jobs/replay-consumer";
import { redis } from "./redis/client";
import { createBrowserLaunchWorker } from "./session/launch-job";
import { sessionManager } from "./session/session-manager";

async function main(): Promise<void> {
  const browserLaunchWorker = createBrowserLaunchWorker();
  const replayWorker = createReplayWorker();

  console.info("browser-worker started");

  const close = async (): Promise<void> => {
    await Promise.allSettled([browserLaunchWorker.close(), replayWorker.close()]);
    await sessionManager.closeAll();
    await redis.quit();
  };

  process.on("SIGTERM", () => {
    close().finally(() => process.exit(0));
  });

  process.on("SIGINT", () => {
    close().finally(() => process.exit(0));
  });
}

main().catch(async (error: unknown) => {
  console.error(error);
  await Promise.allSettled([sessionManager.closeAll(), redis.quit()]);
  process.exit(1);
});
