import type { Action, BrowserSession, Intent, NetworkEvent } from "@teachmeany/shared";

import { extractTopLevelKeys } from "./json-keys";

export function buildInteractionText(input: {
  action: Action;
  session: BrowserSession;
  networkEvent: NetworkEvent | null;
  intent: Intent | null;
}): string {
  const pageContext = input.session.currentUrl || input.session.startUrl;
  const lines: string[] = [];

  lines.push(`User ${input.action.type} ${input.action.label} on ${pageContext}.`);

  if (input.action.label) {
    lines.push(`Button text: ${input.action.label}.`);
  }

  if (input.networkEvent) {
    lines.push(`Request: ${input.networkEvent.method} ${input.networkEvent.url}.`);

    const payloadKeys = extractTopLevelKeys(input.networkEvent.requestBody);
    if (payloadKeys) {
      lines.push(`Payload fields: ${payloadKeys}.`);
    }

    const responseKeys = extractTopLevelKeys(input.networkEvent.responseBody);
    if (responseKeys) {
      lines.push(`Response fields: ${responseKeys}.`);
    }
  }

  if (input.intent) {
    lines.push(`Likely intent: ${input.intent.description || input.intent.name}.`);
  }

  return lines.join("\n");
}
