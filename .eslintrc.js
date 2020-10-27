const path = require('path');
const { mapKeys } = require('lodash');

const allowedSnapshots = {
  'src/containers/pages/AssigmentMapWrapper/tests/__snapshots__/index.test.tsx.snap': [
    'containers/pages/AssigmentMapWrapper renders jurisdictions assignment map 1',
  ],
  'src/components/DatePickerWrapper/tests/__snapshots__/index.test.tsx.snap': [
    'components/DatePickerWrapper matches snapshot 1',
  ],
  'src/components/page/HeaderBreadcrumb/tests/__snapshots__/HeaderBreadcrumb.test.tsx.snap': [
    'components/page/HeaderBreadcrumb renders HeaderBreadcrumb correctly 1',
  ],
  'src/containers/ConnectedHeader/tests/__snapshots__/index.test.tsx.snap': [
    'components/ConnectedHeader renders the ConnectedHeader component 1',
  ],
  'src/containers/pages/FocusInvestigation/map/active/tests/__snapshots__/index.test.tsx.snap': [
    'containers/pages/FocusInvestigation/activeMap displays the correct badge and mark complete when plan status is active: mark complete link 1',
  ],
  'src/containers/pages/IRS/Map/tests/__snapshots__/index.test.tsx.snap': [
    'components/IRS Reports/IRSReportingMap renders correctly: Indicator item breakdown 1',
  ],
  'src/containers/pages/IRSLite/MapLite/tests/__snapshots__/index.test.tsx.snap': [
    'components/IRS Lite Reports/IRSReportingMapLite renders correctly: Indicator item breakdown 1',
  ],
  'src/containers/pages/MDAPoint/ChildReports/tests/__snapshots__/index.test.tsx.snap': [
    'components/MDA Reports/MDAPlansList should render school reports correctly: breadcrumbs 1',
  ],
  'src/containers/pages/MDAPoint/jurisdictionsReport/tests/__snapshots__/index.test.tsx.snap': [
    'components/MDA Reports/JurisdictionReport renders correctly 1',
  ],
  'src/containers/pages/MDAPoint/LocationReports/tests/__snapshots__/index.test.tsx.snap': [
    'components/MDA Reports/MDAPlansList should render school reports correctly: breadcrumbs 1',
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
        maxSize: 150,
        whitelistedSnapshots,
      },
    ],
  },
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 2015,
  },
};
