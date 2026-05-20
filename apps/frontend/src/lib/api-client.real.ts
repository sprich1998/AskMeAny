import {
  InteractionSearchResponseSchema,
  ListNetworkEventsResponseSchema,
  ListSessionsResponseSchema,
  ListWorkflowsResponseSchema,
  ReplayJobAcceptedSchema,
  SessionResponseSchema,
  WorkflowWithStepsSchema,
} from "@teachmeany/shared";

import type { ApiClient, InteractionSearchHit } from "@/lib/api-client";
import { apiFetch } from "@/lib/http";
import {
  mapNetworkEventDetail,
  mapReplayAccepted,
  mapSession,
  mapWorkflow,
  mapWorkflowRecord,
} from "@/lib/mappers";
import type { BrowserSession, NetworkEventDetail, ReplayMode, ReplayResult, Workflow } from "@/types";

export const realApiClient: ApiClient = {
  async createSession(startUrl: string): Promise<BrowserSession> {
    const { data } = await apiFetch<unknown>("/sessions", {
      method: "POST",
      body: JSON.stringify({ startUrl }),
    });
    return mapSession(SessionResponseSchema.parse(data));
  },

  async getSessions(): Promise<BrowserSession[]> {
    const { data } = await apiFetch<unknown>("/sessions");
    const parsed = ListSessionsResponseSchema.parse(data);
    return parsed.sessions.map(mapSession);
  },

  async getSession(id: string): Promise<BrowserSession> {
    const { data } = await apiFetch<unknown>(`/sessions/${id}`);
    return mapSession(SessionResponseSchema.parse(data));
  },

  async startRecording(sessionId: string): Promise<void> {
    await apiFetch(`/sessions/${sessionId}/recording/start`, {
      method: "POST",
    });
  },

  async stopRecording(sessionId: string): Promise<void> {
    await apiFetch(`/sessions/${sessionId}/recording/stop`, {
      method: "POST",
    });
  },

  async getWorkflows(sessionId: string): Promise<Workflow[]> {
    const { data } = await apiFetch<unknown>(`/sessions/${sessionId}/workflows`);
    const parsed = ListWorkflowsResponseSchema.parse(data);
    return parsed.workflows.map(mapWorkflowRecord);
  },

  async getWorkflow(_sessionId: string, workflowId: string): Promise<Workflow> {
    const { data } = await apiFetch<unknown>(`/workflows/${workflowId}`);
    return mapWorkflow(WorkflowWithStepsSchema.parse(data));
  },

  async triggerReplay(workflowId: string, mode: ReplayMode): Promise<ReplayResult> {
    const { data } = await apiFetch<unknown>(`/workflows/${workflowId}/replay`, {
      method: "POST",
      body: JSON.stringify({ mode }),
    });
    return mapReplayAccepted(ReplayJobAcceptedSchema.parse(data));
  },

  async getNetworkEvents(sessionId: string): Promise<NetworkEventDetail[]> {
    const { data } = await apiFetch<unknown>(`/sessions/${sessionId}/network-events`);
    const parsed = ListNetworkEventsResponseSchema.parse(data);
    return parsed.networkEvents.map(mapNetworkEventDetail);
  },

  async searchInteractions(query: string, limit = 5): Promise<InteractionSearchHit[]> {
    const { data } = await apiFetch<unknown>("/interactions/search", {
      method: "POST",
      body: JSON.stringify({ query, limit }),
    });
    const parsed = InteractionSearchResponseSchema.parse(data);
    return parsed.results.map((hit) => ({
      action_id: hit.actionId,
      session_id: hit.sessionId,
      score: hit.score,
      label: hit.label,
      request_method: hit.requestMethod,
      request_url: hit.requestUrl,
      inferred_intent: hit.inferredIntent,
    }));
  },
};
