/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: "jsdom", // ← change from "node" to "jsdom"
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
