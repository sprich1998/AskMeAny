import type { Page } from "playwright";

import type { CapturedNetworkEvent } from "../capture/types";

type PendingNetworkEvent = Omit<CapturedNetworkEvent, "responseStatus"> & {
  responseStatus: number | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

export async function attachNetworkListener(
  page: Page,
  onNetworkEvent: (event: CapturedNetworkEvent) => void | Promise<void>
): Promise<void> {
  const client = await page.context().newCDPSession(page);
  const pending = new Map<string, PendingNetworkEvent>();

  await client.send("Network.enable");

  client.on("Network.requestWillBeSent", (event: unknown) => {
    const record = asRecord(event);
    const request = asRecord(record.request);
    const resourceType = asString(record.type)?.toLowerCase() ?? "";
    if (!["fetch", "xhr"].includes(resourceType)) {
      return;
    }

    const requestId = asString(record.requestId);
    const method = asString(request.method);
    const url = asString(request.url);
    if (!requestId || !method || !url) {
      return;
    }

    pending.set(requestId, {
      requestId,
      frameId: asString(record.frameId),
      resourceType,
      method,
      url,
      requestHeaders: asRecord(request.headers),
      requestBody: asString(request.postData),
      responseStatus: null,
      responseHeaders: null,
      responseBody: null,
      timestamp: Date.now()
    });
  });

  client.on("Network.responseReceived", (event: unknown) => {
    const record = asRecord(event);
    const requestId = asString(record.requestId);
    if (!requestId) {
      return;
    }

    const candidate = pending.get(requestId);
    if (!candidate) {
      return;
    }

    const response = asRecord(record.response);
    candidate.responseStatus = asNumber(response.status);
    candidate.responseHeaders = asRecord(response.headers);
  });

  client.on("Network.loadingFinished", (event: unknown) => {
    const record = asRecord(event);
    const requestId = asString(record.requestId);
    if (!requestId) {
      return;
    }

    const candidate = pending.get(requestId);
    if (!candidate || candidate.responseStatus === null) {
      return;
    }

    pending.delete(requestId);
    void client
      .send("Network.getResponseBody", { requestId })
      .then((bodyResult: unknown) => {
        const body = asRecord(bodyResult);
        candidate.responseBody = asString(body.body);
      })
      .catch(() => {
        candidate.responseBody = null;
      })
      .finally(() => {
        void onNetworkEvent({
          ...candidate,
          responseStatus: candidate.responseStatus ?? 0
        });
      });
  });
}
