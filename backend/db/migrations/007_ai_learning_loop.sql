CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT,
  user_id TEXT NOT NULL,
  recommendation_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('viewed','clicked','booked','dismissed','returned')),
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reco_feedback_user_time
  ON recommendation_feedback(user_id, created_at DESC);
