# Production deployment guide

This repository contains a Vite/React/TypeScript frontend at the repository root and an Express/TypeScript API in `backend/`. The API owns PostgreSQL access, admin authentication, contact inquiries, and private Cloudflare R2 image storage. The frontend is a static SPA and must be built with the public API and canonical site origins configured.

No production domain, credentials, database, or R2 account were available during preparation. Supply the real origins and secrets in the hosting dashboards; do not deploy with example values.

## Recommended topology

- **Frontend:** Cloudflare Pages, connected to this GitHub repository, with the repository root as the project root. The static output and `_headers` file are compatible with Pages. Vercel can serve the Vite output too, but configure equivalent SPA fallback and response headers before selecting it.
- **API:** Render Web Service, rooted at `backend/`. Keep the API separate from the static frontend.
- **Database:** Managed PostgreSQL (for example Neon). Use its TLS-enabled pooled connection URL for the API, and a direct/non-pooled URL for schema migrations where the provider recommends that.
- **Images:** Private Cloudflare R2 bucket, accessed only with backend credentials. This app proxies image reads through its API and has no public R2 bucket URL setting.
- **Source:** GitHub is the build source. This guide does not deploy, push, or change service settings.

Cloudflare Pages documents a Free-plan limit of 500 builds/month, one simultaneous build, 20-minute build timeout, 20,000 files, and 25 MiB per asset. R2 has a free monthly storage/operation allowance and charges beyond the included amount; verify the current pricing and egress terms before use. Render and Neon plan availability, sleeping/compute behavior, connection limits, and quotas change over time; check current provider pricing before choosing plans. A production API/database may require paid plans for always-on availability, reliable backups, and adequate connection capacity. No current Render/Neon pricing was verified as part of this repository preparation.

## Build and start commands

Configure both frontend public origins before a production build:

```text
VITE_API_BASE_URL=https://<actual-api-origin>
VITE_SITE_URL=https://<actual-site-origin>
```

Do not include `/api/v1`, a path, credentials, or a trailing route in either origin. Production builds now fail fast if either setting is absent or invalid. The values are public and compiled into browser assets; never put private credentials in `VITE_*` variables.

**Cloudflare Pages**

- Build command: `npm ci && npm run build:seo`
- Build output directory: `dist`
- Root directory: repository root
- Set `VITE_API_BASE_URL`, `VITE_SITE_URL`, and `SITE_URL` in the Pages build environment for each deployment environment. `SITE_URL` must equal the real site origin.
- `build:seo` runs the normal Vite production build and then requests published Blog and Project pages from the configured public API to generate `sitemap.xml`. Deploy the API and run migrations before the first Pages build. A failing/unreachable API intentionally fails sitemap generation rather than emitting an incomplete sitemap.
- For a frontend build without a fresh sitemap, `npm ci && npm run build` builds the static site but does not generate the sitemap. Do not use that as the final SEO-ready production build.

**Render Web Service**

- Root directory: `backend`
- Runtime: Node.js 20 or newer
- Build command: `npm run build:render` (runs `npm ci --include=dev && npm run build`)
- Start command: `npm start` (equivalent to `node dist/server.js`)
- Health check path: `/api/v1/health`
- The server listens on `0.0.0.0` using the platform `PORT`; do not hard-code a public port.
- Do not put migrations in the start command. The server does not apply them automatically.

## Environment variables

Set backend-only values in the API service. The checked-in `backend/.env.example` lists variable names with safe placeholders; the root `.env.example` contains public build-time variables only.

| Variable | Service | Requirement / purpose |
|---|---|---|
| `DATABASE_URL` | API and explicit migration process | TLS-enabled managed PostgreSQL connection string. Use a pooled URL for the API if supported; use provider-recommended direct connection for migration execution. |
| `NODE_ENV` | API | Set to `production` in the hosted API service. |
| `PORT` | API | Supplied by Render; the server defaults to 4000 only for local development. |
| `JWT_SECRET` | API | Required; at least 32 characters in production. Generate a unique random secret for each environment and store only in the backend dashboard. Rotation invalidates existing admin tokens. |
| `JWT_EXPIRES_IN` | API | Optional; defaults in the application. |
| `CORS_ORIGINS` | API | Exact comma-separated HTTPS frontend origin(s), with no wildcard and no path. Include only production origins that should call the API. |
| `INITIAL_ADMIN_EMAIL` | API, one-time migration process only | Optional one-time bootstrap value; use together with the password. Remove both from the dashboard after initial admin creation. |
| `INITIAL_ADMIN_PASSWORD` | API, one-time migration process only | Optional one-time bootstrap password; minimum 12 characters. Never put it in source control or command history. |
| `R2_ACCOUNT_ID` | API | Cloudflare account identifier used to construct the R2 S3 endpoint. |
| `R2_ACCESS_KEY_ID` | API | Backend-only R2 access key with only the required bucket permissions. |
| `R2_SECRET_ACCESS_KEY` | API | Backend-only R2 secret; rotate if exposed. |
| `R2_BUCKET_NAME` | API | Private bucket used for uploaded media. |
| `VITE_API_BASE_URL` | Frontend build | Public HTTPS API origin; compiled into browser code. |
| `VITE_SITE_URL` | Frontend build | Actual public HTTPS canonical site origin; compiled into browser code. |
| `SITE_URL` | Frontend SEO build | Same actual HTTPS site origin, used by the sitemap generator. |
| `TEST_DATABASE_URL` | Backend test process only | Optional disposable test database for DB-backed API tests. The test harness ignores a generic `DATABASE_URL` and skips database tests unless this test-only variable is explicitly set. |

