export interface ActionElement {
  tagName?: string;
  id?: string | null;
  classes?: string[];
  text?: string | null;
  attributes?: Record<string, string>;
}

export interface Action {
  id: string;
  sessionId: string;
  pageSnapshotId: string | null;
  type: string;
  label: string;
  selector: string;
  xpath: string;
  element: ActionElement | null;
  value: unknown;
  timestamp: string;
  networkEventId: string | null;
}

export interface NetworkEvent {
  id: string;
  sessionId: string;
  actionId: string | null;
  method: string;
  url: string;
  requestHeaders: Record<string, unknown> | null;
  requestBody: unknown;
  responseStatus: number;
  responseHeaders: Record<string, unknown> | null;
  responseBody: unknown;
  timestamp: string;
}

export interface DomMutation {
  id: string;
  sessionId: string;
  actionId: string;
  beforeHash: string;
  afterHash: string;
  mutationSummary: unknown;
}

export interface Intent {
  id: string;
  actionId: string;
  name: string;
  description: string;
  confidence: number;
  source: string;
  createdAt: string;
}
