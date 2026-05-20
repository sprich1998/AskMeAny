import type {
  CaptureActionInput,
  CaptureNetworkEventInput,
  IngestInteractionBundle
} from "@teachmeany/shared";

export type CapturedAction = CaptureActionInput & {
  timestamp: number;
  frameUrl: string | null;
};

export type CapturedNetworkEvent = CaptureNetworkEventInput & {
  requestId: string;
  frameId: string | null;
  resourceType: string;
  timestamp: number;
};

export type CorrelatedInteraction = IngestInteractionBundle;
