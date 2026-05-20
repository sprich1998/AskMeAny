CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  step_type TEXT NOT NULL,
  api_equivalent JSONB
);

CREATE INDEX IF NOT EXISTS workflow_steps_workflow_id_order_index_idx
  ON workflow_steps (workflow_id, order_index ASC);
