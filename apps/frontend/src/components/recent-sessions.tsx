"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/utils";
import type { BrowserSession } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function statusVariant(
  status: BrowserSession["status"]
): "default" | "secondary" | "destructive" {
  if (status === "recording") return "destructive";
  if (status === "stopped") return "secondary";
  return "default";
}

export function RecentSessions() {
  const [sessions, setSessions] = useState<BrowserSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading recent sessions…</p>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No sessions yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">
        Recent sessions
      </h2>
      <ul className="space-y-2">
        {sessions.map((session) => (
          <li key={session.id}>
            <Link href={`/session/${session.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {session.start_url}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(session.created_at)}
                    </p>
                  </div>
                  <Badge variant={statusVariant(session.status)}>
                    {session.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
