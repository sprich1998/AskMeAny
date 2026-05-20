import type { Workflow, WorkflowStep } from "@teachmeany/shared";

import { db } from "../client";

type WorkflowRow = {
  id: string;
  session_id: string;
  name: string;
  description: string;
  created_at: Date;
  step_count?: number;
};

type WorkflowStepRow = {
  id: string;
  workflow_id: string;
  action_id: string;
  order_index: number;
  step_type: string;
  api_equivalent: WorkflowStep["apiEquivalent"];
  selector: string | null;
  value: unknown;
};

function toWorkflow(row: WorkflowRow): Workflow {
  return {
    id: row.id,
    sessionId: row.session_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at.toISOString(),
    stepCount: row.step_count
  };
}

function toWorkflowStep(row: WorkflowStepRow): WorkflowStep {
  return {
    id: row.id,
    workflowId: row.workflow_id,
    actionId: row.action_id,
    orderIndex: row.order_index,
    stepType: row.step_type,
    apiEquivalent: row.api_equivalent,
    selector: row.selector,
    value: row.value
  };
}

export type InsertWorkflowInput = {
  sessionId: string;
  name: string;
  description: string;
};

export type InsertWorkflowStepInput = {
  workflowId: string;
  actionId: string;
  orderIndex: number;
  stepType: string;
  apiEquivalent: WorkflowStep["apiEquivalent"];
};

export async function insertWorkflow(input: InsertWorkflowInput): Promise<Workflow> {
  const [row] = await db<WorkflowRow[]>`
    INSERT INTO workflows (session_id, name, description)
    VALUES (${input.sessionId}, ${input.name}, ${input.description})
    RETURNING id, session_id, name, description, created_at
  `;

  return toWorkflow(row);
}

export async function insertWorkflowStep(input: InsertWorkflowStepInput): Promise<WorkflowStep> {
  const [row] = await db<WorkflowStepRow[]>`
    INSERT INTO workflow_steps (
      workflow_id,
      action_id,
      order_index,
      step_type,
      api_equivalent
    )
    VALUES (
      ${input.workflowId},
      ${input.actionId},
      ${input.orderIndex},
      ${input.stepType},
      ${db.json(input.apiEquivalent as never)}
    )
    RETURNING id, workflow_id, action_id, order_index, step_type, api_equivalent
  `;

  return toWorkflowStep({
    ...row,
    selector: null,
    value: null
  });
}

export async function listWorkflowsBySession(sessionId: string): Promise<Workflow[]> {
  const rows = await db<WorkflowRow[]>`
    SELECT
      w.id,
      w.session_id,
      w.name,
      w.description,
      w.created_at,
      COUNT(ws.id)::int AS step_count
    FROM workflows w
    LEFT JOIN workflow_steps ws ON ws.workflow_id = w.id
    WHERE w.session_id = ${sessionId}
    GROUP BY w.id
    ORDER BY w.created_at DESC
  `;

  return rows.map(toWorkflow);
}

export async function findWorkflowById(id: string): Promise<Workflow | null> {
  const [row] = await db<WorkflowRow[]>`
    SELECT
      w.id,
      w.session_id,
      w.name,
      w.description,
      w.created_at,
      COUNT(ws.id)::int AS step_count
    FROM workflows w
    LEFT JOIN workflow_steps ws ON ws.workflow_id = w.id
    WHERE w.id = ${id}
    GROUP BY w.id
    LIMIT 1
  `;

  return row ? toWorkflow(row) : null;
}

export async function findWorkflowWithSteps(id: string): Promise<Workflow | null> {
  const workflow = await findWorkflowById(id);
  if (!workflow) {
    return null;
  }

  const stepRows = await db<WorkflowStepRow[]>`
    SELECT
      ws.id,
      ws.workflow_id,
      ws.action_id,
      ws.order_index,
      ws.step_type,
      ws.api_equivalent,
      a.selector,
      a.value
    FROM workflow_steps ws
    INNER JOIN actions a ON a.id = ws.action_id
    WHERE ws.workflow_id = ${id}
    ORDER BY ws.order_index ASC
  `;

  workflow.steps = stepRows.map(toWorkflowStep);
  return workflow;
}
