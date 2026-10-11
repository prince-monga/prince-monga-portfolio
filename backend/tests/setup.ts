// Load test environment before any module imports
process.env.NODE_ENV = 'test'
process.env.PORT = '4001'
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-testing-purposes-only'
process.env.JWT_EXPIRES_IN = '1h'
process.env.CORS_ORIGINS = 'http://localhost:5173'

// DATABASE_URL must be set in the environment for integration tests.
// If not set, integration tests that hit the DB will be skipped.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/prince_monga_test'
}
