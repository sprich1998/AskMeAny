export interface WorkflowArtifact {
  uiReplay: {
    actions: string[];
  } | null;
  apiEquivalent: {
    method: string;
    url: string;
    body: unknown;
  } | null;
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  actionId: string;
  orderIndex: number;
  stepType: string;
  apiEquivalent: {
    method: string;
    url: string;
    body: unknown;
  } | null;
  selector: string | null;
  value: unknown;
}

export interface Workflow {
  id: string;
  sessionId: string;
  name: string;
  description: string;
  createdAt: string;
  stepCount?: number;
  steps?: WorkflowStep[];
  artifact?: WorkflowArtifact | null;
}
