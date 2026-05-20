import type { BrowserSession, SessionStatus } from "@teachmeany/shared";

import { db } from "../client";

type SessionRow = {
  id: string;
  start_url: string;
  current_url: string;
  status: SessionStatus;
  created_at: Date;
  vnc_url: string | null;
};

function toSession(row: SessionRow): BrowserSession {
  return {
    id: row.id,
    startUrl: row.start_url,
    currentUrl: row.current_url,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    vncUrl: row.vnc_url
  };
}

export async function insertSession(startUrl: string): Promise<BrowserSession> {
  const [row] = await db<SessionRow[]>`
    INSERT INTO browser_sessions (start_url, current_url, status)
    VALUES (${startUrl}, ${startUrl}, 'created')
    RETURNING id, start_url, current_url, status, created_at, vnc_url
  `;

  return toSession(row);
}

export async function findSessionById(id: string): Promise<BrowserSession | null> {
  const [row] = await db<SessionRow[]>`
    SELECT id, start_url, current_url, status, created_at, vnc_url
    FROM browser_sessions
    WHERE id = ${id}
    LIMIT 1
  `;

  return row ? toSession(row) : null;
}

export async function listSessions(): Promise<BrowserSession[]> {
  const rows = await db<SessionRow[]>`
    SELECT id, start_url, current_url, status, created_at, vnc_url
    FROM browser_sessions
    ORDER BY created_at DESC
  `;

  return rows.map(toSession);
}

export async function updateSessionStatus(
  id: string,
  status: SessionStatus
): Promise<BrowserSession | null> {
  const [row] = await db<SessionRow[]>`
    UPDATE browser_sessions
    SET status = ${status}
    WHERE id = ${id}
    RETURNING id, start_url, current_url, status, created_at, vnc_url
  `;

  return row ? toSession(row) : null;
}

export async function updateSessionRuntime(
  id: string,
  input: {
    status?: SessionStatus;
    currentUrl?: string;
    vncUrl?: string | null;
  }
): Promise<BrowserSession | null> {
  const current = await findSessionById(id);
  if (!current) {
    return null;
  }

  const nextVncUrl =
    input.vncUrl !== undefined ? input.vncUrl : current.vncUrl;

  const [row] = await db<SessionRow[]>`
    UPDATE browser_sessions
    SET
      status = ${input.status ?? current.status},
      current_url = ${input.currentUrl ?? current.currentUrl},
      vnc_url = ${nextVncUrl}
    WHERE id = ${id}
    RETURNING id, start_url, current_url, status, created_at, vnc_url
  `;

  return row ? toSession(row) : null;
}
