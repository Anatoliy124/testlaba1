module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native)/)',
  ],
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
  ],
  moduleNameMapper: {
    '^@env$': '<rootDir>/__mocks__/@env.js',
  },
  silent: true,
  verbose: false,
  coverageReporters: ['text-summary'], // Только краткая статистика
};
