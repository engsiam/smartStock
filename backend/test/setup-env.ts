/**
 * Jest environment defaults so unit tests can import Nest modules
 * without a real `.env`. Integration tests override DATABASE_URL with
 * DATABASE_URL_TEST (see test/integration/helpers.ts).
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'test-secret-0123456789abcdef0123456789abcdef';
process.env.JWT_ACCESS_TTL ??= '15m';
process.env.JWT_REFRESH_TTL ??= '7d';
process.env.PORT ??= '3000';
process.env.THROTTLE_TTL_SECONDS ??= '60';
process.env.THROTTLE_LIMIT ??= '100000'; // effectively disabled for tests
process.env.DATABASE_URL ??=
  process.env.DATABASE_URL_TEST ??
  'postgresql://smartstock:CHANGE_ME@localhost:5432/smartstock_test?schema=public';
