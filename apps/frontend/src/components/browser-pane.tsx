"use client";

import Link from "next/link";

import { VncViewer } from "@/components/vnc-viewer";
import { useSessionContext } from "@/context/session-context";
import { getVncBaseUrl } from "@/lib/vnc-config";

function hasLiveBrowser(status: string): boolean {
  return status === "active" || status === "recording";
}

export function BrowserPane() {
  const { session } = useSessionContext();

  if (!session) {
    return null;
  }

  if (session.status === "created") {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/20 p-8 text-center">
        <p className="text-lg font-medium">Remote browser</p>
        <p className="max-w-sm text-sm text-muted-foreground">Starting remote browser…</p>
        <p className="text-xs text-muted-foreground/60">Session: {session.id}</p>
      </div>
    );
  }

  if (hasLiveBrowser(session.status)) {
    return (
      <div className="flex h-full min-h-[400px] flex-col overflow-hidden rounded-lg border border-border bg-muted/20">
        <VncViewer />
      </div>
    );
  }

  if (session.status === "error") {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/20 p-8 text-center">
        <p className="text-lg font-medium">Remote browser unavailable</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This session&apos;s browser runtime is no longer running. Start a new session to continue.
        </p>
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Back to launcher
        </Link>
      </div>
    );
  }

  const vncPageUrl = `${getVncBaseUrl()}/vnc.html?autoconnect=true&resize=scale`;
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/20 p-8 text-center">
      <p className="text-lg font-medium">Remote browser</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        This session is not running. Start a new session or open the standalone viewer.
      </p>
      <a
        href={vncPageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline"
      >
        Open {vncPageUrl}
      </a>
      <p className="text-xs text-muted-foreground/60">Session: {session.id}</p>
    </div>
  );
}
