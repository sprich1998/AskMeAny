"use client";

import Link from "next/link";
import type { Workflow } from "@/types";
import { JsonViewer } from "@/components/json-viewer";

type WorkflowDetailProps = {
  workflow: Workflow;
  compact?: boolean;
};

export function WorkflowDetail({ workflow, compact }: WorkflowDetailProps) {
  const primaryStep = workflow.steps[0];
  const apiEquivalent = primaryStep?.api_equivalent ?? null;
  const uiSteps = primaryStep?.ui_replay ?? [];

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div>
        <h2 className="text-lg font-semibold">{workflow.name}</h2>
        <p className="text-sm text-muted-foreground">{workflow.description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-2">
          <h3 className="text-xs font-medium uppercase text-muted-foreground">
            UI replay
          </h3>
          <ol className="space-y-2">
            {uiSteps.map((step, i) => (
              <li
                key={`${step.selector}-${i}`}
                className="rounded-md border border-border bg-muted/20 p-2 text-sm"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {i + 1}.
                </span>{" "}
                <span className="font-medium">{step.type}</span>
                <span className="block truncate font-mono text-xs text-muted-foreground">
                  {step.selector}
                </span>
                {step.value && (
                  <span className="block text-xs">value: {step.value}</span>
                )}
              </li>
            ))}
          </ol>
        </section>
        <section className="space-y-2">
          <h3 className="text-xs font-medium uppercase text-muted-foreground">
            API equivalent
          </h3>
          {apiEquivalent ? (
            <JsonViewer value={apiEquivalent} />
          ) : (
            <p className="text-sm text-muted-foreground">
              API equivalent not yet extracted
            </p>
          )}
        </section>
      </div>
      <Link
        href={`/session/${workflow.session_id}/workflow/${workflow.id}`}
        className="text-sm text-primary hover:underline"
      >
        View full workflow →
      </Link>
    </div>
  );
}
