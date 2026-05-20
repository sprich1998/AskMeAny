import {
  IngestInteractionBundleSchema,
  SessionResponseSchema,
  UpdateSessionRuntimeBodySchema,
  WorkflowWithStepsSchema,
  type BrowserSession,
  type IngestInteractionBundle,
  type UpdateSessionRuntimeBody,
  type WorkflowWithSteps
} from "@teachmeany/shared";

import { env } from "../env";

async function requestJson<T>(
  path: string,
  init: RequestInit,
  parse: (value: unknown) => T
): Promise<T> {
  const response = await fetch(new URL(path, env.BACKEND_URL), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Backend request failed ${response.status}: ${body}`);
  }

  return parse(await response.json());
}

export async function getSession(sessionId: string): Promise<BrowserSession> {
  return requestJson(`/sessions/${sessionId}`, { method: "GET" }, (value) =>
    SessionResponseSchema.parse(value)
  );
}

export async function updateSessionRuntime(
  sessionId: string,
  body: UpdateSessionRuntimeBody
): Promise<BrowserSession> {
  const validated = UpdateSessionRuntimeBodySchema.parse(body);

  return requestJson(
    `/sessions/${sessionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(validated)
    },
    (value) => SessionResponseSchema.parse(value)
  );
}

export async function ingestInteraction(
  sessionId: string,
  body: IngestInteractionBundle
): Promise<void> {
  const validated = IngestInteractionBundleSchema.parse(body);

  await requestJson(
    `/sessions/${sessionId}/ingest`,
    {
      method: "POST",
      body: JSON.stringify(validated)
    },
    () => undefined
  );
}

export async function getWorkflow(workflowId: string): Promise<WorkflowWithSteps> {
  return requestJson(`/workflows/${workflowId}`, { method: "GET" }, (value) =>
    WorkflowWithStepsSchema.parse(value)
  );
}
