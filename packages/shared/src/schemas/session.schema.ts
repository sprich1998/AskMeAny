import { z } from "zod";

import { SESSION_STATUS_VALUES } from "../constants/index";

export const SessionStatusSchema = z.enum(SESSION_STATUS_VALUES);

export const CreateSessionBodySchema = z.object({
  startUrl: z.string().url()
});

export const SessionResponseSchema = z.object({
  id: z.string().uuid(),
  startUrl: z.string().url(),
  currentUrl: z.string().url(),
  status: SessionStatusSchema,
  createdAt: z.string().datetime(),
  vncUrl: z
    .string()
    .refine((value) => {
      try {
        const parsed = new URL(value);
        return parsed.protocol === "ws:" || parsed.protocol === "wss:";
      } catch {
        return false;
      }
    }, "vncUrl must be a ws:// or wss:// URL")
    .nullable()
    .optional()
});

export const ListSessionsResponseSchema = z.object({
  sessions: z.array(SessionResponseSchema),
  total: z.number().int().nonnegative()
});

export const UpdateSessionRuntimeBodySchema = z.object({
  status: SessionStatusSchema.optional(),
  currentUrl: z.string().url().optional(),
  vncUrl: z
    .string()
    .refine((value) => {
      try {
        const parsed = new URL(value);
        return parsed.protocol === "ws:" || parsed.protocol === "wss:";
      } catch {
        return false;
      }
    }, "vncUrl must be a ws:// or wss:// URL")
    .nullable()
    .optional()
});

export type CreateSessionBody = z.infer<typeof CreateSessionBodySchema>;
export type SessionResponse = z.infer<typeof SessionResponseSchema>;
export type ListSessionsResponse = z.infer<typeof ListSessionsResponseSchema>;
export type UpdateSessionRuntimeBody = z.infer<typeof UpdateSessionRuntimeBodySchema>;
