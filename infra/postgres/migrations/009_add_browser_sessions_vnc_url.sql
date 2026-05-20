ALTER TABLE browser_sessions
  ADD COLUMN IF NOT EXISTS vnc_url TEXT;
