import { z } from "zod";

export const BrowserLaunchJobPayloadSchema = z.object({
  sessionId: z.string().uuid(),
  startUrl: z.string().url()
});

export const EmbedInteractionJobPayloadSchema = z.object({
  sessionId: z.string().uuid(),
  actionId: z.string().uuid(),
  networkEventId: z.string().uuid().nullable().optional(),
  timestamp: z.string().datetime().optional()
});

export const ReplaySessionJobPayloadSchema = z.object({
  replayId: z.string().uuid(),
  workflowId: z.string().uuid(),
  sessionId: z.string().uuid(),
  mode: z.enum(["ui", "api"])
});

export type BrowserLaunchJobPayload = z.infer<typeof BrowserLaunchJobPayloadSchema>;
export type EmbedInteractionJobPayload = z.infer<typeof EmbedInteractionJobPayloadSchema>;
export type ReplaySessionJobPayload = z.infer<typeof ReplaySessionJobPayloadSchema>;
