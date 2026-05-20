import { env } from "../env";
import type { EmbeddingClient } from "./embedding-client";
import { OllamaEmbeddingClient } from "./ollama-client";

export function createEmbeddingClient(): EmbeddingClient {
  switch (env.EMBEDDING_PROVIDER) {
    case "ollama":
      return new OllamaEmbeddingClient(env.OLLAMA_URL, env.OLLAMA_EMBEDDING_MODEL);
    default: {
      const provider: never = env.EMBEDDING_PROVIDER;
      throw new Error(`Unknown embedding provider: ${provider}`);
    }
  }
}
