import { InterventionType, PlanRecord, PlanStatus } from '../../plans';

export const irsLitePlans = [
  {
    jurisdiction_root_parent_ids: ['03557b7e-0ddf-41f7-93c8-155669757a16'],
    plan_date: '2020-10-13',
    plan_effective_period_end: '2020-12-06',
    plan_effective_period_start: '2020-10-13',
    plan_id: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
    plan_intervention_type: 'IRS-Lite',
    plan_name: 'IRS-Lite-Test-1-2020-10-13',
    plan_status: 'active',
    plan_title: 'IRS-Lite Test 1 2020-10-13',
    plan_version: '1',
  },
];

export const plans = [
  {
    jurisdiction_root_parent_ids: ['f45b9380-c970-4dd1-8533-9e95ab12f128'],
    plan_date: '2019-09-05',
    plan_effective_period_end: '2019-09-25',
    plan_effective_period_start: '2019-09-05',
    plan_id: '727c3d40-e118-564a-b231-aac633e6abce',
    plan_intervention_type: 'IRS',
    plan_name: 'IRS-2019-09-05-TEST',
    plan_status: 'retired',
    plan_title: 'IRS 2019-09-05 TEST',
    plan_version: '2',
  },
  {
    jurisdiction_root_parent_ids: ['f45b9380-c970-4dd1-8533-9e95ab12f128'],
    plan_date: '2019-08-30',
    plan_effective_period_end: '2019-09-14',
    plan_effective_period_start: '2019-08-30',
    plan_id: '02e358ed-87fe-5720-8782-0afe28cb7e8c',
    plan_intervention_type: 'IRS',
    plan_name: 'IRS-2019-08-30m',
    plan_status: 'active',
    plan_title: 'IRS 2019-08-30m',
    plan_version: '2',
  },
  {
    jurisdiction_root_parent_ids: ['f45b9380-c970-4dd1-8533-9e95ab12f128'],
    plan_date: '2019-08-29',
    plan_effective_period_end: '2019-09-18',
    plan_effective_period_start: '2019-08-29',
    plan_id: 'c6e59ec1-8c54-5fdf-acf3-ee3692983f38',
    plan_intervention_type: 'IRS',
    plan_name: 'Berg-Namibia-2019',
    plan_status: 'active',
    plan_title: 'Berg Namibia 2019',
    plan_version: '2',
  },
  {
    jurisdiction_root_parent_ids: ['Metrociti'],
    plan_date: '2019-08-29',
    plan_effective_period_end: '2019-09-18',
    plan_effective_period_start: '2019-08-29',
    plan_id: 'UUID-1-test',
    plan_intervention_type: InterventionType.DynamicIRS,
    plan_name: 'forget me stick',
    plan_status: 'active',
    plan_title: 'MegaMind',
    plan_version: '2',
  },
];

export const planRecords: PlanRecord[] = [
  {
    id: '727c3d40-e118-564a-b231-aac633e6abce',
    plan_date: '2019-09-05',
    plan_effective_period_end: '2019-09-25',
    plan_effective_period_start: '2019-09-05',
    plan_fi_reason: '',
    plan_fi_status: '',
    plan_id: '727c3d40-e118-564a-b231-aac633e6abce',
    plan_intervention_type: 'IRS' as InterventionType.IRS,
    plan_status: 'retired' as PlanStatus.RETIRED,
    plan_title: 'IRS 2019-09-05 TEST',
    plan_version: '2',
  },
  {
    id: '02e358ed-87fe-5720-8782-0afe28cb7e8c',
    plan_date: '2019-08-30',
    plan_effective_period_end: '2019-09-14',
    plan_effective_period_start: '2019-08-30',
    plan_fi_reason: '',
    plan_fi_status: '',
    plan_id: '02e358ed-87fe-5720-8782-0afe28cb7e8c',
    plan_intervention_type: 'IRS' as InterventionType.IRS,
    plan_status: 'active' as PlanStatus.RETIRED,
    plan_title: 'IRS 2019-08-30m',
    plan_version: '2',
  },
  {
    id: 'c6e59ec1-8c54-5fdf-acf3-ee3692983f38',
    plan_date: '2019-08-29',
    plan_effective_period_end: '2019-09-18',
    plan_effective_period_start: '2019-08-29',
    plan_fi_reason: '',
    plan_fi_status: '',
    plan_id: 'c6e59ec1-8c54-5fdf-acf3-ee3692983f38',
    plan_intervention_type: 'IRS' as InterventionType.IRS,
    plan_status: 'active' as PlanStatus.RETIRED,
    plan_title: 'Berg Namibia 2019',
    plan_version: '2',
  },
];

