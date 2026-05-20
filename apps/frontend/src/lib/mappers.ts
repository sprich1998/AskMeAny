import type {
  NetworkEventRecord,
  ReplayJobAccepted,
  SessionResponse,
  TimelineEventEnvelope,
  WorkflowRecord,
  WorkflowWithSteps,
} from "@teachmeany/shared";

import type {
  BrowserSession,
  NetworkEventDetail,
  NetworkEventTimelineEvent,
  ReplayResult,
  TimelineEvent,
  Workflow,
  WorkflowStep,
} from "@/types";

export function mapSession(session: SessionResponse): BrowserSession {
  return {
    id: session.id,
    start_url: session.startUrl,
    current_url: session.currentUrl,
    status: session.status,
    created_at: session.createdAt,
    vnc_url: session.vncUrl ?? null,
  };
}

function mapWorkflowStep(
  step: WorkflowWithSteps["steps"][number]
): WorkflowStep {
  return {
    id: step.id,
    workflow_id: step.workflowId,
    action_id: step.actionId,
    order_index: step.orderIndex,
    step_type: step.stepType,
    api_equivalent: step.apiEquivalent,
    ui_replay: step.selector
      ? [
          {
            type: step.stepType,
            selector: step.selector,
            ...(step.value != null
              ? {
                  value:
                    typeof step.value === "string"
                      ? step.value
                      : JSON.stringify(step.value),
                }
              : {}),
          },
        ]
      : [],
  };
}

export function mapWorkflow(workflow: WorkflowWithSteps): Workflow {
  return {
    id: workflow.id,
    session_id: workflow.sessionId,
    name: workflow.name,
    description: workflow.description,
    created_at: workflow.createdAt,
    steps: workflow.steps.map(mapWorkflowStep),
  };
}

export function mapWorkflowRecord(workflow: WorkflowRecord): Workflow {
  return {
    id: workflow.id,
    session_id: workflow.sessionId,
    name: workflow.name,
    description: workflow.description,
    created_at: workflow.createdAt,
    steps: [],
  };
}

export function mapTimelineEvent(envelope: TimelineEventEnvelope): TimelineEvent {
  switch (envelope.type) {
    case "action":
      return {
        type: "action",
        id: envelope.data.id,
        session_id: envelope.data.sessionId,
        page_snapshot_id: envelope.data.pageSnapshotId ?? "",
        action_type: envelope.data.type,
        label: envelope.data.label,
        selector: envelope.data.selector,
        xpath: envelope.data.xpath,
        element: envelope.data.element as Record<string, unknown> | null,
        value: envelope.data.value as Record<string, unknown> | null,
        timestamp: envelope.data.timestamp,
      };
    case "network_event":
      return {
        type: "network_event",
        id: envelope.data.id,
        session_id: envelope.data.sessionId,
        action_id: envelope.data.actionId,
        method: envelope.data.method,
        url: envelope.data.url,
        response_status: envelope.data.responseStatus,
        timestamp: envelope.data.timestamp,
      };
    case "dom_mutation":
      return {
        type: "dom_mutation",
        id: envelope.data.id,
        session_id: envelope.data.sessionId,
        action_id: envelope.data.actionId,
        before_hash: envelope.data.beforeHash,
        after_hash: envelope.data.afterHash,
        mutation_summary: envelope.data.mutationSummary as Record<string, unknown>,
        timestamp: new Date().toISOString(),
      };
    case "intent":
      return {
        type: "intent",
        id: envelope.data.id,
        action_id: envelope.data.actionId,
        name: envelope.data.name,
        description: envelope.data.description,
        confidence: envelope.data.confidence,
        source: envelope.data.source,
        created_at: envelope.data.createdAt,
        timestamp: envelope.data.createdAt,
      };
  }
}

export function mapNetworkEventSummary(
  event: NetworkEventTimelineEvent
): NetworkEventDetail {
  return {
    id: event.id,
    session_id: event.session_id,
    action_id: event.action_id,
    method: event.method,
    url: event.url,
    request_headers: null,
    request_body: null,
    response_status: event.response_status,
    response_headers: null,
    response_body: null,
    timestamp: event.timestamp,
    action_label: event.action_label,
  };
}

export function mapNetworkEventDetail(record: NetworkEventRecord): NetworkEventDetail {
  return {
    id: record.id,
    session_id: record.sessionId,
    action_id: record.actionId,
    method: record.method,
    url: record.url,
    request_headers: record.requestHeaders as Record<string, string> | null,
    request_body: record.requestBody,
    response_status: record.responseStatus,
    response_headers: record.responseHeaders as Record<string, string> | null,
    response_body: record.responseBody,
    timestamp: record.timestamp,
  };
}

export function mapReplayAccepted(accepted: ReplayJobAccepted): ReplayResult {
  return {
    status: "accepted",
    replay_id: accepted.replayId,
    elapsed_ms: 0,
    result: {
      workflow_id: accepted.workflowId,
      mode: accepted.mode,
    },
  };
}
