import type { Action } from "@teachmeany/shared";

import { db } from "../client";

type ActionRow = {
  id: string;
  session_id: string;
  page_snapshot_id: string | null;
  type: string;
  label: string;
  selector: string;
  xpath: string;
  element: Action["element"];
  value: unknown;
  timestamp: Date;
};

type InsertActionInput = {
  sessionId: string;
  pageSnapshotId: string | null;
  type: string;
  label: string;
  selector: string;
  xpath: string;
  element: Action["element"];
  value: unknown;
};

function toAction(row: ActionRow): Action {
  return {
    id: row.id,
    sessionId: row.session_id,
    pageSnapshotId: row.page_snapshot_id,
    type: row.type,
    label: row.label,
    selector: row.selector,
    xpath: row.xpath,
    element: row.element,
    value: row.value,
    timestamp: row.timestamp.toISOString(),
    networkEventId: null
  };
}

export async function listActionsBySession(sessionId: string): Promise<Action[]> {
  const rows = await db<ActionRow[]>`
    SELECT
      id,
      session_id,
      page_snapshot_id,
      type,
      label,
      selector,
      xpath,
      element,
      value,
      timestamp
    FROM actions
    WHERE session_id = ${sessionId}
    ORDER BY timestamp ASC
  `;

  return rows.map(toAction);
}

export async function insertAction(input: InsertActionInput): Promise<Action> {
  const rows = (await db`
    INSERT INTO actions (
      session_id,
      page_snapshot_id,
      type,
      label,
      selector,
      xpath,
      element,
      value
    )
    VALUES (
      ${input.sessionId},
      ${input.pageSnapshotId},
      ${input.type},
      ${input.label},
      ${input.selector},
      ${input.xpath},
      ${db.json(input.element as unknown as never)},
      ${db.json(input.value as never)}
    )
    RETURNING
      id,
      session_id,
      page_snapshot_id,
      type,
      label,
      selector,
      xpath,
      element,
      value,
      timestamp
  `) as unknown as ActionRow[];
  const [row] = rows;
  return toAction(row);
}