export const extractedPlans = planRecords.map(plan => ({
  date: plan.plan_date,
  effective_period_end: plan.plan_effective_period_end,
  effective_period_start: plan.plan_effective_period_start,
  fi_reason: plan.plan_fi_reason,
  fi_status: plan.plan_fi_status,
  identifier: plan.id,
  intervention_type: plan.plan_intervention_type,
  status: plan.plan_status,
  title: plan.plan_title,
  useContext: plan.plan_useContext,
  version: plan.plan_version,
}));

// tslint:disable: object-literal-sort-keys
export const namibiaIRSJurisdictions = [
  {
    foundcoverage: 0,
    householdsnotaccessible: 0,
    id: '0001ca08-c9b7-5ea5-acc5-dc9b2fce5d24',
    jurisdiction_depth: 3,
    jurisdiction_id: 'fc6ea38c-df35-4ded-9b29-cdc7b6766cd3',
    jurisdiction_name: 'KASOTE',
    jurisdiction_name_path: ['Namibia', 'Kavango West', 'Rundu'],
    jurisdiction_parent_id: '3f017d7d-1ac0-4d6f-92d0-33bdcbeff5c4',
    jurisdiction_path: [
      'f45b9380-c970-4dd1-8533-9e95ab12f128',
      '0f39569f-3bde-4661-a933-c95218b17532',
      '3f017d7d-1ac0-4d6f-92d0-33bdcbeff5c4',
    ],
    lockedfirst: 0,
    lockedmopup: 0,
    plan_id: 'da451786-a760-4947-870c-7c9c0a818574',
    refusalsfirst: 0,
    refusalsmopup: 0,
    sprayeffectiveness: 0,
    structuresfound: 0,
    structuressprayed: 0,
    targetcoverage: 0,
    jurisdiction_target: 0,
  },
  {
    id: '00056eb5-51c3-5bd6-a216-c8da451953c1',
    plan_id: '7a4efc30-fdda-477a-96fb-589f69c57211',
    jurisdiction_id: '68d2a24b-1240-453d-b2b1-561d4a5c7016',
    jurisdiction_parent_id: '84d72939-0629-4d21-97db-c7dcbccbb7ac',
    jurisdiction_name: 'KAKUSE',
    jurisdiction_depth: 3,
    jurisdiction_path: [
      'f45b9380-c970-4dd1-8533-9e95ab12f128',
      'bd070142-aca9-4612-81d1-f3b172b8e0b8',
      '84d72939-0629-4d21-97db-c7dcbccbb7ac',
    ],
    jurisdiction_name_path: ['Namibia', 'Oshikoto', 'Tsumeb'],
    structuresfound: 0,
    structuressprayed: 0,
    targetcoverage: 0,
    sprayeffectiveness: 0,
    foundcoverage: 0,
    householdsnotaccessible: 0,
    refusalsfirst: 0,
    refusalsmopup: 0,
    lockedfirst: 0,
    lockedmopup: 0,
    jurisdiction_target: 22,
  },
  {
    foundcoverage: 0,
    householdsnotaccessible: 0,
    id: '00069466-ce9f-5340-b5af-db1a85e53c0f',
    jurisdiction_depth: 3,
    jurisdiction_id: 'd81008d3-c18b-4c80-83a8-3fcb27d318e3',

    jurisdiction_name: 'OMATUNDA A',
    jurisdiction_name_path: ['Namibia', 'Oshana', 'Oshakati'],
    jurisdiction_parent_id: '634e07d1-16dc-4207-802e-108f9008214a',
    jurisdiction_path: [
      'f45b9380-c970-4dd1-8533-9e95ab12f128',
      '8e8a3b21-c12f-4036-8482-b986ee14f274',
      '634e07d1-16dc-4207-802e-108f9008214a',
    ],
    lockedfirst: 0,
    lockedmopup: 0,
    plan_id: 'ab063b4f-bbbc-416f-880a-d465ddd7b80f',
    refusalsfirst: 0,
    refusalsmopup: 0,
    sprayeffectiveness: 0,
    structuresfound: 0,
    structuressprayed: 0,
    jurisdiction_target: 0,
    targetcoverage: 0,
  },
  {
    id: '000cc61b-85fd-5258-8d32-4bb017431c76',
    jurisdiction_depth: 3,
    jurisdiction_id: '6eed9689-ff52-405c-97dd-307a4768fdba',
    jurisdiction_name: 'OKATHAKOBAGO',
    jurisdiction_name_path: ['Namibia', 'Omusati', 'Tsandi'],
    jurisdiction_parent_id: '4e72770f-ec87-4411-bdd1-838a1304ed19',
    jurisdiction_path: [
      'f45b9380-c970-4dd1-8533-9e95ab12f128',
      'a0627554-c000-49ac-a1fc-625ecc937124',
      '4e72770f-ec87-4411-bdd1-838a1304ed19',
    ],
    plan_id: 'da451786-a760-4947-870c-7c9c0a818574',
    sprayeffectiveness: 0,
    structuresfound: 0,
    structuressprayed: 0,
    targetcoverage: 0,
    foundcoverage: 0,
    householdsnotaccessible: 0,
    lockedfirst: 0,
    lockedmopup: 0,
    refusalsfirst: 0,
    refusalsmopup: 0,
    jurisdiction_target: 0,
  },
];

