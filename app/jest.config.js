const jestExpoPreset = require('jest-expo/jest-preset')

module.exports = {
  ...jestExpoPreset,
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    ...jestExpoPreset.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo-secure-store$': '<rootDir>/src/__mocks__/expo-secure-store.ts',
    '^expo-router$': '<rootDir>/src/__mocks__/expo-router.ts',
  },
}
