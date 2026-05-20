export const INTERACTION_MEMORY_COLLECTION = "interaction_memory";

export const EMBED_INTERACTION_QUEUE = "embed-interaction";
export const REPLAY_SESSION_QUEUE = "replay-session";
export const BROWSER_LAUNCH_QUEUE = "browser-launch";

export const SESSION_STATUS_VALUES = [
  "created",
  "active",
  "recording",
  "stopped",
  "error"
] as const;

export const WS_EVENT_TYPES = [
  "action",
  "network_event",
  "dom_mutation",
  "intent"
] as const;

export const WS_MESSAGE_TYPES = ["subscribe", "subscribed", "error"] as const;

export const CAPTURE_ACTION_TYPES = ["click", "input"] as const;
