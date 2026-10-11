-- Migration 001: initial schema
-- Run via: npm run migrate (from backend/)

CREATE TABLE IF NOT EXISTS admin_users (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  summary         TEXT NOT NULL,
  description     TEXT NOT NULL,
  technologies    TEXT[] NOT NULL DEFAULT '{}',
  category        TEXT NOT NULL CHECK (category IN ('Frontend','Backend','Full Stack','Experiment')),
  repository_url  TEXT,
  live_demo_url   TEXT,
  image_url       TEXT,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_status  ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_slug    ON projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects (featured) WHERE featured = TRUE;

CREATE TABLE IF NOT EXISTS blog_posts (
  id                SERIAL PRIMARY KEY,
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  excerpt           TEXT NOT NULL,
  content           TEXT NOT NULL DEFAULT '',
  category          TEXT NOT NULL,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  seo_title         TEXT,
  meta_description  TEXT,
  cover_image_url   TEXT,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug   ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts (category);

CREATE TABLE IF NOT EXISTS journey_events (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date  DATE NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('education','experience','learning','milestone')),
  visibility  TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journey_events_visibility ON journey_events (visibility);
CREATE INDEX IF NOT EXISTS idx_journey_events_date       ON journey_events (event_date DESC);

CREATE TABLE IF NOT EXISTS daily_logs (
  id               SERIAL PRIMARY KEY,
  activity_date    DATE NOT NULL UNIQUE,
  summary          TEXT NOT NULL,
  work_completed   TEXT NOT NULL DEFAULT '',
  lessons_learned  TEXT NOT NULL DEFAULT '',
  challenges       TEXT NOT NULL DEFAULT '',
  next_steps       TEXT NOT NULL DEFAULT '',
  minutes_worked   INTEGER CHECK (minutes_worked >= 0),
  visibility       TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public','private')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_visibility ON daily_logs (visibility);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date       ON daily_logs (activity_date DESC);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT '',
  budget_range TEXT NOT NULL DEFAULT '',
  message      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','replied','archived')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries (status);
