import type { Workflow } from "@teachmeany/shared";

import { listActionsBySession } from "../db/queries/action.queries";
import { listNetworkEventsBySession } from "../db/queries/network-event.queries";
import { findSessionById } from "../db/queries/session.queries";
import {
  insertWorkflow,
  insertWorkflowStep,
  listWorkflowsBySession
} from "../db/queries/workflow.queries";

function parseRequestBody(body: unknown): unknown {
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as unknown;
    } catch {
      return body;
    }
  }

  return body ?? null;
}

function mapStepType(actionType: string): string {
  if (actionType === "input") {
    return "fill";
  }

  return actionType;
}

function workflowNameFromUrl(url: string): string {
  try {
    return `Workflow on ${new URL(url).hostname}`;
  } catch {
    return "Session workflow";
  }
}

export async function extractWorkflowForSession(sessionId: string): Promise<Workflow | null> {
  const actions = await listActionsBySession(sessionId);
  if (actions.length === 0) {
    return null;
  }

  const existing = await listWorkflowsBySession(sessionId);
  if (existing.length > 0) {
    return existing[0];
  }

  const networkEvents = await listNetworkEventsBySession(sessionId);
  const networkByActionId = new Map(
    networkEvents
      .filter((event) => event.actionId)
      .map((event) => [event.actionId as string, event])
  );

  const session = await findSessionById(sessionId);
  const workflow = await insertWorkflow({
    sessionId,
    name: workflowNameFromUrl(session?.startUrl ?? "https://local"),
    description: `Extracted ${actions.length} captured action(s)`
  });

  for (const [index, action] of actions.entries()) {
    const network = networkByActionId.get(action.id);
    const apiEquivalent = network
      ? {
          method: network.method,
          url: network.url,
          body: parseRequestBody(network.requestBody)
        }
      : null;

    await insertWorkflowStep({
      workflowId: workflow.id,
      actionId: action.id,
      orderIndex: index,
      stepType: mapStepType(action.type),
      apiEquivalent
    });
  }

  workflow.stepCount = actions.length;
  return workflow;
}
