"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { ReplayMode, ReplayResult } from "@/types";
import { Button } from "@/components/ui/button";
import {
  ReplayComparison,
  ReplayResultCard,
} from "@/components/replay-result-card";

type ReplayPanelProps = {
  workflowId: string | null;
};

export function ReplayPanel({ workflowId }: ReplayPanelProps) {
  const [loadingMode, setLoadingMode] = useState<ReplayMode | null>(null);
  const [uiResult, setUiResult] = useState<ReplayResult | null>(null);
  const [apiResult, setApiResult] = useState<ReplayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runReplay(mode: ReplayMode) {
    if (!workflowId) return;
    setLoadingMode(mode);
    setError(null);
    try {
      const result = await apiClient.triggerReplay(workflowId, mode);
      if (mode === "ui") setUiResult(result);
      else setApiResult(result);
    } catch (err) {
      setError(
        `Replay failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoadingMode(null);
    }
  }

  if (!workflowId) {
    return (
      <div className="space-y-3 py-4">
        <p className="text-sm text-muted-foreground">
          Record a workflow first (stop recording to extract), then select it in
          the Workflow tab
        </p>
        <div className="flex gap-2">
          <Button disabled>Replay via UI</Button>
          <Button disabled variant="outline">
            Call API directly
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => runReplay("ui")}
          disabled={loadingMode !== null}
        >
          {loadingMode === "ui" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Replaying…
            </>
          ) : (
            "Replay via UI"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => runReplay("api")}
          disabled={loadingMode !== null}
        >
          {loadingMode === "api" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Calling API…
            </>
          ) : (
            "Call API directly"
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {uiResult && apiResult ? (
        <ReplayComparison uiResult={uiResult} apiResult={apiResult} />
      ) : (
        <div className="space-y-3">
          {uiResult && <ReplayResultCard mode="ui" result={uiResult} />}
          {apiResult && <ReplayResultCard mode="api" result={apiResult} />}
        </div>
      )}
    </div>
  );
}
