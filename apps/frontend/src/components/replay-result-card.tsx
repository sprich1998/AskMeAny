"use client";

import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import type { ReplayMode, ReplayResult } from "@/types";
import { JsonViewer } from "@/components/json-viewer";
import { Badge } from "@/components/ui/badge";

type ReplayResultCardProps = {
  mode: ReplayMode;
  result: ReplayResult;
};

export function ReplayResultCard({ mode, result }: ReplayResultCardProps) {
  const accepted = result.status === "accepted";
  const success = result.status === "success";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium capitalize">{mode} replay</span>
        <Badge
          variant={
            accepted ? "secondary" : success ? "success" : "destructive"
          }
        >
          {accepted ? (
            <span className="flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              queued
            </span>
          ) : success ? (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              success
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              failure
            </span>
          )}
        </Badge>
      </div>
      {accepted ? (
        <p className="mb-2 text-sm text-muted-foreground">
          Replay queued
          {result.replay_id ? ` · job ${result.replay_id}` : ""}
        </p>
      ) : (
        <p className="mb-2 text-xs text-muted-foreground">
          {result.elapsed_ms}ms elapsed
        </p>
      )}
      {result.error && (
        <p className="mb-2 text-sm text-destructive">{result.error}</p>
      )}
      <JsonViewer value={result.result} />
    </div>
  );
}

type ReplayComparisonProps = {
  uiResult: ReplayResult | null;
  apiResult: ReplayResult | null;
};

export function ReplayComparison({ uiResult, apiResult }: ReplayComparisonProps) {
  if (!uiResult || !apiResult) return null;

  const match =
    uiResult.status === apiResult.status &&
    (uiResult.status === "success" || uiResult.status === "accepted");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant={match ? "success" : "warning"}>
          {match ? "Results match" : "Results differ"}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ReplayResultCard mode="ui" result={uiResult} />
        <ReplayResultCard mode="api" result={apiResult} />
      </div>
    </div>
  );
}