Contact submissions are persisted in PostgreSQL; this repository does not currently configure an email provider. Do not add SMTP secrets until an email integration is implemented.

Admin authentication uses a JWT in the `Authorization: Bearer` header; the browser stores it in `sessionStorage`. The API does not issue authentication cookies, so `Secure`/`SameSite` cookie settings and cookie-based CSRF defenses do not apply to the current design. HTTPS is still required in production, CORS must list the exact HTTPS frontend origin, and XSS remains security-relevant because same-origin script can read `sessionStorage`. Rotating `JWT_SECRET` invalidates outstanding tokens. `/api/v1/health` is a liveness check only; it does not prove the database or R2 is available.

## PostgreSQL initialization and migrations

1. Create a managed PostgreSQL database and a least-privilege application role. Require TLS; the provided example uses `sslmode=require`. Use the provider-recommended pooled URL for the API if appropriate. If the provider recommends a direct connection for DDL, configure the migration process with that direct connection as `DATABASE_URL`; the migration runner reads only this variable.
2. Configure `DATABASE_URL` securely for the API and the one-time migration process. A hosting dashboard may hold distinct pooled-runtime and direct-migration values, but expose only the relevant URL to each process. Never place either URL in Git, the frontend environment, or a public build variable.
3. For local migration validation, create a disposable local PostgreSQL database dedicated to this project and set `DATABASE_URL` only for that migration process. For managed PostgreSQL, use a test/staging instance first. Do not point this command at an unidentified database. From `backend/`, with Node.js 20+ and dependencies installed, run `npm ci` and then `npm run migrate`. The migration is explicit and is not run by `npm start`.
4. Review the migration log and exit status. The runner sorts and tracks SQL files in `_migrations`, applies each unrecorded migration transactionally, and stops with a sanitized error on failure. The checked-in chain is `001` through `007`; `007` adds nullable site profile fields. Migrations `002`–`006` depend on `002` creating `media_assets`; `003` adds site-image settings, `004` and `005` add project/blog asset references and ordered galleries, and `006` adds optional Journey/Journal image references. Existing content rows and legacy image URLs are retained. Relevant create/add operations use `IF NOT EXISTS`; completed migration filenames are skipped. This does not make modified or partially applied migrations safe to rerun. Run only one migration process at a time.
5. For first-time admin setup only, provide both `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` to the migration process. It creates an Argon2id hash if that email does not already exist. Remove these values immediately afterward. Do not use bootstrap variables for routine deployments.
6. Deploy/start the API only after migrations complete; then confirm `/api/v1/health` returns HTTP 200. The health check currently confirms process liveness, not database readiness.

Do not run `npm run migrate` against any production database until you have verified the target database, taken a backup, and approved the change. Before applying a future migration to an existing database, inspect the SQL, test it on a disposable copy, and make a rollback/restore plan.

For DB-backed tests, first create and migrate an isolated disposable test database. Set `TEST_DATABASE_URL` for the test process and run `npm test -- --runInBand` from `backend/`. The test harness ignores a generic `DATABASE_URL`; with no explicit test URL, DB tests skip without connecting. Current DB-backed tests cover public reads, visibility filtering, missing slugs, and contact persistence. They do not cover complete admin create/read/update round trips, so verify those against the disposable test DB before relying on deployed persistence.

## R2 setup and image privacy

Create a private R2 bucket and a scoped S3-compatible access key. Configure its account ID, key ID, secret, and bucket name only on the backend service. The application constructs the endpoint from the account ID. Do not enable public bucket access or add the keys to frontend variables. Uploaded image reads pass through the API, where public content and private Journal attachment authorization are checked. Admin uploads and private previews require a valid admin bearer token; uploads are limited to 8 MiB and validated against the declared type and file signature.

The exact R2 runtime variables read by the current code are `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`; endpoint configuration is derived from the account ID. The account ID must be 32 hexadecimal characters. Create a private bucket and scoped S3-compatible credentials, then enter those values only in the backend test/staging secret settings. Do not configure a public bucket or expose any of these values to Vite, Pages, or the browser.

