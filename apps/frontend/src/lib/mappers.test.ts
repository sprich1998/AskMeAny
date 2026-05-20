import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SessionResponseSchema } from "../../../../packages/shared/src/schemas/session.schema.ts";
import { mapSession } from "./mappers.ts";

describe("session API mapping", () => {
  it("preserves ws vncUrl from API responses", () => {
    const parsed = SessionResponseSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      startUrl: "https://example.com",
      currentUrl: "https://example.com",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      vncUrl: "ws://localhost:6080",
    });

    assert.equal(parsed.vncUrl, "ws://localhost:6080");
    assert.equal(mapSession(parsed).vnc_url, "ws://localhost:6080");
  });
});
