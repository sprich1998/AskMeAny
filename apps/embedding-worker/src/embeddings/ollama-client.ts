import type { EmbeddingClient } from "./embedding-client";

type OllamaEmbeddingResponse = {
  embedding: number[];
};

export class OllamaEmbeddingClient implements EmbeddingClient {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string
  ) {}

  async embed(text: string): Promise<number[]> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error("Embedding text cannot be empty");
    }

    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        prompt: trimmed
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding failed with status ${response.status}`);
    }

    const data = (await response.json()) as OllamaEmbeddingResponse;
    if (!Array.isArray(data.embedding) || data.embedding.length === 0) {
      throw new Error("Ollama embedding response did not include a vector");
    }

    return data.embedding;
  }
}
