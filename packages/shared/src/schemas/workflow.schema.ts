import { z } from "zod";

export const WorkflowRecordSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string().datetime(),
  stepCount: z.number().int().nonnegative().optional()
});

export const WorkflowStepRecordSchema = z.object({
  id: z.string().uuid(),
  workflowId: z.string().uuid(),
  actionId: z.string().uuid(),
  orderIndex: z.number().int().nonnegative(),
  stepType: z.string(),
  apiEquivalent: z
    .object({
      method: z.string(),
      url: z.string(),
      body: z.unknown().nullable().optional()
    })
    .nullable(),
  selector: z.string().nullable(),
  value: z.unknown().nullable()
});

export const WorkflowWithStepsSchema = WorkflowRecordSchema.extend({
  steps: z.array(WorkflowStepRecordSchema)
});

export const ListWorkflowsResponseSchema = z.object({
  workflows: z.array(WorkflowRecordSchema),
  total: z.number().int().nonnegative()
});

export const ReplayJobBodySchema = z.object({
  mode: z.enum(["ui", "api"])
});

export const ReplayJobAcceptedSchema = z.object({
  accepted: z.literal(true),
  replayId: z.string().uuid(),
  workflowId: z.string().uuid(),
  mode: z.enum(["ui", "api"])
});

export type WorkflowRecord = z.infer<typeof WorkflowRecordSchema>;
export type WorkflowStepRecord = z.infer<typeof WorkflowStepRecordSchema>;
export type WorkflowWithSteps = z.infer<typeof WorkflowWithStepsSchema>;
export type ReplayJobBody = z.infer<typeof ReplayJobBodySchema>;
export type ReplayJobAccepted = z.infer<typeof ReplayJobAcceptedSchema>;
