import { z } from "zod";
import { SESSION_STATUS_VALUES } from "../constants/index.js";
export const SessionStatusSchema = z.enum(SESSION_STATUS_VALUES);
export const CreateSessionBodySchema = z.object({
    startUrl: z.string().url()
});
export const SessionResponseSchema = z.object({
    id: z.string().uuid(),
    startUrl: z.string().url(),
    currentUrl: z.string().url(),
    status: SessionStatusSchema,
    createdAt: z.string().datetime()
});
export const ListSessionsResponseSchema = z.object({
    sessions: z.array(SessionResponseSchema),
    total: z.number().int().nonnegative()
});
