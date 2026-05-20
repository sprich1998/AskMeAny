"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import type { NetworkEventDetail } from "@/types";
import { BrowserPane } from "@/components/browser-pane";
import { EventTimeline } from "@/components/event-timeline";
import { DetailPanelTabs } from "@/components/detail-panel-tabs";

export default function SessionWorkspacePage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [selectedNetworkEvent, setSelectedNetworkEvent] =
    useState<NetworkEventDetail | null>(null);

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[3fr_2fr] lg:grid-rows-1">
      <div className="min-h-[480px] lg:row-span-1">
        <BrowserPane />
      </div>
      <div className="flex min-h-[480px] flex-col gap-4">
        <div className="h-[30%] min-h-[160px]">
          <EventTimeline
            sessionId={sessionId}
            selectedEventId={selectedNetworkEvent?.id ?? null}
            onSelectNetworkEvent={setSelectedNetworkEvent}
          />
        </div>
        <div className="h-[70%] min-h-[240px] overflow-hidden rounded-lg border border-border bg-card p-3">
          <DetailPanelTabs
            sessionId={sessionId}
            selectedNetworkEvent={selectedNetworkEvent}
          />
        </div>
      </div>
    </div>
  );
}
