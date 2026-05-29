export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/server.js',
    '!src/config/redis.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  testTimeout: 30000,
};
