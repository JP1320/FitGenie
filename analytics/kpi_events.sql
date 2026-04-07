CREATE TABLE IF NOT EXISTS kpi_events (
  id SERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
