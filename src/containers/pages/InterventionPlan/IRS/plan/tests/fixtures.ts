import { InterventionType, PlanRecord, PlanStatus } from '../../../../../../store/ducks/plans';
// tslint:disable: object-literal-sort-keys
export const locationResults = [
  {
    type: 'Feature',
    id: '2942',
    properties: { status: 'Active', name: 'Lusaka', geographicLevel: 0, version: 0 },
    serverVersion: 1545204913827,
  },
  {
    type: 'Feature',
    id: 'f8863022-ff88-4c22-b2d1-83f59f31b874',
    properties: {
      status: 'Active',
      name: 'Oddar Meanchey Province',
      geographicLevel: 0,
      version: 0,
    },
    serverVersion: 1553900609745,
  },
  {
    type: 'Feature',
    id: '9c3c2db4-bddd-44c5-870a-a0eef539e4da',
    properties: { status: 'Active', name: 'Lop Buri', geographicLevel: 0, version: 0 },
    serverVersion: 1554861473099,
  },
  {
    type: 'Feature',
    id: '3953',
    properties: { status: 'Active', name: 'Siavonga', geographicLevel: 0, version: 0 },
    serverVersion: 1549235783958,
  },
  {
    type: 'Feature',
    id: '3954',
    properties: { status: 'Active', name: 'Siavonga', geographicLevel: 0, version: 0 },
    serverVersion: 1549387863860,
  },
  {
    type: 'Feature',
    id: '2940',
    properties: { status: 'Active', name: 'Katete', geographicLevel: 0, version: 0 },
    serverVersion: 1545218425249,
  },
  {
    type: 'Feature',
    id: '2941',
    properties: { status: 'Active', name: 'Sinda', geographicLevel: 0, version: 0 },
    serverVersion: 1545219282280,
  },
  {
    type: 'Feature',
    id: '2939',
    properties: { status: 'Active', name: 'Chadiza', geographicLevel: 0, version: 0 },
    serverVersion: 1545217996275,
  },
  {
    type: 'Feature',
    id: '16a77bba-8777-4bc4-8566-d193cb04af4c',
    properties: { status: 'Active', name: 'Botswana', geographicLevel: 0, version: 0 },
    serverVersion: 1563583239021,
  },
  {
    type: 'Feature',
    id: 'f45b9380-c970-4dd1-8533-9e95ab12f128',
    properties: {
      status: 'Active',
      name: 'Namibia',
      geographicLevel: 0,
      version: 0,
      ADM0_EN: 'Namibia',
      ADM0_PCODE: 'NA',
    },
    serverVersion: 1564401702479,
  },
];

export const jurisidictionResults = [
  { geographic_level: 0, id: '0', name: '0' },
  { geographic_level: 1, id: '1A', name: '1A', parent_id: '0' },
  { geographic_level: 2, id: '1Aa', name: '1Aa', parent_id: '1A' },
  { geographic_level: 2, id: '1Ab', name: '1Ab', parent_id: '1A' },
  { geographic_level: 1, id: '1B', name: '1B', parent_id: '0' },
  { geographic_level: 2, id: '1Ba', name: '1Ba', parent_id: '1B' },
  { geographic_level: 2, id: '1Bb', name: '1Bb', parent_id: '1B' },
  { geographic_level: 2, id: '2942', name: '1B - 2942', parent_id: '1B' },
];

export const irsPlanRecordActiveResponse = {
  date: '2019-08-09',
  effective_period_end: '2019-08-29',
  effective_period_start: '2019-08-09',
  fi_reason: '',
  fi_status: '',
  identifier: '0230f9e8-1f30-5e91-8693-4c993661785e',
  intervention_type: InterventionType.IRS,
  jurisdictions: ['2942'],
  name: 'IRS 2019-08-09',
  status: PlanStatus.ACTIVE,
  title: 'IRS 2019-08-09',
  version: '1',
};

export const irsPlanRecordDraftResponse = {
  date: '2019-08-09',
  effective_period_end: '2019-08-29',
  effective_period_start: '2019-08-09',
  fi_reason: '',
  fi_status: '',
  identifier: '0230f9e8-1f30-5e91-8693-4c993661785e',
  intervention_type: InterventionType.IRS,
  jurisdictions: ['2942'],
  name: 'IRS 2019-08-09',
  status: PlanStatus.DRAFT,
  title: 'IRS 2019-08-09',
  version: '1',
};

export const irsPlanRecordActive: PlanRecord = {
  id: '0230f9e8-1f30-5e91-8693-4c993661785e',
  plan_date: '2019-08-09',
  plan_effective_period_end: '2019-08-29',
  plan_effective_period_start: '2019-08-09',
  plan_fi_reason: '',
  plan_fi_status: '',
  plan_id: '0230f9e8-1f30-5e91-8693-4c993661785e',
  plan_intervention_type: InterventionType.IRS,
  plan_jurisdictions_ids: ['2942'],
  plan_status: PlanStatus.ACTIVE,
  plan_title: 'IRS 2019-08-09',
  plan_version: '1',
};

export const irsPlanRecordDraft: PlanRecord = {
  id: '0230f9e8-1f30-5e91-8693-4c993661785e',
  plan_date: '2019-08-09',
  plan_effective_period_end: '2019-08-29',
  plan_effective_period_start: '2019-08-09',
  plan_fi_reason: '',
  plan_fi_status: '',
  plan_id: '0230f9e8-1f30-5e91-8693-4c993661785e',
  plan_intervention_type: InterventionType.IRS,
  plan_jurisdictions_ids: ['2942'],
  plan_status: PlanStatus.DRAFT,
  plan_title: 'IRS 2019-08-09',
  plan_version: '1',
};

export const jurisdictionGeo = {
  geometry: {
    coordinates: [
      [
        [101.188427209854, 15.0909179029537],
        [101.18852108717, 15.0909179029537],
        [101.18852108717, 15.0910085427885],
        [101.188427209854, 15.0910085427885],
        [101.188427209854, 15.0909179029537],
      ],
    ],
    type: 'Polygon',
  },
  id: '2942',
};

export const divDocumentCreator = (ids: string[]) => {
  ids.forEach((id: string) => {
    const div = document.createElement('div');
    div.setAttribute('id', `plan-assignment-${id}`);
    document.body.appendChild(div);
  });
};
