import { z } from "zod";

export const InteractionMemoryPayloadSchema = z.object({
  action_id: z.string().uuid(),
  session_id: z.string().uuid(),
  url: z.string(),
  action_type: z.string(),
  label: z.string(),
  request_method: z.string().nullable(),
  request_url: z.string().nullable(),
  inferred_intent: z.string().nullable()
});

export type InteractionMemoryPayload = z.infer<typeof InteractionMemoryPayloadSchema>;
