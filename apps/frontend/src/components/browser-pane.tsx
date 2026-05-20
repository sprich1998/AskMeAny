"use client";

import { useSessionContext } from "@/context/session-context";
import { VncViewer } from "@/components/vnc-viewer";

export function BrowserPane() {
  const { session } = useSessionContext();

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-full min-h-[400px] flex-col rounded-lg border border-border bg-muted/20 overflow-hidden">
      {session.vnc_url ? (
        <VncViewer vncUrl={session.vnc_url} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-lg font-medium">Remote browser</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {session.status === "created"
              ? "Starting remote browser…"
              : "Remote browser stream is not available for this session."}
          </p>
          <p className="text-xs text-muted-foreground/60">Session: {session.id}</p>
        </div>
      )}
    </div>
  );
}