export const zambiaIRSJurisdictions = [
  {
    id: '56e45196-882b-55ac-ba9e-3caeacb431a9',
    plan_id: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
    jurisdiction_id: '03557b7e-0ddf-41f7-93c8-155669757a16',
    jurisdiction_parent_id: '',
    jurisdiction_name: 'Zambia MACEPA IRS Lite 2020',
    jurisdiction_depth: 0,
    jurisdiction_path: '[]',
    jurisdiction_name_path: '[]',
    totstruct: 0,
    targstruct: 0,
    sprayed: 24.0,
    found: 34.0,
    totareas: 93,
    targareas: 93.0,
    visitedareas: 16.0,
    spraycov: 0.0,
    spraycovtarg: 0.0,
    foundcoverage: 0.0,
    spraysuccess: 0.7058823529411765,
  },
  {
    id: '55e7e1cc-7461-5360-8294-863467e93497',
    plan_id: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
    jurisdiction_id: '48a04a67-ac6f-4d5e-bbc6-09b77ba1253d',
    jurisdiction_parent_id: '03557b7e-0ddf-41f7-93c8-155669757a16',
    jurisdiction_name: 'Southern MACEPA IRS Lite 2020',
    jurisdiction_depth: 1,
    jurisdiction_path: '["03557b7e-0ddf-41f7-93c8-155669757a16"]',
    jurisdiction_name_path: '["Zambia MACEPA IRS Lite 2020"]',
    totstruct: 0,
    targstruct: 0,
    sprayed: 24.0,
    found: 34.0,
    totareas: 93,
    targareas: 93.0,
    visitedareas: 16.0,
    spraycov: 0.0,
    spraycovtarg: 0.0,
    foundcoverage: 0.0,
    spraysuccess: 0.7058823529411765,
  },
  {
    id: '1ef09b27-1bbc-5f58-a31d-0e29e31a3f80',
    plan_id: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
    jurisdiction_id: '032a9542-dab7-4a76-9e2e-bc7eb99a259c',
    jurisdiction_parent_id: '48a04a67-ac6f-4d5e-bbc6-09b77ba1253d',
    jurisdiction_name: 'Gwembe MACEPA IRS Lite 2020',
    jurisdiction_depth: 2,
    jurisdiction_path:
      '["03557b7e-0ddf-41f7-93c8-155669757a16", "48a04a67-ac6f-4d5e-bbc6-09b77ba1253d"]',
    jurisdiction_name_path: '["Zambia MACEPA IRS Lite 2020", "Southern MACEPA IRS Lite 2020"]',
    totstruct: 0,
    targstruct: 0,
    sprayed: 24.0,
    found: 34.0,
    totareas: 93,
    targareas: 93.0,
    visitedareas: 16.0,
    spraycov: 0.0,
    spraycovtarg: 0.0,
    foundcoverage: 0.0,
    spraysuccess: 0.7058823529411765,
  },
  {
    id: '0f973eb6-7204-55f6-9f54-299d10647a9c',
    plan_id: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
    jurisdiction_id: 'ce13e7f4-6926-4be0-9117-519bd1cc4bb2',
    jurisdiction_parent_id: '032a9542-dab7-4a76-9e2e-bc7eb99a259c',
    jurisdiction_name: 'so_Sompani_Health_Post_MACEPA_IRS_Lite_2020',
    jurisdiction_depth: 3,
    jurisdiction_path:
      '["03557b7e-0ddf-41f7-93c8-155669757a16", "48a04a67-ac6f-4d5e-bbc6-09b77ba1253d", "032a9542-dab7-4a76-9e2e-bc7eb99a259c"]',
    jurisdiction_name_path:
      '["Zambia MACEPA IRS Lite 2020", "Southern MACEPA IRS Lite 2020", "Gwembe MACEPA IRS Lite 2020"]',
    totstruct: 0,
    targstruct: 0,
    sprayed: 24.0,
    found: 34.0,
    totareas: 93,
    targareas: 93.0,
    visitedareas: 16.0,
    spraycov: 0.0,
    spraycovtarg: 0.0,
    foundcoverage: 0.0,
    spraysuccess: 0.7058823529411765,
  },
];

