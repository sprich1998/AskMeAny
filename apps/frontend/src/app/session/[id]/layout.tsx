"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { SessionContext } from "@/context/session-context";
import { RecordingControls } from "@/components/recording-controls";
import type { BrowserSession } from "@/types";

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;
  const [session, setSession] = useState<BrowserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowRefresh, setWorkflowRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .getSession(id)
      .then(setSession)
      .catch(() => setError("Session not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const shouldPollSession = session?.status === "created";

  useEffect(() => {
    if (!shouldPollSession) {
      return;
    }

    const interval = setInterval(() => {
      apiClient
        .getSession(id)
        .then(setSession)
        .catch(() => setError("Session not found"));
    }, 2000);

    return () => clearInterval(interval);
  }, [id, shouldPollSession]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading session…
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg">Session not found</p>
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Back to launcher
        </Link>
      </div>
    );
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        loading: false,
        error: null,
        workflowRefreshKey: workflowRefresh,
        bumpWorkflowRefresh: () => setWorkflowRefresh((n) => n + 1),
      }}
    >
      <div className="flex min-h-screen flex-col">
        <RecordingControls
          session={session}
          onSessionChange={setSession}
          onRecordingStopped={() => setWorkflowRefresh((n) => n + 1)}
        />
        {children}
      </div>
    </SessionContext.Provider>
  );
}
