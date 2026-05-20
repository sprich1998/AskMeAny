import { z } from "zod";

export const ActionElementSchema = z
  .object({
    tagName: z.string().optional(),
    id: z.string().nullable().optional(),
    classes: z.array(z.string()).optional(),
    text: z.string().nullable().optional(),
    attributes: z.record(z.string()).optional()
  })
  .passthrough();

export const ActionRecordSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  pageSnapshotId: z.string().uuid().nullable(),
  type: z.string(),
  label: z.string(),
  selector: z.string(),
  xpath: z.string(),
  element: ActionElementSchema.nullable(),
  value: z.unknown().nullable(),
  timestamp: z.string().datetime(),
  networkEventId: z.string().uuid().nullable()
});

export const ListActionsResponseSchema = z.object({
  actions: z.array(ActionRecordSchema),
  total: z.number().int().nonnegative()
});

export const NetworkEventRecordSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  actionId: z.string().uuid().nullable(),
  method: z.string(),
  url: z.string().url(),
  requestHeaders: z.record(z.unknown()).nullable(),
  requestBody: z.unknown().nullable(),
  responseStatus: z.number().int(),
  responseHeaders: z.record(z.unknown()).nullable(),
  responseBody: z.unknown().nullable(),
  timestamp: z.string().datetime()
});

export const ListNetworkEventsResponseSchema = z.object({
  networkEvents: z.array(NetworkEventRecordSchema),
  total: z.number().int().nonnegative()
});

export const DomMutationRecordSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  actionId: z.string().uuid(),
  beforeHash: z.string(),
  afterHash: z.string(),
  mutationSummary: z.unknown()
});

export const IntentRecordSchema = z.object({
  id: z.string().uuid(),
  actionId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  confidence: z.number(),
  source: z.string(),
  createdAt: z.string().datetime()
});

export type ActionRecord = z.infer<typeof ActionRecordSchema>;
export type NetworkEventRecord = z.infer<typeof NetworkEventRecordSchema>;
export type DomMutationRecord = z.infer<typeof DomMutationRecordSchema>;
export type IntentRecord = z.infer<typeof IntentRecordSchema>;
