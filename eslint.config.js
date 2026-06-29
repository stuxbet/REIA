// Flat ESLint config using Expo's shared config.
// https://docs.expo.dev/guides/using-eslint/
const expo = require("eslint-config-expo/flat");

// eslint-config-expo/flat may export an array or a single config object;
// normalize to an array so the spread below is always valid.
const expoConfigs = Array.isArray(expo) ? expo : [expo];

module.exports = [
  ...expoConfigs,
  {
    ignores: ["dist/*", ".expo/*", "node_modules/*"],
  },
];
