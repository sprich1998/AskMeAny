"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useSessionContext } from "@/context/session-context";
import type { Workflow } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowDetail } from "@/components/workflow-detail";

type WorkflowPanelProps = {
  sessionId: string;
  onWorkflowSelect?: (workflowId: string | null) => void;
};

export function WorkflowPanel({ sessionId, onWorkflowSelect }: WorkflowPanelProps) {
  const { workflowRefreshKey } = useSessionContext();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selected, setSelected] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient
      .getWorkflows(sessionId)
      .then(async (list) => {
        setWorkflows(list);
        if (list.length === 0) {
          setSelected(null);
          onWorkflowSelect?.(null);
          return;
        }

        const full = await apiClient.getWorkflow(sessionId, list[0].id);
        setSelected(full);
        onWorkflowSelect?.(full.id);
      })
      .finally(() => setLoading(false));
  }, [sessionId, workflowRefreshKey, onWorkflowSelect]);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading workflows…</p>
    );
  }

  if (workflows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Record a workflow first (stop recording to extract)
      </p>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <ul className="space-y-2">
        {workflows.map((workflow) => (
          <li key={workflow.id}>
            <button
              type="button"
              onClick={() => {
                void apiClient.getWorkflow(sessionId, workflow.id).then((full) => {
                  setSelected(full);
                  onWorkflowSelect?.(full.id);
                });
              }}
              className="w-full text-left"
            >
              <Card
                className={
                  selected?.id === workflow.id
                    ? "ring-1 ring-ring"
                    : "hover:bg-accent/40"
                }
              >
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">{workflow.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {workflow.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {workflow.steps.length} step
                    {workflow.steps.length === 1 ? "" : "s"}
                  </p>
                </CardHeader>
              </Card>
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <div className="flex-1 overflow-y-auto border-t border-border pt-4">
          <WorkflowDetail workflow={selected} compact />
        </div>
      )}
    </div>
  );
}
