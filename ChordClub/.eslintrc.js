module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    "semi": "error",
    "quotes": ["error", "single"],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-unused-vars":  [
      "error", { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" }
    ]
  },
};
