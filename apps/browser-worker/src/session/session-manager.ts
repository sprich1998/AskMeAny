import type { Browser, BrowserContext, Page } from "playwright";

import { updateSessionRuntime } from "../backend/client";
import type { CapturedNetworkEvent } from "../capture/types";

export type BrowserSessionHandle = {
  sessionId: string;
  startUrl: string;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  recording: boolean;
  networkEvents: CapturedNetworkEvent[];
  pollTimer: NodeJS.Timeout | null;
};

export class SessionManager {
  private readonly sessions = new Map<string, BrowserSessionHandle>();

  add(handle: BrowserSessionHandle): void {
    this.sessions.set(handle.sessionId, handle);
  }

  get(sessionId: string): BrowserSessionHandle | undefined {
    return this.sessions.get(sessionId);
  }

  setRecording(sessionId: string, recording: boolean): void {
    const handle = this.sessions.get(sessionId);
    if (handle) {
      handle.recording = recording;
    }
  }

  addNetworkEvent(sessionId: string, event: CapturedNetworkEvent): void {
    const handle = this.sessions.get(sessionId);
    if (!handle) {
      return;
    }

    const cutoff = Date.now() - 5000;
    handle.networkEvents = [...handle.networkEvents, event].filter(
      (candidate) => candidate.timestamp >= cutoff
    );
  }

  async close(
    sessionId: string,
    options?: { unexpectedTeardown?: boolean }
  ): Promise<void> {
    const handle = this.sessions.get(sessionId);
    if (!handle) {
      return;
    }

    if (handle.pollTimer) {
      clearInterval(handle.pollTimer);
    }

    this.sessions.delete(sessionId);
    await handle.browser.close();

    const runtimePatch = options?.unexpectedTeardown
      ? { status: "error" as const, vncUrl: null }
      : { vncUrl: null };

    await updateSessionRuntime(sessionId, runtimePatch).catch((error: unknown) => {
      console.error("Failed to patch session runtime on teardown", {
        sessionId,
        unexpectedTeardown: options?.unexpectedTeardown ?? false,
        error,
      });
    });

    if (options?.unexpectedTeardown) {
      console.info("Marked session error after unexpected browser teardown", { sessionId });
    }
  }

  async closeAll(): Promise<void> {
    await Promise.all(
      [...this.sessions.keys()].map((sessionId) =>
        this.close(sessionId, { unexpectedTeardown: true })
      )
    );
  }
}

export const sessionManager = new SessionManager();
