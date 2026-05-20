CREATE TABLE IF NOT EXISTS network_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES browser_sessions(id) ON DELETE CASCADE,
  action_id UUID REFERENCES actions(id) ON DELETE SET NULL,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  response_status INT NOT NULL,
  response_headers JSONB,
  response_body JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS network_events_session_id_timestamp_idx
  ON network_events (session_id, timestamp ASC);
