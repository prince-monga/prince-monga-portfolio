-- Database-backed image configuration for existing site-wide identity surfaces.
CREATE TABLE IF NOT EXISTS site_settings (
  id                      SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  profile_image_asset_id  INTEGER REFERENCES media_assets(id) ON DELETE RESTRICT,
  profile_image_alt       TEXT NOT NULL DEFAULT '',
  og_image_asset_id       INTEGER REFERENCES media_assets(id) ON DELETE RESTRICT,
  og_image_alt            TEXT NOT NULL DEFAULT '',
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;
