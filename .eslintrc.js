const path = require('path');
const { mapKeys } = require('lodash');

const allowedSnapshots = {
  'src/components/GisidaWrapper/tests/__snapshots__/index.test.tsx.snap': [
    'components/GisidaWrapper renders map component with FeatureCollection 1',
  ],
  'src/containers/pages/AssigmentMapWrapper/tests/__snapshots__/index.test.tsx.snap': [
    'containers/pages/AssigmentMapWrapper renders jurisdictions assignment map 1',
  ],
  'src/components/DatePickerWrapper/tests/__snapshots__/index.test.tsx.snap': [
    'components/DatePickerWrapper matches snapshot 1',
  ],
};
const whitelistedSnapshots = mapKeys(allowedSnapshots, (val, file) =>
  path.resolve(__dirname, file)
);

module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    'jest/globals': true,
  },
  extends: ['airbnb', 'plugin:prettier/recommended'],
  rules: {
    strict: 0,
    'jest/no-large-snapshots': [
      'error',
      {
        maxSize: 308,
        whitelistedSnapshots,
      },
    ],
  },
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 2015,
  },
};
