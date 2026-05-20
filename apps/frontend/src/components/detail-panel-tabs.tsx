"use client";

import { useEffect, useState } from "react";
import type { NetworkEventDetail } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkDetailsPanel } from "@/components/network-details-panel";
import { WorkflowPanel } from "@/components/workflow-panel";
import { ReplayPanel } from "@/components/replay-panel";

type DetailPanelTabsProps = {
  sessionId: string;
  selectedNetworkEvent: NetworkEventDetail | null;
  workflowId?: string | null;
};

export function DetailPanelTabs({
  sessionId,
  selectedNetworkEvent,
  workflowId: workflowIdProp = null,
}: DetailPanelTabsProps) {
  const [tab, setTab] = useState("network");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    workflowIdProp
  );
  const workflowId = selectedWorkflowId ?? workflowIdProp;

  useEffect(() => {
    if (selectedNetworkEvent) {
      setTab("network");
    }
  }, [selectedNetworkEvent]);

  return (
    <Tabs value={tab} onValueChange={setTab} className="flex h-full flex-col">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="network">Network</TabsTrigger>
        <TabsTrigger value="workflow">Workflow</TabsTrigger>
        <TabsTrigger value="replay">Replay</TabsTrigger>
      </TabsList>
      <TabsContent value="network" className="flex-1 overflow-y-auto">
        <NetworkDetailsPanel event={selectedNetworkEvent} />
      </TabsContent>
      <TabsContent value="workflow" className="flex-1 overflow-hidden">
        <WorkflowPanel
          sessionId={sessionId}
          onWorkflowSelect={setSelectedWorkflowId}
        />
      </TabsContent>
      <TabsContent value="replay" className="flex-1 overflow-y-auto">
        <ReplayPanel workflowId={workflowId} />
      </TabsContent>
    </Tabs>
  );
}
