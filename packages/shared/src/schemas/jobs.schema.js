import { z } from "zod";
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
