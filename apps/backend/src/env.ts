import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  QDRANT_URL: z.string().url().default("http://localhost:6333"),
  OLLAMA_URL: z.string().url().default("http://localhost:11434"),
  OLLAMA_EMBEDDING_MODEL: z.string().default("nomic-embed-text"),
  EMBEDDING_VECTOR_SIZE: z.coerce.number().int().positive().default(768),
  WORKFLOW_EXTRACT_ON_STOP: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CORS_ORIGIN: z.string().optional()
});

export const env = EnvSchema.parse(process.env);
