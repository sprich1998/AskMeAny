import { env } from "../env";

type OllamaEmbeddingResponse = {
  embedding: number[];
};

export async function embedQueryText(text: string): Promise<number[]> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Embedding text cannot be empty");
  }

  const response = await fetch(`${env.OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.OLLAMA_EMBEDDING_MODEL,
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

  if (data.embedding.length !== env.EMBEDDING_VECTOR_SIZE) {
    throw new Error(
      `Embedding vector size ${data.embedding.length} does not match EMBEDDING_VECTOR_SIZE ${env.EMBEDDING_VECTOR_SIZE}`
    );
  }

  return data.embedding;
}
