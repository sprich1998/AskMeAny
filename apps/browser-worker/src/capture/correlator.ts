import type { IngestInteractionBundle } from "@teachmeany/shared";

import { inferIntent } from "./intent-rules";
import type { CapturedAction, CapturedNetworkEvent } from "./types";

const CORRELATION_WINDOW_MS = 1500;

function chooseNetworkEvent(
  action: CapturedAction,
  candidates: CapturedNetworkEvent[]
): CapturedNetworkEvent | null {
  const matches = candidates
    .filter((candidate) => {
      const delta = candidate.timestamp - action.timestamp;
      return delta >= 0 && delta <= CORRELATION_WINDOW_MS;
    })
    .sort((left, right) => left.timestamp - right.timestamp);

  return matches[0] ?? null;
}

export function correlateInteraction(
  action: CapturedAction,
  networkEvents: CapturedNetworkEvent[]
): IngestInteractionBundle {
  const networkEvent = chooseNetworkEvent(action, networkEvents);

  return {
    action: {
      type: action.type,
      label: action.label,
      selector: action.selector,
      xpath: action.xpath,
      element: action.element,
      value: action.value ?? null
    },
    networkEvent: networkEvent
      ? {
          method: networkEvent.method,
          url: networkEvent.url,
          requestHeaders: networkEvent.requestHeaders ?? null,
          requestBody: networkEvent.requestBody ?? null,
          responseStatus: networkEvent.responseStatus,
          responseHeaders: networkEvent.responseHeaders ?? null,
          responseBody: networkEvent.responseBody ?? null
        }
      : null,
    intent: inferIntent(action, networkEvent),
    domMutation: null
  };
}
