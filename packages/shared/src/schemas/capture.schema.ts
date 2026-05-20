import { z } from "zod";

import { CAPTURE_ACTION_TYPES, WS_EVENT_TYPES } from "../constants/index";
import {
  ActionElementSchema,
  ActionRecordSchema,
  DomMutationRecordSchema,
  IntentRecordSchema,
  NetworkEventRecordSchema
} from "./action.schema";

export const CaptureActionInputSchema = z.object({
  type: z.enum(CAPTURE_ACTION_TYPES),
  label: z.string(),
  selector: z.string(),
  xpath: z.string(),
  element: ActionElementSchema.nullable(),
  value: z.unknown().nullable().optional()
});

export const CaptureNetworkEventInputSchema = z.object({
  method: z.string(),
  url: z.string().url(),
  requestHeaders: z.record(z.unknown()).nullable().optional(),
  requestBody: z.unknown().nullable().optional(),
  responseStatus: z.number().int(),
  responseHeaders: z.record(z.unknown()).nullable().optional(),
  responseBody: z.unknown().nullable().optional()
});

export const CaptureIntentInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  source: z.string()
});

export const CaptureDomMutationInputSchema = z.object({
  beforeHash: z.string(),
  afterHash: z.string(),
  mutationSummary: z.unknown()
});

export const IngestInteractionBundleSchema = z.object({
  action: CaptureActionInputSchema,
  networkEvent: CaptureNetworkEventInputSchema.nullable().optional(),
  intent: CaptureIntentInputSchema.nullable().optional(),
  domMutation: CaptureDomMutationInputSchema.nullable().optional()
});

export const TimelineEventEnvelopeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("action"),
    data: ActionRecordSchema
  }),
  z.object({
    type: z.literal("network_event"),
    data: NetworkEventRecordSchema
  }),
  z.object({
    type: z.literal("dom_mutation"),
    data: DomMutationRecordSchema
  }),
  z.object({
    type: z.literal("intent"),
    data: IntentRecordSchema
  })
]);

export const TimelineEventTypeSchema = z.enum(WS_EVENT_TYPES);

export type CaptureActionInput = z.infer<typeof CaptureActionInputSchema>;
export type CaptureNetworkEventInput = z.infer<typeof CaptureNetworkEventInputSchema>;
export type CaptureIntentInput = z.infer<typeof CaptureIntentInputSchema>;
export type CaptureDomMutationInput = z.infer<typeof CaptureDomMutationInputSchema>;
export type IngestInteractionBundle = z.infer<typeof IngestInteractionBundleSchema>;
export type TimelineEventEnvelope = z.infer<typeof TimelineEventEnvelopeSchema>;
