// Load test environment before any module imports.
process.env.NODE_ENV = 'test'
process.env.PORT = '4001'
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-testing-purposes-only'
process.env.JWT_EXPIRES_IN = '1h'
process.env.CORS_ORIGINS = 'http://localhost:5173'

// Database integration tests must use an explicitly configured test-only URL.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
} else {
  delete process.env.DATABASE_URL
  process.env.DATABASE_URL = 'postgresql://disabled:disabled@127.0.0.1:1/database_tests_disabled'
}
