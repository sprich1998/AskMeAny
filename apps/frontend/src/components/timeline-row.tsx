"use client";

import {
  ArrowLeftRight,
  Code2,
  MousePointer2,
  Sparkles,
} from "lucide-react";
import { cn, shortUrl } from "@/lib/utils";
import type { NetworkEventTimelineEvent, TimelineEvent } from "@/types";
import { Badge } from "@/components/ui/badge";

type TimelineRowProps = {
  event: TimelineEvent;
  selected?: boolean;
  onSelectNetworkEvent?: (event: NetworkEventTimelineEvent) => void;
};

export function TimelineRow({
  event,
  selected,
  onSelectNetworkEvent,
}: TimelineRowProps) {
  const isNetwork = event.type === "network_event";
  const clickable = isNetwork && !!onSelectNetworkEvent;

  function handleClick() {
    if (isNetwork && onSelectNetworkEvent) {
      onSelectNetworkEvent(event);
    }
  }

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        disabled={!clickable}
        className={cn(
          "flex w-full items-start gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
          clickable && "cursor-pointer hover:bg-accent/60",
          !clickable && "cursor-default",
          selected && "bg-accent ring-1 ring-ring"
        )}
      >
        <RowIcon event={event} />
        <RowContent event={event} />
      </button>
    </li>
  );
}

function RowIcon({ event }: { event: TimelineEvent }) {
  const className = "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground";
  switch (event.type) {
    case "action":
      return <MousePointer2 className={className} />;
    case "network_event":
      return <ArrowLeftRight className={className} />;
    case "dom_mutation":
      return <Code2 className={className} />;
    case "intent":
      return <Sparkles className={className} />;
  }
}

function RowContent({ event }: { event: TimelineEvent }) {
  switch (event.type) {
    case "action":
      return (
        <div className="min-w-0 flex-1">
          <span className="font-medium capitalize">{event.action_type}</span>
          <span className="text-muted-foreground"> · {event.label}</span>
        </div>
      );
    case "network_event":
      return (
        <div className="min-w-0 flex-1 truncate">
          <span className="font-mono font-medium">{event.method}</span>
          <span className="text-muted-foreground">
            {" "}
            {shortUrl(event.url)}
          </span>
        </div>
      );
    case "dom_mutation": {
      const summary =
        typeof event.mutation_summary.summary === "string"
          ? event.mutation_summary.summary
          : "DOM updated";
      return (
        <div className="min-w-0 flex-1 text-muted-foreground">{summary}</div>
      );
    }
    case "intent":
      return (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="font-medium">{event.name}</span>
          <Badge variant="secondary">
            {Math.round(event.confidence * 100)}%
          </Badge>
        </div>
      );
  }
}
