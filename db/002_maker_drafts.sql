-- Drafts are private and never enter public catalog/routing queries.
CREATE TABLE IF NOT EXISTS maker_drafts (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  details jsonb NOT NULL DEFAULT '{}',
  endpoint jsonb,
  published_slug text REFERENCES agents(slug),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS maker_drafts_owner ON maker_drafts(owner_id,updated_at);
