ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS review_status text;
UPDATE endpoints SET review_status=CASE WHEN approved THEN 'approved' ELSE 'pending' END WHERE review_status IS NULL;
ALTER TABLE endpoints ALTER COLUMN review_status SET DEFAULT 'pending';
ALTER TABLE endpoints ALTER COLUMN review_status SET NOT NULL;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS review_version integer NOT NULL DEFAULT 1;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='endpoint_review_state' AND conrelid='endpoints'::regclass) THEN
    ALTER TABLE endpoints ADD CONSTRAINT endpoint_review_state CHECK (
      review_status IN ('pending','approved','changes_requested','disabled') AND
      approved = (review_status='approved') AND review_version > 0
    );
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS endpoints_review_queue ON endpoints(review_status,updated_at);
CREATE TABLE IF NOT EXISTS endpoint_reviews (
  id uuid PRIMARY KEY,
  agent_slug text NOT NULL,
  endpoint_id text NOT NULL,
  reviewed_version integer NOT NULL,
  action text NOT NULL CHECK(action IN ('approve','request_changes','disable')),
  actor_id text REFERENCES "user"(id) ON DELETE SET NULL,
  actor_name text NOT NULL,
  actor_type text NOT NULL CHECK(actor_type IN ('operator','cli')),
  note text NOT NULL DEFAULT '',
  config_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(agent_slug,endpoint_id) REFERENCES endpoints(agent_slug,id)
);
CREATE INDEX IF NOT EXISTS endpoint_reviews_history ON endpoint_reviews(agent_slug,endpoint_id,created_at DESC);
