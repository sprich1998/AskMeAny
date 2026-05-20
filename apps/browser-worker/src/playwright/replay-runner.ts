import type { WorkflowWithSteps } from "@teachmeany/shared";
import type { Page } from "playwright";

import { sessionManager } from "../session/session-manager";

function parseBody(body: unknown): string | undefined {
  if (body === null || body === undefined) {
    return undefined;
  }

  if (typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

async function runUiStep(page: Page, step: WorkflowWithSteps["steps"][number]): Promise<void> {
  const selector = step.selector;
  if (!selector) {
    throw new Error(`UI replay step ${step.orderIndex} is missing selector`);
  }

  if (step.stepType === "fill") {
    const value =
      typeof step.value === "string"
        ? step.value
        : step.value && typeof step.value === "object" && "text" in step.value
          ? String((step.value as { text: unknown }).text)
          : step.value != null
            ? String(step.value)
            : "";
    await page.fill(selector, value, { timeout: 10_000 });
    return;
  }

  if (step.stepType === "click") {
    const clickPromise = step.apiEquivalent?.url
      ? page.waitForResponse(
          (response) => response.url().includes(step.apiEquivalent?.url ?? ""),
          { timeout: 15_000 }
        )
      : Promise.resolve();

    await page.click(selector, { timeout: 10_000 });
    await clickPromise.catch(() => undefined);
    return;
  }

  throw new Error(`Unsupported UI replay step type: ${step.stepType}`);
}

async function runApiStep(step: WorkflowWithSteps["steps"][number]): Promise<void> {
  const api = step.apiEquivalent;
  if (!api?.url) {
    console.warn("Skipping API replay step without api_equivalent", {
      orderIndex: step.orderIndex,
      actionId: step.actionId
    });
    return;
  }

  const response = await fetch(api.url, {
    method: api.method,
    headers: { "Content-Type": "application/json" },
    body: parseBody(api.body)
  });

  if (!response.ok) {
    throw new Error(
      `API replay step ${step.orderIndex} failed: ${response.status} ${response.statusText}`
    );
  }
}

export async function runReplay(
  sessionId: string,
  workflow: WorkflowWithSteps,
  mode: "ui" | "api"
): Promise<void> {
  if (mode === "api") {
    for (const step of workflow.steps) {
      await runApiStep(step);
    }
    return;
  }

  const handle = sessionManager.get(sessionId);
  if (!handle) {
    throw new Error(`No active browser session for replay: ${sessionId}`);
  }

  for (const step of workflow.steps) {
    await runUiStep(handle.page, step);
  }
}
