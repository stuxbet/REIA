/** Jest config for the Expo (React Native) project. */
module.exports = {
  preset: "jest-expo",
  // Resolve the "@/*" path alias the same way tsconfig.json does.
  // (transformIgnorePatterns is intentionally left to the jest-expo preset.)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
