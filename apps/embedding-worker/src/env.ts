import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  QDRANT_URL: z.string().url().default("http://localhost:6333"),
  EMBEDDING_PROVIDER: z.enum(["ollama"]).default("ollama"),
  OLLAMA_URL: z.string().url().default("http://localhost:11434"),
  OLLAMA_EMBEDDING_MODEL: z.string().default("nomic-embed-text"),
  EMBEDDING_VECTOR_SIZE: z.coerce.number().int().positive().default(768)
});

export const env = EnvSchema.parse(process.env);
