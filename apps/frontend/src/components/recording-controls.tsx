"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { BrowserSession } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type RecordingControlsProps = {
  session: BrowserSession;
  onSessionChange: (session: BrowserSession) => void;
  onRecordingStopped?: () => void;
};

export function RecordingControls({
  session,
  onSessionChange,
  onRecordingStopped,
}: RecordingControlsProps) {
  const [busy, setBusy] = useState(false);

  async function handleStart() {
    setBusy(true);
    onSessionChange({ ...session, status: "recording" });
    try {
      await apiClient.startRecording(session.id);
    } catch {
      const refreshed = await apiClient.getSession(session.id);
      onSessionChange(refreshed);
    } finally {
      setBusy(false);
    }
  }

  async function handleStop() {
    setBusy(true);
    try {
      await apiClient.stopRecording(session.id);
      const refreshed = await apiClient.getSession(session.id);
      onSessionChange(refreshed);
      onRecordingStopped?.();
    } finally {
      setBusy(false);
    }
  }

  const isRecording = session.status === "recording";
  const canStart =
    session.status === "active" && !busy && !isRecording;

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{session.start_url}</p>
        <p className="truncate text-xs text-muted-foreground">
          {session.current_url}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isRecording && (
          <span className="flex items-center gap-2 text-sm text-red-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Recording
          </span>
        )}
        <Badge variant={isRecording ? "destructive" : "secondary"}>
          {session.status}
        </Badge>
        <Button
          size="sm"
          onClick={handleStart}
          disabled={!canStart}
        >
          Start Recording
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleStop}
          disabled={busy || !isRecording}
        >
          Stop Recording
        </Button>
      </div>
    </div>
  );
}
