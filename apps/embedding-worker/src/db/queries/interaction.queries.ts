import type { Action, BrowserSession, Intent, NetworkEvent } from "@teachmeany/shared";

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

type NetworkEventRow = {
  id: string;
  session_id: string;
  action_id: string | null;
  method: string;
  url: string;
  request_headers: Record<string, unknown> | null;
  request_body: unknown;
  response_status: number;
  response_headers: Record<string, unknown> | null;
  response_body: unknown;
  timestamp: Date;
};

type IntentRow = {
  id: string;
  action_id: string;
  name: string;
  description: string;
  confidence: number;
  source: string;
  created_at: Date;
};

type SessionRow = {
  id: string;
  start_url: string;
  current_url: string;
  status: BrowserSession["status"];
  created_at: Date;
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

function toNetworkEvent(row: NetworkEventRow): NetworkEvent {
  return {
    id: row.id,
    sessionId: row.session_id,
    actionId: row.action_id,
    method: row.method,
    url: row.url,
    requestHeaders: row.request_headers,
    requestBody: row.request_body,
    responseStatus: row.response_status,
    responseHeaders: row.response_headers,
    responseBody: row.response_body,
    timestamp: row.timestamp.toISOString()
  };
}

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

function toSession(row: SessionRow): BrowserSession {
  return {
    id: row.id,
    startUrl: row.start_url,
    currentUrl: row.current_url,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    vncUrl: null
  };
}

export async function findActionById(actionId: string): Promise<Action | null> {
  const [row] = await db<ActionRow[]>`
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
    WHERE id = ${actionId}
    LIMIT 1
  `;

  return row ? toAction(row) : null;
}

export async function findNetworkEventById(networkEventId: string): Promise<NetworkEvent | null> {
  const [row] = await db<NetworkEventRow[]>`
    SELECT
      id,
      session_id,
      action_id,
      method,
      url,
      request_headers,
      request_body,
      response_status,
      response_headers,
      response_body,
      timestamp
    FROM network_events
    WHERE id = ${networkEventId}
    LIMIT 1
  `;

  return row ? toNetworkEvent(row) : null;
}

export async function findNetworkEventByActionId(actionId: string): Promise<NetworkEvent | null> {
  const [row] = await db<NetworkEventRow[]>`
    SELECT
      id,
      session_id,
      action_id,
      method,
      url,
      request_headers,
      request_body,
      response_status,
      response_headers,
      response_body,
      timestamp
    FROM network_events
    WHERE action_id = ${actionId}
    ORDER BY timestamp ASC
    LIMIT 1
  `;

  return row ? toNetworkEvent(row) : null;
}

export async function findIntentByActionId(actionId: string): Promise<Intent | null> {
  const [row] = await db<IntentRow[]>`
    SELECT id, action_id, name, description, confidence, source, created_at
    FROM intents
    WHERE action_id = ${actionId}
    LIMIT 1
  `;

  return row ? toIntent(row) : null;
}

export async function findSessionById(sessionId: string): Promise<BrowserSession | null> {
  const [row] = await db<SessionRow[]>`
    SELECT id, start_url, current_url, status, created_at
    FROM browser_sessions
    WHERE id = ${sessionId}
    LIMIT 1
  `;

  return row ? toSession(row) : null;
}
