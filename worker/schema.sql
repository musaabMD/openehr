-- Optional D1 schema for the Magic EHR sync journal (OFF-05/OFF-06).
-- Stores only journal metadata and digests, never clinical payloads.
CREATE TABLE IF NOT EXISTS journal (
  id TEXT PRIMARY KEY,
  seq INTEGER NOT NULL,
  author_id TEXT NOT NULL,
  device TEXT NOT NULL,
  patient_id TEXT,
  resource TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  op TEXT NOT NULL,
  base_revision INTEGER NOT NULL DEFAULT 0,
  payload_digest TEXT NOT NULL,
  effective TEXT NOT NULL,
  recorded TEXT NOT NULL,
  received TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS journal_received ON journal (received);
CREATE INDEX IF NOT EXISTS journal_patient ON journal (patient_id);
