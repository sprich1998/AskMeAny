import type { CaptureIntentInput } from "@teachmeany/shared";

import type { CapturedAction, CapturedNetworkEvent } from "./types";

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

function lastPathSegment(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.at(-1) ?? parsed.hostname;
  } catch {
    return url;
  }
}

export function inferIntent(
  action: CapturedAction,
  networkEvent: CapturedNetworkEvent | null
): CaptureIntentInput {
  const label = slug(action.label || action.type);
  const resource = networkEvent ? slug(lastPathSegment(networkEvent.url)) : label;
  const method = networkEvent?.method.toUpperCase();
  const combined = `${label}_${resource}`;

  if (combined.includes("search")) {
    return {
      name: `search_${resource || "resource"}`,
      description: `Search via ${action.label}`,
      confidence: networkEvent ? 0.82 : 0.55,
      source: "rule-based"
    };
  }

  if (method === "POST" || combined.includes("submit") || combined.includes("save")) {
    return {
      name: `submit_${resource || "form"}`,
      description: `Submit ${action.label}`,
      confidence: networkEvent ? 0.78 : 0.5,
      source: "rule-based"
    };
  }

  return {
    name: `${action.type}_${resource || label || "target"}`,
    description: `${action.type} ${action.label}`,
    confidence: networkEvent ? 0.68 : 0.42,
    source: "rule-based"
  };
}
