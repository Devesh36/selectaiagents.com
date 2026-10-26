CREATE TABLE IF NOT EXISTS agents (
  slug text PRIMARY KEY,
  owner_id text REFERENCES "user"(id),
  data jsonb NOT NULL,
  demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS agents_owner ON agents(owner_id);
CREATE TABLE IF NOT EXISTS votes (
  agent_slug text REFERENCES agents(slug) ON DELETE CASCADE,
  user_id text REFERENCES "user"(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(agent_slug, user_id)
);
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY,
  agent_slug text NOT NULL REFERENCES agents(slug) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_agent ON comments(agent_slug,created_at);
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name text NOT NULL,
  prefix text NOT NULL,
  hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);
CREATE TABLE IF NOT EXISTS wallets (
  user_id text PRIMARY KEY REFERENCES "user"(id),
  balance_micros bigint NOT NULL DEFAULT 0 CHECK(balance_micros >= 0),
  reserved_micros bigint NOT NULL DEFAULT 0 CHECK(reserved_micros BETWEEN 0 AND balance_micros)
);
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id),
  idempotency_key text NOT NULL,
  fingerprint text NOT NULL,
  status text NOT NULL CHECK(status IN ('running','completed','failed')),
  reserved_micros bigint NOT NULL,
  charged_micros bigint NOT NULL DEFAULT 0,
  response jsonb,
  response_status integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  UNIQUE(user_id,idempotency_key)
);
CREATE TABLE IF NOT EXISTS ledger (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id),
  amount_micros bigint NOT NULL,
  kind text NOT NULL CHECK(kind IN ('credit','call','adjustment')),
  reference text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS endpoints (
  agent_slug text REFERENCES agents(slug) ON DELETE CASCADE,
  id text NOT NULL,
  config jsonb NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(agent_slug,id)
);
CREATE TABLE IF NOT EXISTS call_logs (
  id uuid PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES requests(id),
  agent_slug text NOT NULL REFERENCES agents(slug),
  endpoint_id text NOT NULL,
  status text NOT NULL CHECK(status IN ('success','failed','timeout','invalid_output')),
  latency_ms integer NOT NULL CHECK(latency_ms >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(request_id,agent_slug,endpoint_id)
);
CREATE INDEX IF NOT EXISTS call_logs_analytics ON call_logs(agent_slug,created_at);
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket text PRIMARY KEY,
  count integer NOT NULL,
  expires_at timestamptz NOT NULL
);

-- Additive and idempotent for existing installations. A running request with
-- needs_reconciliation=true must never be dispatched again.
-- Treat pre-migration requests as potentially dispatched; never infer a safe refund.
ALTER TABLE requests ADD COLUMN IF NOT EXISTS upstream_started boolean NOT NULL DEFAULT true;
ALTER TABLE requests ALTER COLUMN upstream_started SET DEFAULT false;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS needs_reconciliation boolean NOT NULL DEFAULT false;
