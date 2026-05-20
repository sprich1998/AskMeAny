export type SessionStatus = "created" | "active" | "recording" | "stopped" | "error";

export interface BrowserSession {
  id: string;
  startUrl: string;
  currentUrl: string;
  status: SessionStatus;
  createdAt: string;
  vncUrl: string | null;
}

export interface PageSnapshot {
  id: string;
  sessionId: string;
  url: string;
  title: string;
  domHash: string;
  simplifiedDom: Record<string, unknown> | null;
  createdAt: string;
}
