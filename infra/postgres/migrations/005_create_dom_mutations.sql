CREATE TABLE IF NOT EXISTS dom_mutations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES browser_sessions(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  before_hash TEXT NOT NULL,
  after_hash TEXT NOT NULL,
  mutation_summary JSONB NOT NULL
);
