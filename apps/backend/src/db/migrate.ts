import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { db } from "./client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../../../../infra/postgres/migrations");

export async function runMigrations(): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  for (const filename of files) {
    const alreadyApplied = await db<{ filename: string }[]>`
      SELECT filename
      FROM schema_migrations
      WHERE filename = ${filename}
      LIMIT 1
    `;

    if (alreadyApplied.length > 0) {
      continue;
    }

    const migrationSql = await readFile(path.join(migrationsDir, filename), "utf8");
    await db.begin(async (tx) => {
      await tx.unsafe(migrationSql);
      await tx`
        INSERT INTO schema_migrations (filename)
        VALUES (${filename})
      `;
    });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runMigrations()
    .then(async () => {
      await db.end();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("Migration failed", error);
      await db.end();
      process.exit(1);
    });
}
