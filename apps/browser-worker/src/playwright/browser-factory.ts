import { chromium, type Browser } from "playwright";

import { env } from "../env";

export async function launchBrowser(): Promise<Browser> {
  return chromium.launch({
    headless: env.HEADLESS,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      ...(env.DISPLAY ? [] : [])
    ],
    env: env.DISPLAY
      ? {
          ...process.env,
          DISPLAY: env.DISPLAY
        }
      : undefined
  });
}
