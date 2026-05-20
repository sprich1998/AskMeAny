"use client";

import { TimelineEventEnvelopeSchema } from "@teachmeany/shared";
import { useEffect, useRef, useState } from "react";
import { cycleEventType, mockTimelineEvent } from "@/lib/mock-data";
import { getWsUrl, isMockMode } from "@/lib/http";
import { mapTimelineEvent } from "@/lib/mappers";
import type { TimelineEvent } from "@/types";

export type UseSessionWsResult = {
  events: TimelineEvent[];
  connected: boolean;
};

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_MS = 1000;

export function useSessionWs(sessionId: string): UseSessionWsResult {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const typeIndexRef = useRef(0);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;

    if (isMockMode()) {
      const connectTimer = setTimeout(() => setConnected(true), 300);
      const interval = setInterval(() => {
        const type = cycleEventType(typeIndexRef.current);
        typeIndexRef.current += 1;
        setEvents((prev) => [...prev, mockTimelineEvent(type, sessionId)]);
      }, 1500);

      return () => {
        unmountedRef.current = true;
        clearTimeout(connectTimer);
        clearInterval(interval);
        setConnected(false);
      };
    }

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempt = 0;

    function connect() {
      ws = new WebSocket(getWsUrl());

      ws.onopen = () => {
        reconnectAttempt = 0;
        ws?.send(JSON.stringify({ type: "subscribe", sessionId }));
      };

      ws.onmessage = (message) => {
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(message.data as string);
        } catch {
          return;
        }

        if (
          typeof parsedJson === "object" &&
          parsedJson !== null &&
          "type" in parsedJson
        ) {
          const msgType = (parsedJson as { type: string }).type;
          if (msgType === "subscribed") {
            setConnected(true);
            return;
          }
          if (msgType === "error") {
            return;
          }
        }

        const envelope = TimelineEventEnvelopeSchema.safeParse(parsedJson);
        if (envelope.success) {
          setEvents((prev) => [...prev, mapTimelineEvent(envelope.data)]);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (unmountedRef.current || reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
          return;
        }
        const delay = BASE_RECONNECT_MS * 2 ** reconnectAttempt;
        reconnectAttempt += 1;
        reconnectTimer = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
      setConnected(false);
    };
  }, [sessionId]);

  return { events, connected };
}
