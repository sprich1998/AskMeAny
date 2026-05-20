import type {
  BrowserSession,
  NetworkEventDetail,
  ReplayMode,
  ReplayResult,
  TimelineEvent,
  TimelineEventType,
  Workflow,
} from "@/types";

let sessionCounter = 1;
let eventCounter = 1;

function uuid(prefix: string): string {
  return `${prefix}-${sessionCounter++}-${eventCounter++}`;
}

export function mockSession(overrides?: Partial<BrowserSession>): BrowserSession {
  const id = overrides?.id ?? uuid("session");
  return {
    id,
    start_url: overrides?.start_url ?? "https://example.com/app",
    current_url: overrides?.current_url ?? "https://example.com/app/dashboard",
    status: overrides?.status ?? "active",
    created_at: overrides?.created_at ?? new Date().toISOString(),
    vnc_url: overrides?.vnc_url ?? null,
  };
}

export function mockSessions(): BrowserSession[] {
  const now = Date.now();
  return [
    mockSession({
      id: "mock-session-1",
      start_url: "https://crm.example.com/clients",
      status: "recording",
      created_at: new Date(now - 3600000).toISOString(),
    }),
    mockSession({
      id: "mock-session-2",
      start_url: "https://app.example.com/login",
      status: "stopped",
      created_at: new Date(now - 86400000).toISOString(),
    }),
    mockSession({
      id: "mock-id",
      start_url: "https://demo.teachmeany.local",
      status: "active",
      created_at: new Date(now - 120000).toISOString(),
    }),
  ];
}

const EVENT_TYPES: TimelineEventType[] = [
  "action",
  "network_event",
  "dom_mutation",
  "intent",
];

export function mockTimelineEvent(
  type?: TimelineEventType,
  sessionId = "mock-id"
): TimelineEvent {
  const eventType = type ?? EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const ts = new Date().toISOString();

  switch (eventType) {
    case "action":
      return {
        type: "action",
        id: uuid("action"),
        session_id: sessionId,
        page_snapshot_id: uuid("snapshot"),
        action_type: "click",
        label: "Search button",
        selector: "button[data-testid='search']",
        xpath: "//button[@data-testid='search']",
        element: { tag: "button" },
        value: null,
        timestamp: ts,
      };
    case "network_event":
      return {
        type: "network_event",
        id: uuid("net"),
        session_id: sessionId,
        action_id: uuid("action"),
        method: "POST",
        url: "https://api.example.com/client/search",
        response_status: 200,
        timestamp: ts,
        action_label: "Search button",
      };
    case "dom_mutation":
      return {
        type: "dom_mutation",
        id: uuid("dom"),
        session_id: sessionId,
        action_id: uuid("action"),
        before_hash: "abc123",
        after_hash: "def456",
        mutation_summary: {
          added: 2,
          removed: 0,
          summary: "Results table updated",
        },
        timestamp: ts,
      };
    case "intent":
      return {
        type: "intent",
        id: uuid("intent"),
        action_id: uuid("action"),
        name: "search_client",
        description: "User searched for a client record",
        confidence: 0.92,
        source: "llm",
        created_at: ts,
        timestamp: ts,
      };
  }
}

export function mockNetworkEventDetail(
  event: Extract<TimelineEvent, { type: "network_event" }>
): NetworkEventDetail {
  return {
    id: event.id,
    session_id: event.session_id,
    action_id: event.action_id,
    method: event.method,
    url: event.url,
    request_headers: { "content-type": "application/json" },
    request_body: { clientId: "12345" },
    response_status: event.response_status,
    response_headers: { "content-type": "application/json" },
    response_body: { results: [{ id: "c-1", name: "Acme Corp" }] },
    timestamp: event.timestamp,
    action_label: event.action_label,
  };
}

export function mockWorkflow(
  sessionId = "mock-id",
  workflowId = "mock-wid"
): Workflow {
  return {
    id: workflowId,
    session_id: sessionId,
    name: "Search client workflow",
    description: "Fill client ID and trigger search",
    created_at: new Date().toISOString(),
    steps: [
      {
        id: uuid("step"),
        workflow_id: workflowId,
        action_id: uuid("action"),
        order_index: 0,
        step_type: "form_submit",
        api_equivalent: {
          method: "POST",
          url: "/api/client/search",
          body: { clientId: "12345" },
        },
        ui_replay: [
          {
            type: "fill",
            selector: "input[name='clientId']",
            value: "12345",
          },
          {
            type: "click",
            selector: "button[data-testid='search']",
          },
        ],
      },
    ],
  };
}

export function mockWorkflows(sessionId: string): Workflow[] {
  return [
    mockWorkflow(sessionId, "mock-wid"),
    mockWorkflow(sessionId, "mock-wid-2"),
  ];
}

export function mockReplayResult(mode: ReplayMode): ReplayResult {
  if (mode === "ui") {
    return {
      status: "success",
      elapsed_ms: 1240,
      result: {
        steps_completed: 2,
        screenshot: "mock-screenshot.png",
      },
    };
  }
  return {
    status: "success",
    elapsed_ms: 320,
    result: {
      http_status: 200,
      body: { results: [{ id: "c-1", name: "Acme Corp" }] },
    },
  };
}

export function cycleEventType(index: number): TimelineEventType {
  return EVENT_TYPES[index % EVENT_TYPES.length];
}
