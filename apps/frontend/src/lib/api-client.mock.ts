import {
  mockReplayResult,
  mockSession,
  mockSessions,
  mockWorkflow,
  mockWorkflows,
} from "@/lib/mock-data";
import type { ApiClient } from "@/lib/api-client";
import type { BrowserSession, ReplayMode, ReplayResult, Workflow } from "@/types";

function delay<T>(value: T): Promise<T> {
  const ms = 100 + Math.random() * 300;
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const mockApiClient: ApiClient = {
  createSession(startUrl: string) {
    return delay(
      mockSession({
        start_url: startUrl,
        current_url: startUrl,
        status: "active",
      })
    );
  },

  getSessions() {
    return delay(mockSessions());
  },

  getSession(id: string) {
    const sessions = mockSessions();
    const found = sessions.find((s) => s.id === id);
    return delay(found ?? mockSession({ id }));
  },

  startRecording(_sessionId: string) {
    return delay(undefined);
  },

  stopRecording(_sessionId: string) {
    return delay(undefined);
  },

  getWorkflows(sessionId: string) {
    return delay(mockWorkflows(sessionId));
  },

  getWorkflow(sessionId: string, workflowId: string) {
    return delay(mockWorkflow(sessionId, workflowId));
  },

  triggerReplay(_workflowId: string, mode: ReplayMode) {
    return delay(mockReplayResult(mode));
  },

  getNetworkEvents(_sessionId: string) {
    return delay([]);
  },

  searchInteractions(_query: string) {
    return delay([]);
  },
};
