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

  async close(sessionId: string): Promise<void> {
    const handle = this.sessions.get(sessionId);
    if (!handle) {
      return;
    }

    if (handle.pollTimer) {
      clearInterval(handle.pollTimer);
    }

    this.sessions.delete(sessionId);
    await handle.browser.close();
    await updateSessionRuntime(sessionId, { vncUrl: null }).catch(() => undefined);
  }

  async closeAll(): Promise<void> {
    await Promise.all([...this.sessions.keys()].map((sessionId) => this.close(sessionId)));
  }
}

export const sessionManager = new SessionManager();
