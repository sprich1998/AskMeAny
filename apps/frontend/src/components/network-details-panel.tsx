"use client";

import type { NetworkEventDetail } from "@/types";
import { Badge } from "@/components/ui/badge";
import { JsonViewer } from "@/components/json-viewer";

type NetworkDetailsPanelProps = {
  event: NetworkEventDetail | null;
};

function statusColor(status: number): "success" | "warning" | "destructive" {
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "warning";
  return "destructive";
}

function isEmptyBody(body: unknown): boolean {
  if (body === null || body === undefined) return true;
  if (typeof body === "object" && Object.keys(body as object).length === 0) {
    return true;
  }
  return false;
}

export function NetworkDetailsPanel({ event }: NetworkDetailsPanelProps) {
  if (!event) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Select a network event from the timeline to inspect it
      </p>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto p-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          {event.method}
        </Badge>
        <Badge variant={statusColor(event.response_status)}>
          {event.response_status}
        </Badge>
      </div>
      {event.action_id && event.action_label && (
        <p className="text-xs">
          <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
            Triggered by: {event.action_label}
          </span>
        </p>
      )}
      <p className="break-all font-mono text-xs text-foreground">{event.url}</p>
      <section className="space-y-2">
        <h3 className="text-xs font-medium uppercase text-muted-foreground">
          Request body
        </h3>
        {isEmptyBody(event.request_body) ? (
          <p className="text-sm text-muted-foreground">No request body</p>
        ) : (
          <JsonViewer value={event.request_body} />
        )}
      </section>
      <section className="space-y-2">
        <h3 className="text-xs font-medium uppercase text-muted-foreground">
          Response body
        </h3>
        {isEmptyBody(event.response_body) ? (
          <p className="text-sm text-muted-foreground">No response body</p>
        ) : (
          <JsonViewer value={event.response_body} />
        )}
      </section>
    </div>
  );
}
