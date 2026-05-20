import { z } from "zod";

export const InteractionSearchRequestSchema = z.object({
  query: z.string().min(1),
  limit: z.coerce.number().int().positive().max(20).default(5)
});

export const InteractionSearchResultSchema = z.object({
  actionId: z.string().uuid(),
  sessionId: z.string().uuid(),
  score: z.number(),
  label: z.string().nullable(),
  requestMethod: z.string().nullable(),
  requestUrl: z.string().nullable(),
  inferredIntent: z.string().nullable()
});

export const InteractionSearchResponseSchema = z.object({
  results: z.array(InteractionSearchResultSchema),
  total: z.number().int().nonnegative()
});

export type InteractionSearchRequest = z.infer<typeof InteractionSearchRequestSchema>;
export type InteractionSearchResult = z.infer<typeof InteractionSearchResultSchema>;
export type InteractionSearchResponse = z.infer<typeof InteractionSearchResponseSchema>;
