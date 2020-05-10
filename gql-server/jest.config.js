module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsConfig: true
    }
  },
  "transformIgnorePatterns": [
    "<rootDir>/node_modules/(?!vexflow/.*)"
  ],
};
