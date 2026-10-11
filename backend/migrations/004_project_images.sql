-- Project covers may reference uploaded assets; legacy external image URLs remain valid.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS image_asset_id INTEGER REFERENCES media_assets(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS image_alt_text TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS project_gallery_images (
  project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_id        INTEGER NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  position        INTEGER NOT NULL CHECK (position >= 0),
  alt_text        TEXT NOT NULL DEFAULT '',
  caption         TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (project_id, position),
  UNIQUE (project_id, asset_id)
);