export const nullJurisdiction = [
  {
    foundcoverage: 0,
    householdsnotaccessible: 0,
    id: '0001ca08-c9b7-5ea5-acc5-dc9b2fce5d24',
    jurisdiction_depth: 3,
    jurisdiction_id: null,
    jurisdiction_name: 'KASOTE',
    jurisdiction_name_path: null,
    jurisdiction_parent_id: '3f017d7d-1ac0-4d6f-92d0-33bdcbeff5c4',
    jurisdiction_path: null,
    lockedfirst: 0,
    lockedmopup: 0,
    plan_id: 'da451786-a760-4947-870c-7c9c0a818574',
    refusalsfirst: 0,
    refusalsmopup: 0,
    sprayeffectiveness: 0,
    structuresfound: 0,
    structuressprayed: 0,
    targetcoverage: 0,
    jurisdiction_target: 0,
  },
];

export const MDAPointPlans = [
  {
    jurisdiction_root_parent_ids: ['2942'],
    plan_date: '2019-09-05',
    plan_effective_period_end: '2019-09-25',
    plan_effective_period_start: '2019-09-05',
    plan_id: '40357eff-81b6-4e32-bd3d-484019689f7c',
    plan_intervention_type: 'MDA-Point',
    plan_name: 'MDA-Point-2019-09-05-TEST',
    plan_status: 'retired',
    plan_title: 'MDA-Point-2019-09-05 TEST',
    plan_version: '2',
  },
  {
    jurisdiction_root_parent_ids: ['2942'],
    plan_date: '2019-08-30',
    plan_effective_period_end: '2019-09-14',
    plan_effective_period_start: '2019-08-30',
    plan_id: '9f19b77c-b9a5-5832-a4e5-4b461d18fce7',
    plan_intervention_type: 'MDA-Point',
    plan_name: 'MDA-Point-2019-08-30m',
    plan_status: 'active',
    plan_title: 'MDA-Point-2019-08-30m',
    plan_version: '2',
  },
  {
    jurisdiction_root_parent_ids: ['2942'],
    plan_date: '2019-08-29',
    plan_effective_period_end: '2019-09-18',
    plan_effective_period_start: '2019-08-29',
    plan_id: 'c6e59ec1-8c54-5fdf-acf3-ee3692983f38',
    plan_intervention_type: 'MDA-Point',
    plan_name: 'Berg-Eswatini-2019',
    plan_status: 'active',
    plan_title: 'Berg Eswatini 2019',
    plan_version: '2',
  },
];

