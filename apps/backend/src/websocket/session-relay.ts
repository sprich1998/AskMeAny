type SocketLike = {
  send: (data: string) => void;
  readyState?: number;
};

const sessionClients = new Map<string, Set<SocketLike>>();

export function addClient(sessionId: string, client: SocketLike): boolean {
  const existing = sessionClients.get(sessionId);
  if (existing) {
    existing.add(client);
    return false;
  }

  sessionClients.set(sessionId, new Set([client]));
  return true;
}

export function removeClient(sessionId: string, client: SocketLike): { isEmpty: boolean } {
  const clients = sessionClients.get(sessionId);
  if (!clients) {
    return { isEmpty: true };
  }

  clients.delete(client);
  if (clients.size === 0) {
    sessionClients.delete(sessionId);
    return { isEmpty: true };
  }

  return { isEmpty: false };
}

export function broadcastToSession(sessionId: string, payload: string): void {
  const clients = sessionClients.get(sessionId);
  if (!clients) {
    return;
  }

  for (const client of clients) {
    try {
      client.send(payload);
    } catch {
      // Ignore individual websocket send failures.
    }
  }
}
