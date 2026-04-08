CREATE TABLE IF NOT EXISTS experiment_events (
  id BIGSERIAL PRIMARY KEY,
  experiment_key TEXT NOT NULL,
  variant TEXT NOT NULL,
  user_id TEXT,
  tenant_id TEXT,
  event_name TEXT NOT NULL,
  event_value NUMERIC,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiment_events_key_time
  ON experiment_events(experiment_key, created_at DESC);
