import { isMockMode } from "@/lib/http";
import { mockApiClient } from "@/lib/api-client.mock";
import { realApiClient } from "@/lib/api-client.real";
import type { BrowserSession, NetworkEventDetail, ReplayMode, ReplayResult, Workflow } from "@/types";

export interface ApiClient {
  createSession(startUrl: string): Promise<BrowserSession>;
  getSessions(): Promise<BrowserSession[]>;
  getSession(id: string): Promise<BrowserSession>;
  startRecording(sessionId: string): Promise<void>;
  stopRecording(sessionId: string): Promise<void>;
  getWorkflows(sessionId: string): Promise<Workflow[]>;
  getWorkflow(sessionId: string, workflowId: string): Promise<Workflow>;
  triggerReplay(workflowId: string, mode: ReplayMode): Promise<ReplayResult>;
  getNetworkEvents(sessionId: string): Promise<NetworkEventDetail[]>;
  searchInteractions(query: string, limit?: number): Promise<InteractionSearchHit[]>;
}

export type InteractionSearchHit = {
  action_id: string;
  session_id: string;
  score: number;
  label: string | null;
  request_method: string | null;
  request_url: string | null;
  inferred_intent: string | null;
};

export const apiClient: ApiClient = isMockMode() ? mockApiClient : realApiClient;
