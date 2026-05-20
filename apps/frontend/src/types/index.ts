// TODO: promote to @teachmeany/shared
export type BrowserSessionStatus =
  | "created"
  | "active"
  | "recording"
  | "stopped"
  | "error";

// TODO: promote to @teachmeany/shared
export type BrowserSession = {
  id: string;
  start_url: string;
  current_url: string;
  status: BrowserSessionStatus;
  created_at: string;
  vnc_url: string | null;
};

// TODO: promote to @teachmeany/shared
export type ActionTimelineEvent = {
  type: "action";
  id: string;
  session_id: string;
  page_snapshot_id: string;
  action_type: string;
  label: string;
  selector: string;
  xpath: string;
  element: Record<string, unknown> | null;
  value: Record<string, unknown> | null;
  timestamp: string;
};

// TODO: promote to @teachmeany/shared
export type NetworkEventTimelineEvent = {
  type: "network_event";
  id: string;
  session_id: string;
  action_id: string | null;
  method: string;
  url: string;
  response_status: number;
  timestamp: string;
  action_label?: string;
};

// TODO: promote to @teachmeany/shared
export type NetworkEventDetail = {
  id: string;
  session_id: string;
  action_id: string | null;
  method: string;
  url: string;
  request_headers: Record<string, string> | null;
  request_body: unknown | null;
  response_status: number;
  response_headers: Record<string, string> | null;
  response_body: unknown | null;
  timestamp: string;
  action_label?: string;
};

// TODO: promote to @teachmeany/shared
export type DomMutationTimelineEvent = {
  type: "dom_mutation";
  id: string;
  session_id: string;
  action_id: string;
  before_hash: string;
  after_hash: string;
  mutation_summary: Record<string, unknown>;
  timestamp: string;
};

// TODO: promote to @teachmeany/shared
export type IntentTimelineEvent = {
  type: "intent";
  id: string;
  action_id: string;
  name: string;
  description: string;
  confidence: number;
  source: string;
  created_at: string;
  timestamp: string;
};

// TODO: promote to @teachmeany/shared
export type TimelineEvent =
  | ActionTimelineEvent
  | NetworkEventTimelineEvent
  | DomMutationTimelineEvent
  | IntentTimelineEvent;

// TODO: promote to @teachmeany/shared
export type UiReplayStep = {
  type: string;
  selector: string;
  value?: string;
};

// TODO: promote to @teachmeany/shared
export type ApiEquivalent = {
  method: string;
  url: string;
  body?: unknown;
};

// TODO: promote to @teachmeany/shared
export type WorkflowStep = {
  id: string;
  workflow_id: string;
  action_id: string;
  order_index: number;
  step_type: string;
  api_equivalent: ApiEquivalent | null;
  ui_replay: UiReplayStep[];
};

// TODO: promote to @teachmeany/shared
export type Workflow = {
  id: string;
  session_id: string;
  name: string;
  description: string;
  created_at: string;
  steps: WorkflowStep[];
};

// TODO: promote to @teachmeany/shared
export type ReplayMode = "ui" | "api";

// TODO: promote to @teachmeany/shared
export type ReplayResult = {
  status: "success" | "failure" | "accepted";
  replay_id?: string;
  elapsed_ms: number;
  result: unknown;
  error?: string;
};

export type TimelineEventType = TimelineEvent["type"];
