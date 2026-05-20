import type { NetworkEvent } from "@teachmeany/shared";

import { db } from "../client";

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

type InsertNetworkEventInput = {
  sessionId: string;
  actionId: string | null;
  method: string;
  url: string;
  requestHeaders: Record<string, unknown> | null;
  requestBody: unknown;
  responseStatus: number;
  responseHeaders: Record<string, unknown> | null;
  responseBody: unknown;
};

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

export async function listNetworkEventsBySession(sessionId: string): Promise<NetworkEvent[]> {
  const rows = await db<NetworkEventRow[]>`
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
    WHERE session_id = ${sessionId}
    ORDER BY timestamp ASC
  `;

  return rows.map(toNetworkEvent);
}

export async function insertNetworkEvent(
  input: InsertNetworkEventInput
): Promise<NetworkEvent> {
  const rows = (await db`
    INSERT INTO network_events (
      session_id,
      action_id,
      method,
      url,
      request_headers,
      request_body,
      response_status,
      response_headers,
      response_body
    )
    VALUES (
      ${input.sessionId},
      ${input.actionId},
      ${input.method},
      ${input.url},
      ${db.json(input.requestHeaders as unknown as never)},
      ${db.json(input.requestBody as never)},
      ${input.responseStatus},
      ${db.json(input.responseHeaders as unknown as never)},
      ${db.json(input.responseBody as never)}
    )
    RETURNING
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
  `) as unknown as NetworkEventRow[];
  const [row] = rows;
  return toNetworkEvent(row);
}
