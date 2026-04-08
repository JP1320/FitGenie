CREATE TABLE IF NOT EXISTS partner_connections (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  webhook_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