There was no configured R2 test account for this audit. Verify upload, preview, content save, refresh, replacement, removal, reordering, and public delivery from a published reference in a non-production environment before enabling real uploads. Verify that private Journal assets return no data to a logged-out visitor. Do not infer upload success from the code or from a local mock response.

## Post-deployment smoke checks

1. Open the site at the actual HTTPS domain; load the homepage, About, Projects, Blog, Journey, Journal, Streak, and Contact routes directly and refresh nested routes.
2. Confirm the browser Network panel sends API requests to the configured API origin and that `OPTIONS`/CORS allows only the intended frontend origin.
3. Confirm the API health check returns HTTP 200. Exercise unknown API paths and invalid input; responses should be safe JSON errors without stack traces.
4. Log in to the admin UI, verify logout invalidates the current browser session, and test create/edit flows for Projects, Blog, Journey, Journal, Streak, and Settings using non-production records.
5. Verify only published Projects/Blog entries and explicitly public Journey/Journal content appear in public routes and in the generated sitemap. Check `/admin` is noindex and private content is not returned from public endpoints.
6. Submit the contact form with valid and invalid data; confirm validation and persistence in the intended database. The application does not send email.
7. In a non-production environment, upload a valid image, reject a non-image and an over-limit file, replace/reorder/remove an image, and test missing R2 configuration and private-image access.
8. Check canonical tags, Open Graph values, `robots.txt`, `sitemap.xml`, and social image URLs against the actual domain. Configure a real social preview image and verification token only after they exist.
9. Test responsive layout and keyboard access at 320, 375, 430, 768, 1024, and 1440 CSS pixels. Automated browser/responsive verification was not available during preparation.

## Backups and rollback

- Enable managed database backups/PITR if the selected plan supports it, and verify restoration procedures before storing production content.
- Back up the database before migrations and before bulk content/image operations. Keep backups protected with the same access controls as the live database.
- Keep the last known-good frontend and API release available for rollback. Roll back application code first only when backward-compatible with the current schema; migrations are not automatically reversed.
- Do not delete R2 objects as a rollback shortcut: database records may still reference them. Prefer restoring a compatible database backup and application version together, or restoring selected assets from a separately retained backup.
- Rotate any credential suspected of exposure, redeploy the backend with the rotated value, and invalidate admin tokens by rotating `JWT_SECRET`.

## Verification status from preparation

- Frontend production build: passed with configured test-only origins; no real production domain was supplied.
- Backend TypeScript build: passed.
- Backend API test suite: 49 passed; database-dependent tests were skipped because no database was configured.
- Production dependency audit: 0 reported vulnerabilities in either package tree.
- Full dependency audit detail (all findings are in build/test tooling; production-only audits report 0 findings for both packages):
  - Frontend **high, direct dev:** `tailwindcss`, `vite`. **High, transitive dev:** `braces`, `chokidar`, `fast-glob`, `micromatch`. **Moderate, transitive dev:** `esbuild`, `postcss-nested`, `postcss-selector-parser`.
  - Backend **high, direct dev:** `jest`, `@types/jest`. **High, transitive dev:** `@jest/console`, `@jest/core`, `@jest/environment`, `@jest/expect`, `@jest/fake-timers`, `@jest/globals`, `@jest/reporters`, `@jest/test-result`, `@jest/test-sequencer`, `@jest/transform`, `babel-jest`, `braces`, `create-jest`, `expect`, `jest-circus`, `jest-cli`, `jest-config`, `jest-environment-node`, `jest-haste-map`, `jest-message-util`, `jest-resolve`, `jest-resolve-dependencies`, `jest-runner`, `jest-runtime`, `jest-snapshot`, `jest-watcher`, `micromatch`. **Moderate, transitive dev:** `@istanbuljs/load-nyc-config`, `argparse`, `babel-plugin-istanbul`, `js-yaml`, `sprintf-js`.
  - Direct means listed in that package's manifest; transitive means brought in by another dependency. The vulnerable build tools do not ship as browser runtime dependencies, and the Jest packages are not API runtime dependencies. Main practical risk is compromised/degraded developer or CI builds if processing untrusted inputs, or exposure of a development server; keep dev servers private and CI inputs trusted.
  - Smallest safe response: no vulnerable production package was identified by `npm audit --omit=dev`. Avoid forced upgrades to Tailwind 4, Vite 8, or Jest 30 here because they are major toolchain changes; schedule isolated, compatibility-tested updates. No current production runtime source change is indicated by this audit.
- Lint: backend `npm run lint` fails because ESLint and ESLint configuration are absent. It was not represented as passed. Safe available alternatives are `npm run typecheck` and `npm test -- --runInBand`; these check types and behavior but are not stylistic lint substitutes. The lint script remains present. The frontend has no lint or test script.
- Database migration execution and DB-backed persistence tests: blocked because no disposable test PostgreSQL URL was explicitly configured. R2 upload/save/refresh/replacement/public delivery and private Journal denial: blocked because no test bucket/credentials were configured. Hosted deployment was not performed.
