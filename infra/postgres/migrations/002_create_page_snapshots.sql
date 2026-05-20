CREATE TABLE IF NOT EXISTS page_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES browser_sessions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  dom_hash TEXT NOT NULL,
  simplified_dom JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
