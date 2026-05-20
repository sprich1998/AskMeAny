import { Worker, type Job } from "bullmq";
import {
  BROWSER_LAUNCH_QUEUE,
  BrowserLaunchJobPayloadSchema,
  type BrowserLaunchJobPayload
} from "@teachmeany/shared";

import { getSession, updateSessionRuntime } from "../backend/client";
import { correlateInteraction } from "../capture/correlator";
import { submitCaptureBundle } from "../capture/ingest-client";
import type { CapturedAction, CapturedNetworkEvent } from "../capture/types";
import { attachNetworkListener } from "../cdp/network-listener";
import { env } from "../env";
import { launchBrowser } from "../playwright/browser-factory";
import { buildVncUrl } from "../vnc/build-vnc-url";
import { attachDomCapture } from "../playwright/page-capture";
import { redis } from "../redis/client";
import { sessionManager, type BrowserSessionHandle } from "./session-manager";

function scheduleCorrelation(sessionId: string, action: CapturedAction): void {
  setTimeout(() => {
    const handle = sessionManager.get(sessionId);
    if (!handle?.recording) {
      return;
    }

    const bundle = correlateInteraction(action, handle.networkEvents);
    void submitCaptureBundle(sessionId, bundle).catch((error: unknown) => {
      console.error("Failed to submit capture bundle", {
        sessionId,
        error
      });
    });
  }, 1500);
}

async function pollSessionState(sessionId: string): Promise<void> {
  const handle = sessionManager.get(sessionId);
  if (!handle) {
    return;
  }

  const session = await getSession(sessionId);
  handle.recording = session.status === "recording";

  if (session.status === "stopped" || session.status === "error") {
    await sessionManager.close(sessionId);
  }
}

async function launchSession(payload: BrowserLaunchJobPayload): Promise<void> {
  let browser: Awaited<ReturnType<typeof launchBrowser>> | null = null;

  try {
    browser = await launchBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();
    const handle: BrowserSessionHandle = {
      sessionId: payload.sessionId,
      startUrl: payload.startUrl,
      browser,
      context,
      page,
      recording: false,
      networkEvents: [],
      pollTimer: null
    };

    sessionManager.add(handle);

    await attachNetworkListener(page, (event: CapturedNetworkEvent) => {
      const current = sessionManager.get(payload.sessionId);
      if (current?.recording) {
        sessionManager.addNetworkEvent(payload.sessionId, event);
      }
    });

    await attachDomCapture(page, (action: CapturedAction) => {
      const current = sessionManager.get(payload.sessionId);
      if (current?.recording) {
        scheduleCorrelation(payload.sessionId, action);
      }
    });

    await page.goto(payload.startUrl, { waitUntil: "domcontentloaded" });
    await updateSessionRuntime(payload.sessionId, {
      status: "active",
      currentUrl: page.url(),
      vncUrl: buildVncUrl()
    });

    handle.pollTimer = setInterval(() => {
      void pollSessionState(payload.sessionId).catch((error: unknown) => {
        console.error("Failed to poll session state", {
          sessionId: payload.sessionId,
          error
        });
      });
    }, env.SESSION_POLL_INTERVAL_MS);
  } catch (error) {
    await updateSessionRuntime(payload.sessionId, { status: "error" }).catch(() => undefined);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

export function createBrowserLaunchWorker(): Worker<BrowserLaunchJobPayload> {
  return new Worker<BrowserLaunchJobPayload>(
    BROWSER_LAUNCH_QUEUE,
    async (job: Job<BrowserLaunchJobPayload>) => {
      const payload = BrowserLaunchJobPayloadSchema.parse(job.data);
      try {
        await launchSession(payload);
      } catch (error) {
        console.error("Browser launch job failed", {
          sessionId: payload.sessionId,
          error
        });
        throw error;
      }
    },
    {
      connection: redis
    }
  );
}
