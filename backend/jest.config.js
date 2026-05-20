/**
 * Jest configuration for Employee Task Manager API integration tests.
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  globalTeardown: '<rootDir>/tests/teardown.js',
  testTimeout: 30000,
  forceExit: true,
};
