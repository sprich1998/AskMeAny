"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { Workflow } from "@/types";
import { WorkflowDetail } from "@/components/workflow-detail";
import { ReplayPanel } from "@/components/replay-panel";

export default function WorkflowPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const workflowId = params.wid as string;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getWorkflow(sessionId, workflowId)
      .then(setWorkflow)
      .finally(() => setLoading(false));
  }, [sessionId, workflowId]);

  if (loading) {
    return (
      <div className="p-8 text-muted-foreground">Loading workflow…</div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-8">
        <p>Workflow not found</p>
        <Link href={`/session/${sessionId}`} className="text-primary">
          ← Back to session
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <Link
        href={`/session/${sessionId}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to session
      </Link>
      <WorkflowDetail workflow={workflow} />
      <section className="rounded-lg border border-border p-4">
        <h2 className="mb-4 text-lg font-semibold">Replay</h2>
        <ReplayPanel workflowId={workflowId} />
      </section>
    </div>
  );
}
