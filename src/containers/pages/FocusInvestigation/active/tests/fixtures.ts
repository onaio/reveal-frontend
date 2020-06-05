/** Fixtures for tests */
import { keyBy } from 'lodash';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

export const data = [
  {
    adherence1: -1,
    adherence3: 4,
    adherence7: 0,
    canton: 'Canton 1',
    caseClassification: 'Local',
    caseNotificationDate: '23/01/19',
    district: 'District 1',
    focusArea: 'Focus Area 1',
    id: '13',
    parent: null,
    province: 'Province 1',
    status: 'A1',
    village: 'Village 1',
  },
  {
    adherence1: -1,
    adherence3: 1,
    adherence7: -5,
    canton: 'Canton 2',
    caseClassification: 'Local',
    caseNotificationDate: '18/01/19',
    district: 'District 2',
    focusArea: 'Focus Area 2',
    id: '14',
    parent: null,
    province: 'Province 2',
    status: 'A2',
    village: 'Village 2',
  },
  {
    adherence1: 2,
    adherence3: 2,
    adherence7: 4,
    canton: 'Canton 3',
    caseClassification: 'Local',
    caseNotificationDate: '27/01/19',
    district: 'District 3',
    focusArea: 'Focus Area 3',
    id: '15',
    parent: null,
    province: 'Province 3',
    status: 'A1',
    village: 'Village 3',
  },
  {
    adherence1: -1,
    adherence3: 0,
    adherence7: 6,
    canton: 'Canton 4',
    caseClassification: 'Imported',
    caseNotificationDate: '29/01/19',
    district: 'District 4',
    focusArea: 'Focus Area 4',
    id: '16',
    parent: null,
    province: 'Province 4',
    status: 'B1',
    village: 'Village 4',
  },
  {
    adherence1: 999,
    adherence3: 999,
    adherence7: -999,
    canton: 'Canton 5 - this is a longer name than usual',
    caseClassification: 'Imported',
    caseNotificationDate: '29/01/19',
    district: 'District 5 - this is a longer name than usual',
    focusArea: 'Focus Area 5 - this is a longer name than usual',
    id: '17',
    parent: null,
    province: 'Province 5 - this is a longer name than usual',
    status: 'B1',
    village: 'Village 5 - this is a longer name than usual',
  },
];

export const dataIds = data.map(el => el.id);

export const dataByID = keyBy(data, 'id');

export const singleFI = dataByID['13'];

export const activeFocusInvestigationProps = {
  caseTriggeredPlans: [
    {
      id: 'plan-id-2',
      jurisdiction_depth: 2,
      jurisdiction_id: '3378',
      jurisdiction_name: 'TLv1_02',
      jurisdiction_name_path: ['Canton Tha Luang', 'Tha Luang Village'],
      jurisdiction_parent_id: '2977',
      jurisdiction_path: ['2989', '2977'],
      plan_date: '2019-06-18',
      plan_effective_period_end: '2019-06-18',
      plan_effective_period_start: '2019-07-31',
      plan_fi_reason: 'Case Triggered',
      plan_fi_status: 'A1',
      plan_id: 'plan-id-2',
      plan_intervention_type: 'IRS',
      plan_status: 'active',
      plan_title: 'A1-Tha Luang Village 1 Focus 01',
      plan_version: '1',
    },
  ],
  fetchPlansActionCreator: expect.anything(),
  history: {
    action: 'POP',
    block: [Function],
    createHref: [Function],
    go: [Function],
    goBack: [Function],
    goForward: [Function],
    length: 1,
    listen: [Function],
    location: {
      hash: '',
      pathname: '/',
      search: '',
      state: undefined,
    },
    push: [Function],
    replace: [Function],
  },
  location: {
    calls: [
      [
        0,
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: 'FI',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_intervention_type',
            },
          ],
          row_limit: 2000,
        },
      ],
    ],
    results: [
      {
        isThrow: false,
        value: {},
      },
    ],
  },
  match: {
    calls: [
      [
        0,
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: 'FI',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_intervention_type',
            },
          ],
          row_limit: 2000,
        },
      ],
    ],
    results: [
      {
        isThrow: false,
        value: {},
      },
    ],
  },
  routinePlans: [
    {
      id: 'ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f',
      jurisdiction_depth: 2,
      jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
      jurisdiction_name: 'NVI_439',
      jurisdiction_name_path: ['Chadiza', 'Naviluli'],
      jurisdiction_parent_id: '2944',
      jurisdiction_path: ['2939', '2944'],
      plan_date: '2019-06-18',
      plan_effective_period_end: '2019-06-18',
      plan_effective_period_start: '2019-07-31',
      plan_fi_reason: 'Routine',
      plan_fi_status: 'A1',
      plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
      plan_intervention_type: 'FI',
      plan_status: 'active',
      plan_title: 'A1-Tha Luang Village 1 Focus 01',
      plan_version: '1',
    },
  ],
  supersetService: {
    calls: [
      [
        0,
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: 'FI',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_intervention_type',
            },
          ],
          row_limit: 2000,
        },
      ],
    ],
    results: [
      {
        isThrow: false,
        value: {},
      },
    ],
  },
};

export const selectedPlan24 = {
  canton: 'Chadiza',
  caseClassification: null,
  caseNotificationDate: '2019-06-18',
  district: null,
  focusArea: 'NVI_439',
  province: null,
  reason: 'Case Triggered',
  status: 'A1',
  village: 'Naviluli',
  ...fixtures.plan24,
};

export const selectedPlan1 = {
  canton: 'Chadiza',
  caseClassification: null,
  caseNotificationDate: null,
  district: null,
  focusArea: 'NVI_439',
  province: null,
  reason: 'Routine',
  status: 'A1',
  village: 'Naviluli',
  ...fixtures.plan1,
};
