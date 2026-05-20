import { ensureInteractionMemoryCollection } from "./embeddings/qdrant-store";
import { createEmbedWorker } from "./jobs/embed-consumer";
import { db } from "./db/client";
import { redis } from "./redis/client";

async function main(): Promise<void> {
  await ensureInteractionMemoryCollection();
  const embedWorker = createEmbedWorker();

  console.info("embedding-worker started");

  const close = async (): Promise<void> => {
    await Promise.allSettled([embedWorker.close(), redis.quit(), db.end()]);
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
  await Promise.allSettled([redis.quit(), db.end()]);
  process.exit(1);
});
