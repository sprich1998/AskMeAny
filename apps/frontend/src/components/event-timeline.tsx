"use client";

import { useEffect, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { isMockMode } from "@/lib/http";
import { mapNetworkEventSummary } from "@/lib/mappers";
import { mockNetworkEventDetail } from "@/lib/mock-data";
import { useSessionWs } from "@/lib/use-session-ws";
import type { NetworkEventDetail, NetworkEventTimelineEvent } from "@/types";
import { TimelineRow } from "@/components/timeline-row";
import { Badge } from "@/components/ui/badge";

type EventTimelineProps = {
  sessionId: string;
  selectedEventId?: string | null;
  onSelectNetworkEvent: (detail: NetworkEventDetail) => void;
};

export function EventTimeline({
  sessionId,
  selectedEventId,
  onSelectNetworkEvent,
}: EventTimelineProps) {
  const { events, connected } = useSessionWs(sessionId);
  const listRef = useRef<HTMLUListElement | null>(null);
  const actionLabelsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    for (const event of events) {
      if (event.type === "action") {
        actionLabelsRef.current.set(event.id, event.label);
      }
    }
  }, [events]);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [events.length]);

  async function handleSelect(event: NetworkEventTimelineEvent) {
    const actionLabel = event.action_id
      ? actionLabelsRef.current.get(event.action_id)
      : undefined;
    const summary = mapNetworkEventSummary({
      ...event,
      action_label: actionLabel ?? event.action_label,
    });

    if (isMockMode()) {
      onSelectNetworkEvent(mockNetworkEventDetail(event));
      return;
    }

    onSelectNetworkEvent(summary);

    try {
      const networkEvents = await apiClient.getNetworkEvents(sessionId);
      const full = networkEvents.find((item) => item.id === event.id);
      if (full) {
        onSelectNetworkEvent({
          ...full,
          action_label: actionLabel ?? event.action_label,
        });
      }
    } catch {
      // keep summary from timeline event
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <h2 className="text-sm font-medium">Event timeline</h2>
        {!connected && (
          <Badge variant="destructive">Disconnected</Badge>
        )}
      </div>
      <ul
        ref={listRef}
        className="flex-1 space-y-0.5 overflow-y-auto p-2"
      >
        {events.length === 0 ? (
          <li className="py-8 text-center text-sm text-muted-foreground">
            Waiting for events…
          </li>
        ) : (
          events.map((event) => (
            <TimelineRow
              key={event.id}
              event={event}
              selected={
                event.type === "network_event" &&
                event.id === selectedEventId
              }
              onSelectNetworkEvent={
                event.type === "network_event" ? handleSelect : undefined
              }
            />
          ))
        )}
      </ul>
    </div>
  );
}
