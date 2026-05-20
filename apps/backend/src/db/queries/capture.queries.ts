import type { DomMutation, Intent } from "@teachmeany/shared";

import { db } from "../client";

type IntentRow = {
  id: string;
  action_id: string;
  name: string;
  description: string;
  confidence: number;
  source: string;
  created_at: Date;
};

type DomMutationRow = {
  id: string;
  session_id: string;
  action_id: string;
  before_hash: string;
  after_hash: string;
  mutation_summary: unknown;
};

function toIntent(row: IntentRow): Intent {
  return {
    id: row.id,
    actionId: row.action_id,
    name: row.name,
    description: row.description,
    confidence: row.confidence,
    source: row.source,
    createdAt: row.created_at.toISOString()
  };
}

function toDomMutation(row: DomMutationRow): DomMutation {
  return {
    id: row.id,
    sessionId: row.session_id,
    actionId: row.action_id,
    beforeHash: row.before_hash,
    afterHash: row.after_hash,
    mutationSummary: row.mutation_summary
  };
}

export async function insertIntent(input: {
  actionId: string;
  name: string;
  description: string;
  confidence: number;
  source: string;
}): Promise<Intent> {
  const [row] = await db<IntentRow[]>`
    INSERT INTO intents (action_id, name, description, confidence, source)
    VALUES (${input.actionId}, ${input.name}, ${input.description}, ${input.confidence}, ${input.source})
    RETURNING id, action_id, name, description, confidence, source, created_at
  `;

  return toIntent(row);
}

export async function insertDomMutation(input: {
  sessionId: string;
  actionId: string;
  beforeHash: string;
  afterHash: string;
  mutationSummary: unknown;
}): Promise<DomMutation> {
  const [row] = await db<DomMutationRow[]>`
    INSERT INTO dom_mutations (
      session_id,
      action_id,
      before_hash,
      after_hash,
      mutation_summary
    )
    VALUES (
      ${input.sessionId},
      ${input.actionId},
      ${input.beforeHash},
      ${input.afterHash},
      ${db.json(input.mutationSummary as never)}
    )
    RETURNING id, session_id, action_id, before_hash, after_hash, mutation_summary
  `;

  return toDomMutation(row);
}