export const DynamicMDAPlans = MDAPointPlans.map(item => {
  return {
    ...item,
    plan_intervention_type: 'Dynamic-MDA',
    plan_name: item.plan_name.replace('MDA-Point', 'Dynamic-MDA'),
    plan_title: item.plan_title.replace('MDA-Point', 'Dynamic-MDA'),
  };
});

export const MDAPointSchoolReportData = [
  {
    plan_id: '40357eff-81b6-4e32-bd3d-484019689f7c',
    school_location_id: '154153',
    client_age_category: '11 - 15',
    jurisdiction_id: '3951',
    jurisdiction_depth: 2,
    jurisdiction_id_path: ['2942', '3019', '3951'],
    jurisdiction_name_path: ['Lusaka', 'Mtendere', 'Akros_1'],
    sacregistered: 9,
    mmacov: 6,
    mmacovper: 0.6666666666666666,
    sacrefused: 0,
    sacrefmedreason: 0,
    mmaadr: 0,
    mmaadrsev: 0,
    albdist: 0,
  },
  {
    plan_id: '40357eff-81b6-4e32-bd3d-484019689f7c',
    school_location_id: '154153',
    client_age_category: '< 6',
    jurisdiction_id: '3951',
    jurisdiction_depth: 2,
    jurisdiction_id_path: ['2942', '3019', '3951'],
    jurisdiction_name_path: ['Lusaka', 'Mtendere', 'Akros_1'],
    sacregistered: 6,
    mmacov: 0,
    mmacovper: 0,
    sacrefused: 0,
    sacrefmedreason: 0,
    mmaadr: 0,
    mmaadrsev: 0,
    albdist: 0,
  },
  {
    plan_id: '40357eff-81b6-4e32-bd3d-484019689f7c',
    school_location_id: '154153',
    client_age_category: '< 6',
    jurisdiction_id: '39522',
    jurisdiction_depth: 2,
    jurisdiction_id_path: ['2942', '3019', '3952'],
    jurisdiction_name_path: ['Lusaka', 'Mtendere', 'Akros_1'],
    sacregistered: 6,
    mmacov: 0,
    mmacovper: 0,
    sacrefused: 0,
    sacrefmedreason: 0,
    mmaadr: 0,
    mmaadrsev: 0,
    albdist: 0,
  },
  {
    plan_id: '9f19b77c-b9a5-5832-a4e5-4b461d18fce7',
    school_location_id: '154153',
    client_age_category: '11 - 15',
    jurisdiction_id: '3951',
    jurisdiction_depth: 2,
    jurisdiction_id_path: ['2942', '3019', '3951'],
    jurisdiction_name_path: ['Lusaka', 'Mtendere', 'Akros_1'],
    sacregistered: 9,
    mmacov: 0,
    mmacovper: 0,
    sacrefused: 0,
    sacrefmedreason: 0,
    mmaadr: 0,
    mmaadrsev: 0,
    albdist: 0,
  },
  {
    plan_id: '9f19b77c-b9a5-5832-a4e5-4b461d18fce7',
    school_location_id: '154153',
    client_age_category: '< 6',
    jurisdiction_id: '3951',
    jurisdiction_depth: 2,
    jurisdiction_id_path: ['2942', '3019', '3951'],
    jurisdiction_name_path: ['Lusaka', 'Mtendere', 'Akros_1'],
    sacregistered: 6,
    mmacov: 0,
    mmacovper: 0,
    sacrefused: 0,
    sacrefmedreason: 0,
    mmaadr: 0,
    mmaadrsev: 0,
    albdist: 0,
  },
];

