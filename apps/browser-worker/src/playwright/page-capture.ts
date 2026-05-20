import { z } from "zod";
import type { Page } from "playwright";
import { CaptureActionInputSchema } from "@teachmeany/shared";

import type { CapturedAction } from "../capture/types";

const CapturedActionPayloadSchema = CaptureActionInputSchema.extend({
  timestamp: z.number(),
  frameUrl: z.string().nullable()
});

export async function attachDomCapture(
  page: Page,
  onAction: (action: CapturedAction) => void | Promise<void>
): Promise<void> {
  await page.exposeFunction("__teachmeanyCaptureAction", async (payload: unknown) => {
    const parsed = CapturedActionPayloadSchema.safeParse(payload);
    if (parsed.success) {
      await onAction(parsed.data);
    }
  });

  await page.addInitScript(() => {
    type CaptureType = "click" | "input";

    const actionTarget = (event: Event): HTMLElement | null => {
      const target = event.target;
      return target instanceof HTMLElement ? target : null;
    };

    const cssEscape = (value: string): string => {
      const escapeFn = window.CSS?.escape;
      return escapeFn ? escapeFn(value) : value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
    };

    const selectorFor = (element: HTMLElement): string => {
      if (element.id) {
        return `#${cssEscape(element.id)}`;
      }

      const testId = element.getAttribute("data-testid");
      if (testId) {
        return `[data-testid="${testId.replace(/"/g, '\\"')}"]`;
      }

      const name = element.getAttribute("name");
      if (name) {
        return `${element.tagName.toLowerCase()}[name="${name.replace(/"/g, '\\"')}"]`;
      }

      const parts: string[] = [];
      let current: HTMLElement | null = element;
      while (current && current !== document.body) {
        const parent: HTMLElement | null = current.parentElement;
        const tag = current.tagName.toLowerCase();
        if (!parent) {
          parts.unshift(tag);
          break;
        }

        const currentTagName = current.tagName;
        const sameTagSiblings = Array.from(parent.children).filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && child.tagName === currentTagName
        );
        const index =
          sameTagSiblings.length > 1 ? `:nth-of-type(${sameTagSiblings.indexOf(current) + 1})` : "";
        parts.unshift(`${tag}${index}`);
        current = parent;
      }

      return parts.join(" > ");
    };

    const xpathFor = (element: HTMLElement): string => {
      const parts: string[] = [];
      let current: HTMLElement | null = element;
      while (current) {
        const parent: HTMLElement | null = current.parentElement;
        const tag = current.tagName.toLowerCase();
        if (!parent) {
          parts.unshift(tag);
          break;
        }

        const currentTagName = current.tagName;
        const sameTagSiblings = Array.from(parent.children).filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && child.tagName === currentTagName
        );
        parts.unshift(`${tag}[${sameTagSiblings.indexOf(current) + 1}]`);
        current = parent;
      }

      return `/${parts.join("/")}`;
    };

    const labelFor = (element: HTMLElement): string => {
      const explicitLabel =
        element.getAttribute("aria-label") ??
        element.getAttribute("placeholder") ??
        element.getAttribute("name") ??
        element.getAttribute("id");
      const text = element.textContent?.trim();
      return (explicitLabel || text || element.tagName.toLowerCase()).slice(0, 120);
    };

    const valueFor = (element: HTMLElement): unknown => {
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      ) {
        return element.value;
      }

      return null;
    };

    const emit = (type: CaptureType, event: Event): void => {
      const target = actionTarget(event);
      if (!target) {
        return;
      }

      void window.__teachmeanyCaptureAction?.({
        type,
        label: labelFor(target),
        selector: selectorFor(target),
        xpath: xpathFor(target),
        element: {
          tagName: target.tagName.toLowerCase(),
          id: target.id || null,
          classes: Array.from(target.classList),
          text: target.textContent?.trim().slice(0, 200) || null,
          attributes: Object.fromEntries(
            Array.from(target.attributes).map((attribute) => [attribute.name, attribute.value])
          )
        },
        value: valueFor(target),
        timestamp: Date.now(),
        frameUrl: window.location.href
      });
    };

    document.addEventListener("click", (event) => emit("click", event), true);
    document.addEventListener("change", (event) => emit("input", event), true);
  });
}

declare global {
  interface Window {
    __teachmeanyCaptureAction?: (payload: unknown) => Promise<void>;
  }
}
