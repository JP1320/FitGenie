CREATE TABLE IF NOT EXISTS data_retention_policies (
  id SERIAL PRIMARY KEY,
  data_type TEXT NOT NULL,
  retention_days INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO data_retention_policies (data_type, retention_days)
VALUES
('user_profile', 1825),
('measurements', 1825),
('orders', 2555),
('feedback', 1095)
ON CONFLICT DO NOTHING;
