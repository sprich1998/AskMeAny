CREATE TABLE IF NOT EXISTS actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES browser_sessions(id) ON DELETE CASCADE,
  page_snapshot_id UUID REFERENCES page_snapshots(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  selector TEXT NOT NULL,
  xpath TEXT NOT NULL,
  element JSONB,
  value JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS actions_session_id_timestamp_idx
  ON actions (session_id, timestamp ASC);
