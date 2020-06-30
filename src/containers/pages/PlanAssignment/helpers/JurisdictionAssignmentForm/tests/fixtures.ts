import { OpenSRPJurisdiction } from '../../../../../../components/TreeWalker/types';

export const openSRPJurisdiction: OpenSRPJurisdiction = {
  id: '3091',
  properties: {
    geographicLevel: 3,
    name: 'Rural',
    parentId: 'root',
    status: 'Active',
    version: 2,
  },
  serverVersion: 123456789,
  type: 'Feature',
};

export const assignments = [
  {
    fromDate: '2019-12-30T00:00:00+00:00',
    jurisdiction: '3091',
    organization: '1',
    plan: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
    toDate: '2019-08-30T00:00:00+00:00',
  },
  {
    fromDate: '2019-12-30T00:00:00+00:00',
    jurisdiction: '3091',
    organization: '2',
    plan: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
    toDate: '2019-08-30T00:00:00+00:00',
  },
  {
    fromDate: '2019-12-30T00:00:00+00:00',
    jurisdiction: '3091',
    organization: '3',
    plan: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
    toDate: '2019-08-30T00:00:00+00:00',
  },
];

export const assignment4 = {
  fromDate: '2019-12-30T00:00:00+00:00',
  jurisdiction: '3091',
  organization: '4',
  plan: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
  toDate: '2019-08-30T00:00:00+00:00',
};

export const assignment5 = {
  fromDate: '2019-12-30T00:00:00+00:00',
  jurisdiction: '3091',
  organization: '5',
  plan: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
  toDate: '2019-08-30T00:00:00+00:00',
};

export const apiCall = [
  [
    'https://test.smartregister.org/opensrp/rest/organization/assignLocationsAndPlans',
    {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      body:
        '[{"fromDate":"2019-12-30T00:00:00+00:00","jurisdiction":"3091","organization":"x","plan":"8fa7eb32-99d7-4b49-8332-9ecedd6d51ae","toDate":"2019-07-30T00:00:00+00:00"}]',
      headers: {
        accept: 'application/json',
        authorization: 'Bearer null',
        'content-type': 'application/json;charset=UTF-8',
      },
      method: 'POST',
    },
  ],
];

export const submitCallbackPayload = [
  [
    [
      {
        fromDate: '2019-12-30T00:00:00+00:00',
        jurisdiction: '3091',
        organization: 'x',
        plan: '8fa7eb32-99d7-4b49-8332-9ecedd6d51ae',
        toDate: '2019-07-30T00:00:00+00:00',
      },
    ],
  ],
];