"use client";

import { useEffect, useRef, useState } from "react";
import { cycleEventType, mockTimelineEvent } from "@/lib/mock-data";
import type { UseSessionWsResult } from "@/lib/use-session-ws";
import type { TimelineEvent } from "@/types";

/** Mock WebSocket hook — used when NEXT_PUBLIC_USE_MOCKS=true via use-session-ws.ts */
export function useSessionWsMock(sessionId: string): UseSessionWsResult {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const typeIndexRef = useRef(0);

  useEffect(() => {
    const connectTimer = setTimeout(() => setConnected(true), 300);

    const interval = setInterval(() => {
      const type = cycleEventType(typeIndexRef.current);
      typeIndexRef.current += 1;
      const event = mockTimelineEvent(type, sessionId);
      setEvents((prev) => [...prev, event]);
    }, 1500);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(interval);
    };
  }, [sessionId]);

  return { events, connected };
}
