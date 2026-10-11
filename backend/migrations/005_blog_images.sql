-- Blog covers may reference uploaded assets; legacy external image URLs remain valid.
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS cover_image_asset_id INTEGER REFERENCES media_assets(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS cover_image_alt TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS blog_article_images (
  post_id         INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  asset_id        INTEGER NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  position        INTEGER NOT NULL CHECK (position >= 0),
  alt_text        TEXT NOT NULL DEFAULT '',
  caption         TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (post_id, position),
  UNIQUE (post_id, asset_id)
);
