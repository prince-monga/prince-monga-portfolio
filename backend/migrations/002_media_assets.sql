-- Persistent media registry for files stored in Cloudflare R2.
-- Content references are added by content-specific migrations.
CREATE TABLE IF NOT EXISTS media_assets (
  id              SERIAL PRIMARY KEY,
  storage_key     TEXT NOT NULL UNIQUE,
  public_url      TEXT NOT NULL UNIQUE,
  original_name   TEXT NOT NULL,
  content_type    TEXT NOT NULL CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  byte_size       INTEGER NOT NULL CHECK (byte_size > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON media_assets (created_at DESC);