export const MDAPointChildReportData = [
  {
    plan_id: '40357eff-81b6-4e32-bd3d-484019689f7c',
    school_location_id: '154153',
    client_age_category: '11 - 15',
    jurisdiction_id: '3951',
    jurisdiction_depth: 2,
    jurisdiction_id_path: ['2942', '3019', '3951'],
    jurisdiction_name_path: ['Lusaka', 'Mtendere', 'Akros_1'],
    client_first_name: 'annonymous',
    client_last_name: 'user',
    sactanationalid: '2345',
    sactacurrenroll: 0,
    mmadrugadmin: 'Yes',
    mmanodrugadminreason: 'pregnant',
    mmaadr: 0,
    mmapzqdosagegiven: 0,
    mmaalbgiven: 0,
  },
  {
    plan_id: '40357eff-81b6-4e32-bd3d-484019689f7c',
    school_location_id: '154153',
    client_age_category: '11 - 15',
    jurisdiction_id: '3951',
    jurisdiction_depth: 2,
    jurisdiction_id_path: ['2942', '3019', '3951'],
    jurisdiction_name_path: ['Lusaka', 'Mtendere', 'Akros_1'],
    client_first_name: 'known',
    client_last_name: 'man',
    sactanationalid: '843',
    sactacurrenroll: 0,
    mmadrugadmin: 0,
    mmanodrugadminreason: 'refused',
    mmaadr: 0,
    mmapzqdosagegiven: 0,
    mmaalbgiven: 0,
  },
];
/* tslint:disable-next-line no-var-requires */
export const ZambiaStructures = require('../../../../containers/pages/IRS/JurisdictionsReport/fixtures/zambia_structures.json');

export const SMCPlans = [
  {
    plan_id: '82d7d7fe-7897-5c69-a473-286cd6a9e0fb',
    plan_title: 'Dynamic-MDA 2020-12-04_2030',
    plan_name: 'Dynamic-MDA-2020-12-04',
    plan_status: 'active',
    plan_effective_period_start: '2020-12-04',
    plan_effective_period_end: '2021-07-31',
    plan_intervention_type: 'Dynamic-MDA',
    plan_version: '1',
    jurisdiction_root_parent_ids: ['12eaba32-55bb-4a67-b554-a28d9ab8e02a'],
    plan_date: '2020-12-04',
  },
  {
    plan_id: '12a879d6-8ad8-4198-86c7-0e94f0dcc848',
    plan_title: 'Nigeria Cycle 4 - SMC Implementation Plan',
    plan_name: 'Nigeria-Cycle4-SMC-Implementation-Plan',
    plan_status: 'active',
    plan_effective_period_start: '2020-10-09',
    plan_effective_period_end: '2021-09-09',
    plan_intervention_type: 'MDA',
    plan_version: '2',
    jurisdiction_root_parent_ids: ['12eaba32-55bb-4a67-b554-a28d9ab8e02a'],
    plan_date: '2020-10-09',
  },
  {
    plan_id: '262526a3-fe86-4cb5-a743-f26db7ff3ce0',
    plan_title: 'Nigeria Cycle 3 - SMC Implementation Plan',
    plan_name: 'Nigeria-Cycle3-SMC-Implementation-Plan',
    plan_status: 'draft',
    plan_effective_period_start: '2020-09-08',
    plan_effective_period_end: '2021-09-09',
    plan_intervention_type: 'MDA',
    plan_version: '1',
    jurisdiction_root_parent_ids: ['12eaba32-55bb-4a67-b554-a28d9ab8e02a'],
    plan_date: '2020-09-08',
  },
];
