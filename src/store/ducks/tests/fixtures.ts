// tslint:disable: object-literal-sort-keys
import { clone, cloneDeep } from 'lodash';
import { OrganizationFormFields } from '../../../components/forms/OrganizationForm';
import { FIReasonType, FIStatusType } from '../../../components/forms/PlanForm/types';
import { Organization } from '../opensrp/organizations';
import { Practitioner } from '../opensrp/practitioners';
import { InterventionType, Plan, PlanStatus } from '../plans';

export const plan1: Plan = {
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
  plan_fi_reason: 'Routine' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  plan_intervention_type: InterventionType.FI,
  plan_status: PlanStatus.ACTIVE,
  plan_title: 'A1-Tha Luang Village 1 Focus 01',
  plan_version: '1',
};

export const plan2: Plan = {
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
  plan_fi_reason: 'Case Triggered' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: 'plan-id-2',
  plan_intervention_type: InterventionType.IRS,
  plan_status: PlanStatus.ACTIVE,
  plan_title: 'A1-Tha Luang Village 1 Focus 01',
  plan_version: '1',
};

export const plan22: Plan = {
  id: 'plan-22',
  jurisdiction_depth: 2,
  jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
  jurisdiction_name: 'NVI_439',
  jurisdiction_name_path: ['Chadiza', 'Naviluli'],
  jurisdiction_parent_id: '2944',
  jurisdiction_path: ['2939', '2944'],
  plan_date: '2019-06-18',
  plan_effective_period_end: '2019-06-18',
  plan_effective_period_start: '2019-07-31',
  plan_fi_reason: 'Routine' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  plan_intervention_type: InterventionType.FI,
  plan_status: PlanStatus.ACTIVE,
  plan_title: 'Test by John Doe',
  plan_version: '1',
};

export const plan24: Plan = {
  id: 'plan-24',
  jurisdiction_depth: 2,
  jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
  jurisdiction_name: 'NVI_439',
  jurisdiction_name_path: ['Chadiza', 'Naviluli'],
  jurisdiction_parent_id: '2944',
  jurisdiction_path: ['2939', '2944'],
  plan_date: '2019-06-18',
  plan_effective_period_end: '2019-06-18',
  plan_effective_period_start: '2019-07-31',
  plan_fi_reason: 'Case Triggered' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  plan_intervention_type: InterventionType.FI,
  plan_status: PlanStatus.ACTIVE,
  plan_title: 'Test by John Doe',
  plan_version: '1',
};

export const plan25: Plan = {
  id: 'plan-25',
  jurisdiction_depth: 2,
  jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
  jurisdiction_name: 'NVI_439',
  jurisdiction_name_path: ['Chadiza', 'Naviluli'],
  jurisdiction_parent_id: '2944',
  jurisdiction_path: ['2939', '2944'],
  plan_date: '2019-06-18',
  plan_effective_period_end: '2019-06-18',
  plan_effective_period_start: '2019-07-31',
  plan_fi_reason: 'Case Triggered' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  plan_intervention_type: InterventionType.FI,
  plan_status: PlanStatus.ACTIVE,
  plan_title: 'Test by Jane Doe',
  plan_version: '1',
};

export const draftPlan = {
  id: 'draftPlan-id-2',
  jurisdiction_depth: 41,
  jurisdiction_id: '3380',
  jurisdiction_name: 'TLv1_02',
  jurisdiction_name_path: ['Canton Tha Luang', 'Tha Luang Village'],
  jurisdiction_parent_id: '2977',
  jurisdiction_path: ['2989', '2977'],
  plan_date: '2019-06-18',
  plan_effective_period_end: '2019-06-18',
  plan_effective_period_start: '2019-07-31',
  plan_fi_reason: 'Case Triggered' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: 'plan-id-2',
  plan_intervention_type: InterventionType.IRS,
  plan_status: PlanStatus.DRAFT,
  plan_title: 'A1-Tha Luang Village 1 Focus 01',
  plan_version: '1',
};

export const retiredPlan = {
  id: 'draftPlan-id-2',
  jurisdiction_depth: 41,
  jurisdiction_id: '3380',
  jurisdiction_name: 'TLv1_02',
  jurisdiction_name_path: ['Canton Tha Luang', 'Tha Luang Village'],
  jurisdiction_parent_id: '2977',
  jurisdiction_path: ['2989', '2977'],
  plan_date: '2019-06-18',
  plan_effective_period_end: '2019-06-18',
  plan_effective_period_start: '2019-07-31',
  plan_fi_reason: 'Case Triggered' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: 'plan-id-2',
  plan_intervention_type: InterventionType.IRS,
  plan_status: PlanStatus.RETIRED,
  plan_title: 'A1-Tha Luang Village 1 Focus 01',
  plan_version: '1',
};

export const completeRoutinePlan = {
  id: 'completedRoutinePlan-id-2',
  jurisdiction_depth: 51,
  jurisdiction_id: '3381',
  jurisdiction_name: 'TLv1_02',
  jurisdiction_name_path: ['Canton Tha Luang', 'Tha Luang Village'],
  jurisdiction_parent_id: '2977',
  jurisdiction_path: ['2989', '2977'],
  plan_date: '2019-06-18',
  plan_effective_period_end: '2019-06-18',
  plan_effective_period_start: '2019-07-31',
  plan_fi_reason: 'Routine' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: 'plan-id-2',
  plan_intervention_type: InterventionType.FI,
  plan_status: 'complete' as PlanStatus,
  plan_title: 'A1-Tha Luang Village 1 Focus 01',
  plan_version: '1',
};
export const completeReactivePlan = {
  id: 'draftPlan-id-2',
  jurisdiction_depth: 43,
  jurisdiction_id: '3391',
  jurisdiction_name: 'TLv1_02',
  jurisdiction_name_path: ['Canton Tha Luang', 'Tha Luang Village'],
  jurisdiction_parent_id: '2977',
  jurisdiction_path: ['2989', '2977'],
  plan_date: '2019-06-18',
  plan_effective_period_end: '2019-06-18',
  plan_effective_period_start: '2019-07-31',
  plan_fi_reason: 'Case Triggered' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: 'plan-id-2',
  plan_intervention_type: InterventionType.FI,
  plan_status: 'complete',
  plan_title: 'A1-Tha Luang Village 1 Focus 01',
  plan_version: '1',
};
export const plan5 = {
  id: '93d3a80e-714c-51c7-a382-7633f1eb1f1b',
  jurisdiction_depth: 0,
  jurisdiction_id: ' NULL',
  jurisdiction_name: ' NULL',
  jurisdiction_name_path: ['Trat 2', 'Mueng Trat District 2'],
  jurisdiction_parent_id: ' NULL',
  jurisdiction_path: [
    '61707fc2-c6ac-4112-a8d6-2a4861958396',
    '8a8e4987-95a9-4b2e-b746-3c9c3eec15c5',
  ],
  plan_date: '2019-06-18',
  plan_effective_period_end: '2019-06-18',
  plan_effective_period_start: '2019-07-31',
  plan_fi_reason: 'Case Triggered' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: 'e9c9a069-7d22-44c0-a59e-9a483948716b',
  plan_intervention_type: 'FI',
  plan_status: 'active',
  plan_title: 'A1 - Ban Chamrak Mu - Focus 02 Rubber Plantation',
  plan_version: '1',
};

export const plan6 = {
  ...plan2,
  jurisdiction_id: 'null',
  jurisdiction_name: 'null',
  jurisdiction_name_path: 'null',
  jurisdiction_parent_id: 'null',
  jurisdiction_path: 'null',
};

export const plan7 = {
  ...plan2,
  id: 'plan-id-7',
  jurisdiction_name_path: 'null',
  jurisdiction_parent_id: 'null',
  jurisdiction_path: 'null',
};

export const plan3 = {
  id: '1502e539',
  jurisdiction_depth: 4,
  jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
  jurisdiction_name: 'TLv1_01',
  jurisdiction_name_path: JSON.stringify([
    'Lop Buri',
    'District Tha Luang',
    'Canton Tha Luang',
    'Tha Luang Village 1',
  ]),
  jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
  jurisdiction_path: JSON.stringify([
    '9c3c2db4-bddd-44c5-870a-a0eef539e4da',
    '1d16510a-4ae1-453d-9c55-60d966818f47',
    '872cc59e-0bce-427a-bd1f-6ef674dba8e2',
    'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
  ]),
  plan_date: '2019-06-18',
  plan_effective_period_end: '2019-06-18',
  plan_effective_period_start: '2019-07-31',
  plan_fi_reason: 'Routine' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  plan_intervention_type: 'FI',
  plan_status: 'active',
  plan_title: 'A1-Tha Luang Village 1 Focus 01',
  plan_version: '1',
};

export const plan99 = {
  id: '236ca3fb-1b74-5028-a0c8-ab954bb28044',
  jurisdiction_depth: 4,
  jurisdiction_id: '4550a8ab-b310-4881-8c76-1b6a817ea63a',
  jurisdiction_name: 'Tha Sen 8',
  jurisdiction_name_path: [
    'Trat 2',
    'Mueng Trat District 2',
    'Laem Klat Canton 2',
    'Laem Klat Moo 8',
  ],
  jurisdiction_parent_id: 'a14c6253-2d3d-4bcc-8c49-35f9e44c66e1',
  jurisdiction_path: [
    '61707fc2-c6ac-4112-a8d6-2a4861958396',
    '8a8e4987-95a9-4b2e-b746-3c9c3eec15c5',
    '735a94f9-6ed2-4bcd-b242-8c2b5f714bee',
    'a14c6253-2d3d-4bcc-8c49-35f9e44c66e1',
  ],
  plan_date: '2019-07-03',
  plan_effective_period_end: '2019-07-30',
  plan_effective_period_start: '2019-06-18',
  plan_fi_reason: 'Case Triggered' as FIReasonType,
  plan_fi_status: 'A1' as FIStatusType,
  plan_id: '5ad62ca5-6b9b-4c5e-bd72-c9824074c385',
  plan_intervention_type: 'FI',
  plan_name: 'A1-ThaSen8_01',
  plan_status: 'active',
  plan_title: 'A1 - Tha Sen 8- Focus 01',
  plan_version: '1',
};

export const plan101 = {
  ...plan99,
  id: '236ca3fb-1b74-5028-a0c8-ab954bb28055',
  plan_name: 'A1-ThaSen8_02',
  plan_status: 'complete',
  plan_title: 'A1 - Tha Sen 8- Focus 02',
  plan_version: '1',
};

export const plan102 = {
  ...plan99,
  id: '236ca3fb-1b74-5028-a0c8-ab954bb28066',
  plan_fi_reason: 'Routine' as FIReasonType,
  plan_name: 'A1-ThaSen8_03',
  plan_status: 'active',
  plan_title: 'A1 - Tha Sen 8- Focus 03',
  plan_version: '1',
};

export const plan103 = {
  ...plan99,
  id: '236ca3fb-1b74-5028-a0c8-ab954bb28077',
  plan_fi_reason: 'Routine' as FIReasonType,
  plan_name: 'A1-ThaSen8_04',
  plan_status: 'complete',
  plan_title: 'A1 - Tha Sen 8- Focus 04',
  plan_version: '1',
};

export const plan104 = {
  ...plan103,
  id: 'plan104',
  plan_intervention_type: InterventionType.DynamicFI,
  plan_status: 'active' as PlanStatus,
  plan_title: 'plan104',
  plan_name: 'plan!04',
};

export const plans: Plan[] = [
  plan1,
  plan2,
  draftPlan as Plan,
  completeRoutinePlan as Plan,
  completeReactivePlan as Plan,
];

export const plansIdArray = [plan1.plan_id];

export const planRecordResponse1 = {
  date: '2019-06-24',
  effective_period_end: '2019-07-31',
  effective_period_start: '2019-06-18',
  fi_reason: 'Case Triggered' as FIReasonType,
  fi_status: 'A1' as FIStatusType,
  identifier: '6c7904b2-c556-4004-a9b9-114617832954',
  intervention_type: 'FI',
  name: 'A1-KOK_YAI-Focus_02-Rubber_Plantation',
  status: 'active',
  title: 'A1 - KOK YAI - Focus 02 - Rubber Plantation',
  version: '1',
};

export const planRecordResponse2 = {
  date: '2019-05-16',
  effective_period_end: '2019-08-30',
  effective_period_start: '2019-05-15',
  fi_reason: 'Case Triggered' as FIReasonType,
  fi_status: 'A2',
  identifier: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
  intervention_type: 'FI',
  name: 'A2-Tha_Luang_Village_1_Focus_02',
  status: 'active',
  title: 'A2-Tha Luang Village 1 Focus 02',
  version: '1',
};

export const planRecordResponse3 = {
  date: '2019-05-24',
  effective_period_end: '2019-09-30',
  effective_period_start: '2019-05-27',
  fi_reason: 'Routine' as FIReasonType,
  fi_status: 'A1' as FIStatusType,
  identifier: '90d1095b-4f66-4341-86e2-362c82b2b0b2',
  intervention_type: 'IRS',
  name: 'A1-KhlongNamSai-IRS-01',
  status: 'active',
  title: 'A1 - Khlong Nam Sai - IRS 01',
  version: '1',
};

export const planRecordResponses = [planRecordResponse1, planRecordResponse2, planRecordResponse3];

export const planRecordsById = {
  '6c7904b2-c556-4004-a9b9-114617832954': {
    id: '6c7904b2-c556-4004-a9b9-114617832954',
    plan_date: '2019-06-24',
    plan_effective_period_end: '2019-07-31',
    plan_effective_period_start: '2019-06-18',
    plan_fi_reason: 'Case Triggered',
    plan_fi_status: 'A1' as FIStatusType,
    plan_id: '6c7904b2-c556-4004-a9b9-114617832954',
    plan_intervention_type: 'FI',
    plan_status: 'active',
    plan_title: 'A1 - KOK YAI - Focus 02 - Rubber Plantation',
    plan_version: '1',
  },
  '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc': {
    id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
    plan_date: '2019-05-16',
    plan_effective_period_end: '2019-08-30',
    plan_effective_period_start: '2019-05-15',
    plan_fi_reason: 'Case Triggered',
    plan_fi_status: 'A2' as FIStatusType,
    plan_id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
    plan_intervention_type: 'FI',
    plan_status: 'active',
    plan_title: 'A2-Tha Luang Village 1 Focus 02',
    plan_version: '1',
  },
  '90d1095b-4f66-4341-86e2-362c82b2b0b2': {
    id: '90d1095b-4f66-4341-86e2-362c82b2b0b2',
    plan_date: '2019-05-24',
    plan_effective_period_end: '2019-09-30',
    plan_effective_period_start: '2019-05-27',
    plan_fi_reason: 'Routine' as FIReasonType,
    plan_fi_status: 'A1' as FIStatusType,
    plan_id: '90d1095b-4f66-4341-86e2-362c82b2b0b2',
    plan_intervention_type: 'IRS',
    plan_status: 'active',
    plan_title: 'A1 - Khlong Nam Sai - IRS 01',
    plan_version: '1',
  },
};

export const sortedPlanRecordArray = [
  {
    id: '6c7904b2-c556-4004-a9b9-114617832954',
    plan_date: '2019-06-24',
    plan_effective_period_end: '2019-07-31',
    plan_effective_period_start: '2019-06-18',
    plan_fi_reason: 'Case Triggered' as FIReasonType,
    plan_fi_status: 'A1' as FIStatusType,
    plan_id: '6c7904b2-c556-4004-a9b9-114617832954',
    plan_intervention_type: 'FI',
    plan_status: 'active',
    plan_title: 'A1 - KOK YAI - Focus 02 - Rubber Plantation',
    plan_version: '1',
  },
  {
    id: '90d1095b-4f66-4341-86e2-362c82b2b0b2',
    plan_date: '2019-05-24',
    plan_effective_period_end: '2019-09-30',
    plan_effective_period_start: '2019-05-27',
    plan_fi_reason: 'Routine' as FIReasonType,
    plan_fi_status: 'A1' as FIStatusType,
    plan_id: '90d1095b-4f66-4341-86e2-362c82b2b0b2',
    plan_intervention_type: 'IRS',
    plan_status: 'active',
    plan_title: 'A1 - Khlong Nam Sai - IRS 01',
    plan_version: '1',
  },
  {
    id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
    plan_date: '2019-05-16',
    plan_effective_period_end: '2019-08-30',
    plan_effective_period_start: '2019-05-15',
    plan_fi_reason: 'Case Triggered' as FIReasonType,
    plan_fi_status: 'A2' as FIStatusType,
    plan_id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
    plan_intervention_type: 'FI',
    plan_status: 'active',
    plan_title: 'A2-Tha Luang Village 1 Focus 02',
    plan_version: '1',
  },
];

export const goal1 = {
  action_code: 'Case Confirmation',
  action_description: 'Confirm the index case',
  action_prefix: '1',
  action_reason: 'Investigation',
  action_title: 'Case Confirmation',
  completed_task_count: 0,
  goal_comparator: '=',
  goal_id: 'Case_Confirmation',
  goal_unit: 'each',
  goal_value: 1,
  id: '5a27ec10-7a5f-563c-ba11-4de150b336af',
  jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
  measure: 'Case confirmation complete',
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  task_business_status_map: {},
  task_count: 0,
};

export const goal2 = {
  action_code: 'Larval Dipping',
  action_description:
    'Perform a minimum of three larval dipping activities in the operational area',
  action_prefix: '5',
  action_reason: 'Investigation',
  action_title: 'Larval Dipping',
  completed_task_count: 0,
  goal_comparator: '>=',
  goal_id: 'Larval_Dipping_Min_3_Sites',
  goal_unit: 'each',
  goal_value: 3,
  id: 'f8d4e0a9-5867-5c78-9e26-de45d72556c4',
  jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
  measure: 'Number of larval dipping activities',
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  task_business_status_map: { 'Not Visited': 2 },
  task_count: 2,
};

export const goal3 = {
  action_code: 'Blood Screening',
  action_description:
    'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
  action_prefix: '4',
  action_reason: 'Investigation',
  action_title: 'RACD Blood screening',
  completed_task_count: 0,
  goal_comparator: '=',
  goal_id: 'RACD_blood_screening_1km_radius',
  goal_unit: 'percent',
  goal_value: 100,
  id: '19b86421-3cb2-5698-9f11-c1bdafbe5e6d',
  jurisdiction_id: '1337',
  measure: 'Percent of registered people tested',
  plan_id: '1337',
  task_business_status_map: {},
  task_count: 0,
};

export const goal4 = {
  action_code: 'Mosquito Collection',
  action_description:
    'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
  action_prefix: '6',
  action_reason: 'Investigation',
  action_title: 'Mosquito Collection',
  completed_task_count: 3,
  goal_comparator: '>=',
  goal_id: 'Mosquito_Collection_Min_3_Traps',
  goal_unit: 'traps',
  goal_value: 3,
  id: '0f03cef6-1654-5bba-8898-1d2a8000e5b1',
  jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
  measure: 'Number of mosquito collection traps',
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  task_business_status_map: {
    Complete: 3,
    'In Progress': 3,
    Incomplete: 1,
    'Not Eligible': 6,
    'Not Visited': 5,
  },
  task_count: 18,
};

export const goal5 = {
  action_code: 'Bednet Distribution',
  action_description:
    'Visit 100% of residential structures in the operational area and provide nets',
  action_prefix: '3',
  action_reason: 'Routine',
  action_title: 'Bednet Distribution',
  completed_task_count: 4,
  goal_comparator: '>=',
  goal_id: 'RACD_bednet_dist_1km_radius',
  goal_unit: 'percent',
  goal_value: 100,
  id: 'e50f7156-c80e-541e-a24c-0b3e0d95b868',
  jurisdiction_id: '304cbcd4-0850-404a-a8b1-486b02f7b84d',
  measure: 'Percent of residential structures visited',
  plan_id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
  task_business_status_map: {
    Complete: 4,
    'Not Visited': 11,
  },
  task_count: 15,
};

export const goal6 = {
  action_code: 'Bednet Distribution',
  action_description:
    'Visit 75% of residential structures in the operational area and provide nets',
  action_prefix: '3',
  action_reason: 'Routine',
  action_title: 'Bednet Distribution',
  completed_task_count: 4,
  goal_comparator: '>=',
  goal_id: 'RACD_bednet_dist_1km_radius',
  goal_unit: 'percent',
  goal_value: 75,
  id: 'e50f7156-c80e-541e-a24c-0b3e0d95b868',
  jurisdiction_id: '304cbcd4-0850-404a-a8b1-486b02f7b84d',
  measure: 'Percent of residential structures visited',
  plan_id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
  task_business_status_map: {
    Complete: 4,
    'Not Visited': 11,
  },
  task_count: 15,
};

export const goal7 = {
  action_code: 'Bednet Distribution',
  action_description:
    'Visit 90% of residential structures in the operational area and provide nets',
  action_prefix: '3',
  action_reason: 'Routine',
  action_title: 'Bednet Distribution',
  completed_task_count: 3,
  goal_comparator: '>=',
  goal_id: 'RACD_bednet_dist_1km_radius',
  goal_unit: 'percent',
  goal_value: 90,
  id: 'e50f7156-c80e-541e-a24c-0b3e0d95b868',
  jurisdiction_id: '304cbcd4-0850-404a-a8b1-486b02f7b84d',
  measure: 'Percent of residential structures visited',
  plan_id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
  task_business_status_map: {
    Complete: 4,
    'Not Visited': 11,
  },
  task_count: 6,
};

export const goal8 = {
  action_code: 'RACD Register Family',
  action_description:
    'Register all families & famiy members in all residential structures enumerated (100%) within the operational area',
  action_prefix: '2',
  action_reason: 'Investigation',
  action_title: 'Family Registration',
  completed_task_count: 7,
  goal_comparator: '>=',
  goal_id: 'RACD_register_all_families',
  goal_unit: 'Percent',
  goal_value: 100,
  id: '43cebec8-1900-51e2-83a8-9041b380cdee',
  jurisdiction_id: '674b66eb-b2aa-49b0-8635-2df5b0490aa8',
  measure: 'Percent of residential structures with full family registration',
  plan_id: '629badcb-2ea9-43a8-bcda-8489ab157b8d',
  task_business_status_map: { Complete: 7, 'Not Visited': 220 },
  task_count: 227,
};

const goal37 = clone(goal4);
goal37.id = '1337';
(goal37.task_business_status_map as any) = JSON.stringify(goal37.task_business_status_map);
export { goal37 };

// there are tests that rely on the order of this Array
export const goals = [goal1, goal2, goal3, goal4, goal5, goal6, goal8];

export const plan1Goals = [goal1, goal2];

export const goalsByPlanId = {
  '10f9e9fa-ce34-4b27-a961-72fab5206ab6': [goal1, goal2],
  '1337': [goal3],
};

export const task1 = {
  geojson: {
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
    id: 'e652f8b2-b884-42d5-832a-86009c10a812',
    properties: {
      action_code: 'RACD Register Family',
      goal_id: 'RACD_register_family_1km_radius',
      jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
      jurisdiction_name: 'TLv1_01',
      jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
      plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
      structure_code: 'a19eeb63-45d0-4744-9a9d-76d0694103f6',
      structure_id: 'a19eeb63-45d0-4744-9a9d-76d0694103f6',
      structure_name: 'a19eeb63-45d0-4744-9a9d-76d0694103f6',
      structure_type: 'a19eeb63-45d0-4744-9a9d-76d0694103f6',
      task_business_status: 'Not Visited',
      task_execution_end_date: '2019-04-01',
      task_execution_start_date: '2019-04-08',
      task_id: 'e652f8b2-b884-42d5-832a-86009c10a812',
      task_focus: '95515b0d-b9c0-496e-83c7-7af8b4924d1f',
      task_status: 'Ready',
      task_task_for: 'a19eeb63-45d0-4744-9a9d-76d0694103f6',
    },
    type: 'Feature',
  },
  goal_id: 'RACD_register_family_1km_radius',
  jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  task_identifier: 'e652f8b2-b884-42d5-832a-86009c10a812',
};

export const task2 = {
  geojson: {
    geometry: {
      coordinates: [
        [
          [101.177725195885, 15.0658221308165],
          [101.177684962749, 15.0657263002127],
          [101.177778840065, 15.0656848599382],
          [101.177832484245, 15.0657781005444],
          [101.177725195885, 15.0658221308165],
        ],
      ],
      type: 'Polygon',
    },
    id: '03458d28-af61-4f70-b110-73a3429ada2d',
    properties: {
      action_code: 'Bednet Distribution',
      goal_id: 'RACD_bednet_dist_1km_radius',
      jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
      jurisdiction_name: 'TLv1_01',
      jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
      plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
      structure_code: 'da765947-5e4d-49f7-9eb8-2d2d00681f65',
      structure_id: 'da765947-5e4d-49f7-9eb8-2d2d00681f65',
      structure_name: 'da765947-5e4d-49f7-9eb8-2d2d00681f65',
      structure_type: 'da765947-5e4d-49f7-9eb8-2d2d00681f65',
      task_business_status: 'Not Visited',
      task_execution_end_date: '2019-04-01',
      task_execution_start_date: '2019-04-08',
      task_focus: 'Bednet Distribution',
      task_id: '03458d28-af61-4f70-b110-73a3429ada2d',
      task_status: 'Ready',
      task_task_for: 'da765947-5e4d-49f7-9eb8-2d2d00681f65',
    },
    type: 'Feature',
  },
  goal_id: 'RACD_bednet_dist_1km_radius',
  jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  task_identifier: '03458d28-af61-4f70-b110-73a3429ada2d',
};

export const task3 = {
  geojson: {
    geometry: {
      coordinates: [28.3524419816308, -15.4178320108929],
      type: 'Point',
    },
    id: 'e3e1f2a7-4c53-4059-ab81-0811539e0c5e',
    properties: {
      action_code: 'Mosquito Collection',
      goal_id: 'Mosquito_Collection_Min_3_Traps',
      jurisdiction_id: '3952',
      jurisdiction_name: 'Akros_2',
      jurisdiction_parent_id: '3019',
      plan_id: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
      structure_code: '5f7a0d7c-1412-4af6-83ed-f94787b205e8',
      structure_id: '5f7a0d7c-1412-4af6-83ed-f94787b205e8',
      structure_name: '5f7a0d7c-1412-4af6-83ed-f94787b205e8',
      structure_type: '5f7a0d7c-1412-4af6-83ed-f94787b205e8',
      task_business_status: 'Complete',
      task_execution_end_date: '2019-04-01',
      task_execution_start_date: '2019-04-08',
      task_id: 'e3e1f2a7-4c53-4059-ab81-0811539e0c5e',
      task_focus: 'Mosquito Collection',
      task_status: 'Completed',
      task_task_for: '5f7a0d7c-1412-4af6-83ed-f94787b205e8',
    },
    type: 'Feature',
  },
  goal_id: 'Mosquito_Collection_Min_3_Traps',
  jurisdiction_id: '3952',
  plan_id: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
  task_identifier: 'e3e1f2a7-4c53-4059-ab81-0811539e0c5e',
};

export const task4 = {
  geojson: {
    geometry: null,
    id: '01d0b84c-df06-426c-a272-6858e84fea31',
    properties: {
      action_code: 'Blood Screening',
      goal_id: 'RACD_blood_screening_1km_radius',
      jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
      jurisdiction_name: 'TLv1_01',
      jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
      plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
      structure_code: null,
      structure_id: null,
      structure_name: null,
      structure_type: null,
      task_business_status: 'Not Visited',
      task_execution_end_date: '2019-04-01',
      task_execution_start_date: '2019-04-08',
      task_focus: 'Blood Screening',
      task_id: '01d0b84c-df06-426c-a272-6858e84fea31',
      task_status: 'Ready',
      task_task_for: 'c222d4ba-b3c4-4cc8-abae-bdea06511b27',
    },
    type: 'Feature',
  },
  goal_id: 'RACD_blood_screening_1km_radius',
  jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  task_identifier: '01d0b84c-df06-426c-a272-6858e84fea31',
};

export const task5 = {
  geojson: {
    geometry: {
      coordinates: [
        [
          [101.18838429451, 15.0904724723464],
          [101.188470125198, 15.0904724723464],
          [101.188470125198, 15.0905915992282],
          [101.18838429451, 15.0905915992282],
          [101.18838429451, 15.0904724723464],
        ],
      ],
      type: 'Polygon',
    },
    id: '250399fc-12e9-415e-aadf-ee3d009fcdf6',
    properties: {
      action_code: 'Bednet Distribution',
      goal_id: 'RACD_bednet_dist_1km_radius',
      jurisdiction_id: '304cbcd4-0850-404a-a8b1-486b02f7b84d',
      jurisdiction_name: 'TLv1_02',
      jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
      plan_id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
      structure_code: '0a840508-d1ac-4082-89f8-c1ffabdfe976',
      structure_id: '0a840508-d1ac-4082-89f8-c1ffabdfe976',
      structure_name: '0a840508-d1ac-4082-89f8-c1ffabdfe976',
      structure_type: '0a840508-d1ac-4082-89f8-c1ffabdfe976',
      task_business_status: 'Not Visited',
      task_execution_end_date: '2019-06-18',
      task_execution_start_date: '2019-06-15',
      task_focus: 'Bednet Distribution',
      task_status: 'Ready',
      task_task_for: '0a840508-d1ac-4082-89f8-c1ffabdfe976',
    },
    type: 'Feature',
  },
  goal_id: 'RACD_bednet_dist_1km_radius',
  jurisdiction_id: '304cbcd4-0850-404a-a8b1-486b02f7b84d',
  plan_id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
  task_identifier: '250399fc-12e9-415e-aadf-ee3d009fcdf6',
};

export const task6 = {
  geojson: {
    geometry: {
      coordinates: [
        [
          [101.18939012289, 15.091948605081],
          [101.189454495907, 15.091948605081],
          [101.189454495907, 15.0920547826543],
          [101.18939012289, 15.0920547826543],
          [101.18939012289, 15.091948605081],
        ],
      ],
      type: 'Polygon',
    },
    id: '18049c84-8762-4951-904d-44485b4df3f0',
    properties: {
      action_code: 'Bednet Distribution',
      goal_id: 'RACD_bednet_dist_1km_radius',
      jurisdiction_id: '304cbcd4-0850-404a-a8b1-486b02f7b84d',
      jurisdiction_name: 'TLv1_02',
      jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
      plan_id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
      structure_code: '3d5bec31-14f6-4baa-a68b-fdcc37918991',
      structure_id: '3d5bec31-14f6-4baa-a68b-fdcc37918991',
      structure_name: '3d5bec31-14f6-4baa-a68b-fdcc37918991',
      structure_type: '3d5bec31-14f6-4baa-a68b-fdcc37918991',
      task_business_status: 'Not Visited',
      task_execution_end_date: '2019-06-18',
      task_execution_start_date: '2019-06-15',
      task_focus: 'Bednet Distribution',
      task_status: 'Ready',
      task_task_for: '3d5bec31-14f6-4baa-a68b-fdcc37918991',
    },
    type: 'Feature',
  },
  goal_id: 'RACD_bednet_dist_1km_radius',
  jurisdiction_id: '304cbcd4-0850-404a-a8b1-486b02f7b84d',
  plan_id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
  task_identifier: '18049c84-8762-4951-904d-44485b4df3f0',
};

export const task7 = {
  geojson: {
    geometry: {
      coordinates: [
        [
          [101.188456714153, 15.0921402426137],
          [101.188577413559, 15.0921402426137],
          [101.188577413559, 15.0922153437619],
          [101.188456714153, 15.0922153437619],
          [101.188456714153, 15.0921402426137],
        ],
      ],
      type: 'Polygon',
    },
    id: '16a794e4-46de-4733-8f4d-9d0b9db8b298',
    properties: {
      action_code: 'Bednet Distribution',
      goal_id: 'RACD_bednet_dist_1km_radius',
      jurisdiction_id: '304cbcd4-0850-404a-a8b1-486b02f7b84d',
      jurisdiction_name: 'TLv1_02',
      jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
      plan_id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
      structure_code: 'c15f5b44-ff72-44f3-b0bd-e2399462a536',
      structure_id: 'c15f5b44-ff72-44f3-b0bd-e2399462a536',
      structure_name: 'c15f5b44-ff72-44f3-b0bd-e2399462a536',
      structure_type: 'c15f5b44-ff72-44f3-b0bd-e2399462a536',
      task_business_status: 'Not Visited',
      task_execution_end_date: '2019-06-18',
      task_execution_start_date: '2019-06-15',
      task_focus: 'Bednet Distribution',
      task_status: 'Ready',
      task_task_for: 'c15f5b44-ff72-44f3-b0bd-e2399462a536',
    },
    type: 'Feature',
  },
  goal_id: 'RACD_bednet_dist_1km_radius',
  jurisdiction_id: '304cbcd4-0850-404a-a8b1-486b02f7b84d',
  plan_id: '89fh38sg-h83s-9xf2-a7h2-pl98dh320lbc',
  task_identifier: '16a794e4-46de-4733-8f4d-9d0b9db8b298',
};

export const task8 = {
  task_identifier: 'aee7dc62-4ec5-4db3-9985-05f4e914f2ec',
  plan_id: '125ce534-9d84-5f94-8eb1-dd7616b7ba67',
  jurisdiction_id: '3951',
  goal_id: 'Case_Confirmation',
  action_code: 'Case Confirmation',
  task_business_status: 'Complete',
  geojson: {
    id: 'aee7dc62-4ec5-4db3-9985-05f4e914f2ec',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [28.3514374, -15.4193609],
          [28.3516475, -15.4194092],
          [28.3516207, -15.4195178],
          [28.3514106, -15.4194695],
          [28.3514374, -15.4193609],
        ],
      ],
    },
    properties: {
      goal_id: 'Case_Confirmation',
      plan_id: '125ce534-9d84-5f94-8eb1-dd7616b7ba67',
      task_focus: '71d3349f-25d5-593d-b88d-704467e0945f',
      action_code: 'Case Confirmation',
      task_status: 'Completed',
      structure_id: '154149',
      task_task_for: '03137c91-7818-4a77-b2cb-f811f80c0efc',
      structure_code: '154149',
      structure_name: '154149',
      structure_type: 'Feature',
      jurisdiction_id: '3951',
      jurisdiction_name: 'Akros_1',
      task_business_status: 'Complete',
      jurisdiction_parent_id: '3019',
      task_execution_end_date: '2020-03-30',
      task_execution_start_date: '2020-03-23',
    },
  },
};
export const task9 = {
  task_identifier: 'b421e054-b2b1-443b-b0b8-14bdfb6a1ad6',
  plan_id: '02b3629b-8eb8-531a-ada4-2dfa541f1dcf',
  jurisdiction_id: '3951',
  goal_id: 'Case_Confirmation',
  action_code: 'Case Confirmation',
  task_business_status: 'Complete',
  geojson: {
    id: 'b421e054-b2b1-443b-b0b8-14bdfb6a1ad6',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [28.3512898, -15.4182898],
          [28.3513309, -15.4182819],
          [28.3513454, -15.4183521],
          [28.3510395, -15.4184111],
          [28.3510239, -15.4183359],
          [28.3511749, -15.4183068],
          [28.35116, -15.418235],
          [28.3512739, -15.4182131],
          [28.3512898, -15.4182898],
        ],
      ],
    },
    properties: {
      goal_id: 'Case_Confirmation',
      plan_id: '02b3629b-8eb8-531a-ada4-2dfa541f1dcf',
      task_focus: '608d4d53-0276-5c7d-9333-635c96a7e839',
      action_code: 'Case Confirmation',
      task_status: 'Completed',
      structure_id: '154142',
      task_task_for: '8492a2c5-35d5-4669-92a7-0ba20d10a31d',
      structure_code: '154142',
      structure_name: '154142',
      structure_type: 'Feature',
      jurisdiction_id: '3951',
      jurisdiction_name: 'Akros_1',
      task_business_status: 'Complete',
      jurisdiction_parent_id: '3019',
      task_execution_end_date: '2020-03-30',
      task_execution_start_date: '2020-03-23',
    },
  },
};
export const task10 = {
  task_identifier: 'ae7118ca-9918-419c-a6da-4850f99b686d',
  plan_id: 'c08a318d-9b63-5b46-9ce7-ac3a4c0ade6e',
  jurisdiction_id: '3951',
  goal_id: 'Case_Confirmation',
  action_code: 'Case Confirmation',
  task_business_status: 'Not Visited',
  geojson: {
    id: 'ae7118ca-9918-419c-a6da-4850f99b686d',
    type: 'Feature',
    geometry: null,
    properties: {
      goal_id: 'Case_Confirmation',
      plan_id: 'c08a318d-9b63-5b46-9ce7-ac3a4c0ade6e',
      task_focus: '67119e69-f14a-590f-8df6-570a8e6e3554',
      action_code: 'Case Confirmation',
      task_status: 'Ready',
      structure_id: null,
      task_task_for: '3951',
      structure_code: null,
      structure_name: null,
      structure_type: null,
      jurisdiction_id: '3951',
      jurisdiction_name: 'Akros_1',
      task_business_status: 'Not Visited',
      jurisdiction_parent_id: '3019',
      task_execution_end_date: '2020-03-30',
      task_execution_start_date: '2020-03-23',
    },
  },
};

const task76 = cloneDeep(task2);
task76.task_identifier = 'moshT';
task76.geojson.id = 'moshT';
(task76.geojson as any) = JSON.stringify(task76.geojson);
export { task76 };

export const tasks = [task1, task2, task3, task4];

export const tasksByGoal = [task4, task5];

const coloredTask1: any = cloneDeep(task1);
coloredTask1.geojson.properties.color = '#FFCA16';

const coloredTask2: any = cloneDeep(task2);
coloredTask2.geojson.properties.color = '#FFCA16';

const coloredTask3: any = cloneDeep(task3);
coloredTask3.geojson.properties.color = '#68BB0C';

const coloredTask4: any = cloneDeep(task4);
coloredTask4.geojson.properties.color = '#FFCA16';

const coloredTask5: any = cloneDeep(task5);
coloredTask5.geojson.properties.color = '#FFCA16';

const coloredTask6: any = cloneDeep(task6);
coloredTask6.geojson.properties.color = '#F12525';

const coloredTask7: any = cloneDeep(task7);
coloredTask7.geojson.properties.color = '#000000';

export const bednetTasks = [coloredTask5, coloredTask6, coloredTask7];
export const pointTasks = [coloredTask3];
export const polygonTask = [coloredTask5, coloredTask6, coloredTask7];

export const coloredTasks = {
  task1: coloredTask1,
  task2: coloredTask2,
  task3: coloredTask3,
  task4: coloredTask4,
};

export const coloredTasksArray = [
  coloredTasks.task1,
  coloredTasks.task2,
  coloredTasks.task3,
  coloredTasks.task4,
];

export const taskIdsArray = [
  task1.task_identifier,
  task2.task_identifier,
  task3.task_identifier,
  task4.task_identifier,
];

export const structure1 = {
  geojson: {
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
    id: 'e652f8b2-b884-42d5-832a-86009c10a812',
    properties: {
      code: 'bbcf2240-0a2d-4df7-8890-2c928f5bccaa',
      effective_end_date: null,
      effective_start_date: null,
      geographic_level: 6,
      jurisdiction_id: '4550a8ab-b310-4881-8c76-1b6a817ea63a',
      name: 'bbcf2240-0a2d-4df7-8890-2c928f5bccaa',
      server_version: 1562120301666,
      status: 'Active',
      type: 'bbcf2240-0a2d-4df7-8890-2c928f5bccaa',
      uid: 'bbcf2240-0a2d-4df7-8890-2c928f5bccaa',
      version: 0,
    },
    type: 'Feature',
  },
  id: '155288',
  jurisdiction_id: '4550a8ab-b310-4881-8c76-1b6a817ea63a',
};

export const structure2 = {
  geojson: {
    geometry: {
      coordinates: [
        [
          [101.177725195885, 15.0658221308165],
          [101.177684962749, 15.0657263002127],
          [101.177778840065, 15.0656848599382],
          [101.177832484245, 15.0657781005444],
          [101.177725195885, 15.0658221308165],
        ],
      ],
      type: 'Polygon',
    },
    id: '03458d28-af61-4f70-b110-73a3429ada2d',
    properties: {
      code: '18bbb83b-844b-4847-9cfa-1b00e8f98d0b',
      effective_end_date: null,
      effective_start_date: null,
      geographic_level: 6,
      jurisdiction_id: '4550a8ab-b310-4881-8c76-1b6a817ea63a',
      name: '18bbb83b-844b-4847-9cfa-1b00e8f98d0b',
      server_version: 1562120301665,
      status: 'Active',
      type: '18bbb83b-844b-4847-9cfa-1b00e8f98d0b',
      uid: '18bbb83b-844b-4847-9cfa-1b00e8f98d0b',
      version: 0,
    },
    type: 'Feature',
  },
  id: '155324',
  jurisdiction_id: '4550a8ab-b310-4881-8c76-1b6a817ea63a',
};
export const structure3 = {
  geojson: {
    geometry: {
      coordinates: [
        [
          [101.177725195885, 15.0658221308165],
          [101.177684962749, 15.0657263002127],
          [101.177778840065, 15.0656848599382],
          [101.177832484245, 15.0657781005444],
          [101.177725195885, 15.0658221308165],
        ],
      ],
      type: 'Polygon',
    },
    id: '03458d28-af61-4f70-b110-73a3429ada2d',
    properties: {
      code: '18bbb83b-844b-4847-9cfa-1b00e8f98d0b',
      effective_end_date: null,
      effective_start_date: null,
      geographic_level: 6,
      jurisdiction_id: '4550a8ab-b310-4881-8c76-1b6a817ea63a',
      name: '18bbb83b-844b-4847-9cfa-1b00e8f98d0b',
      server_version: 1562120301665,
      status: 'Active',
      type: '18bbb83b-844b-4847-9cfa-1b00e8f98d0b',
      uid: '18bbb83b-844b-4847-9cfa-1b00e8f98d0b',
      version: 0,
    },
    type: 'Feature',
  },
  id: '155324',
  jurisdiction_id: '4050a8ab-b310-4881-8c76-1b6a817ea63a',
};

export const jurisdiction1 = {
  geojson: {
    geometry: {
      coordinates: [
        [
          [101.166915893555, 15.0715019595332],
          [101.165628433228, 15.069429992157],
          [101.164855957031, 15.0649130333519],
          [101.164898872375, 15.061473449978],
          [101.165843009949, 15.0585311116698],
          [101.168718338013, 15.0577022766384],
          [101.173524856567, 15.0577437184666],
          [101.179447174072, 15.0583653449216],
          [101.183996200562, 15.0589455279759],
          [101.189103126526, 15.0597743581685],
          [101.191892623901, 15.0629238834779],
          [101.191549301147, 15.0671093647448],
          [101.19086265564, 15.0727036913665],
          [101.190605163574, 15.0748170653661],
          [101.188631057739, 15.0768061040682],
          [101.185412406921, 15.0769304183694],
          [101.182150840759, 15.0772619228176],
          [101.177172660828, 15.0780906816776],
          [101.174211502075, 15.0777591785211],
          [101.172151565552, 15.0765989134045],
          [101.168503761292, 15.0753557651845],
          [101.166915893555, 15.0715019595332],
        ],
      ],
      type: 'Polygon',
    },
    id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    properties: {
      jurisdiction_name: 'TLv1_01',
      jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
    },
    type: 'Feature',
  },
  jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
};

export const structures = [structure1, structure2];
export const jurisdictions = [
  jurisdiction1,
  {
    geojson: {
      geometry: {
        coordinates: [
          [
            [101.166915893555, 15.0715019595332],
            [101.165628433228, 15.069429992157],
            [101.164855957031, 15.0649130333519],
            [101.164898872375, 15.061473449978],
            [101.165843009949, 15.0585311116698],
            [101.168718338013, 15.0577022766384],
            [101.173524856567, 15.0577437184666],
            [101.179447174072, 15.0583653449216],
            [101.183996200562, 15.0589455279759],
            [101.189103126526, 15.0597743581685],
            [101.191892623901, 15.0629238834779],
            [101.191549301147, 15.0671093647448],
            [101.19086265564, 15.0727036913665],
            [101.190605163574, 15.0748170653661],
            [101.188631057739, 15.0768061040682],
            [101.185412406921, 15.0769304183694],
            [101.182150840759, 15.0772619228176],
            [101.177172660828, 15.0780906816776],
            [101.174211502075, 15.0777591785211],
            [101.172151565552, 15.0765989134045],
            [101.168503761292, 15.0753557651845],
            [101.166915893555, 15.0715019595332],
          ],
        ],
        type: 'Polygon',
      },
      id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
      properties: {
        jurisdiction_name: 'TLv1_01',
        jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
      },
      type: 'Feature',
    },
    jurisdiction_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  },
  {
    geojson: {
      geometry: {
        coordinates: [
          [
            [101.19704246521, 15.0950795263559],
            [101.194038391113, 15.0953281335118],
            [101.192235946655, 15.0947480496953],
            [101.190090179443, 15.0938364862116],
            [101.188459396362, 15.0930077887413],
            [101.187858581543, 15.091764736475],
            [101.187686920166, 15.0895272240692],
            [101.188201904297, 15.088201279674],
            [101.190690994263, 15.0879526641789],
            [101.193265914917, 15.0872068159487],
            [101.195669174194, 15.08662670996],
            [101.196699142456, 15.0862952201128],
            [101.198244094849, 15.0853007474691],
            [101.199789047241, 15.0855493660662],
            [101.200733184814, 15.086460965101],
            [101.201505661011, 15.087372560226],
            [101.20210647583, 15.0896929665368],
            [101.202192306519, 15.0916818660653],
            [101.201848983765, 15.0933392681173],
            [101.198930740356, 15.0943337031422],
            [101.19704246521, 15.0950795263559],
          ],
        ],
        type: 'Polygon',
      },
      id: '304cbcd4-0850-404a-a8b1-486b02f7b84d',
      properties: {
        jurisdiction_name: 'TLv1_02',
        jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
      },
      type: 'Feature',
    },
    jurisdiction_id: '304cbcd4-0850-404a-a8b1-486b02f7b84d',
  },
];

const jurisdiction3 = clone(jurisdictions[1]);
jurisdiction3.jurisdiction_id = 'abcde';
jurisdiction3.geojson.id = 'abcde';
(jurisdiction3.geojson as any) = JSON.stringify(jurisdiction3.geojson);
export { jurisdiction3 };

export const jurisdictionsIdsArray = jurisdictions.map((e: any) => e.jurisdiction_id);
export const currentGoal = 'RACD_register_all_families';
export const nextGoal = 'Bednet Distribution';

export const CurrentReactiveTableProps = {
  columns: [
    {
      Header: 'Name',
      columns: [{}],
    },
    {
      Header: 'FI Status',
      columns: [{}],
    },
    {
      Header: 'Case Notif. Date',
      columns: [{}],
    },
    {
      Header: 'Case Class.',
      columns: [{}],
    },
  ],
  data: [],
  identifierField: 'id',
  linkerField: 'id',
  minRows: 0,
  parentIdentifierField: 'parent',
  rootParentId: null,
  showPageSizeOptions: false,
  showPagination: false,
  useDrillDownTrProps: false,
};

export const CurrentRoutineTableProps = {
  columns: [
    {
      Header: 'Name',
      columns: [{}],
    },
    {
      Header: 'FI Status',
      columns: [{}],
    },
    {
      Header: 'Province',
      columns: [{}],
    },
    {
      Header: 'District',
      columns: [{}],
    },
    {
      Header: 'Canton',
      columns: [{}],
    },
    {
      Header: 'Village',
      columns: [{}],
    },
    {
      Header: 'Focus Area',
      columns: [{}],
    },
    {
      Header: 'Status',
      columns: [{}],
    },
    {
      Header: 'Start Date',
      columns: [{}],
    },
    {
      Header: 'End Date',
      columns: [{}],
    },
    {
      Header: 'Actions',
      columns: [{}],
    },
  ],
  data: [],
  identifierField: 'id',
  linkerField: 'id',
  minRows: 0,
  parentIdentifierField: 'parent',
  rootParentId: null,
  showPageSizeOptions: false,
  showPagination: false,
  useDrillDownTrProps: false,
};

export const CompleteReactiveTableProps = {
  columns: [
    {
      Header: 'Name',
      columns: [{}],
    },
    {
      Header: 'Date Completed',
      columns: [{}],
    },
    {
      Header: 'Case Notif. Date',
      columns: [{}],
    },
    {
      Header: 'Case Class.',
      columns: [{}],
    },
  ],
  data: [],
  identifierField: 'id',
  linkerField: 'id',
  minRows: 0,
  parentIdentifierField: 'parent',
  rootParentId: null,
  showPageSizeOptions: false,
  showPagination: false,
  useDrillDownTrProps: false,
};

export const CompleteRoutineTableProps = {
  columns: [
    {
      Header: 'Name',
      columns: [{}],
    },
    {
      Header: 'Start Date',
      columns: [{}],
    },
    {
      Header: 'End Date',
      columns: [{}],
    },
    {
      Header: 'Date Completed',
      columns: [{}],
    },
  ],
  data: [],
  identifierField: 'id',
  linkerField: 'id',
  minRows: 0,
  parentIdentifierField: 'parent',
  rootParentId: null,
  showPageSizeOptions: false,
  showPagination: false,
  useDrillDownTrProps: false,
};

export const organization1: Organization = {
  active: true,
  id: 1,
  identifier: 'fcc19470-d599-11e9-bb65-2a2ae2dbcce4',
  name: 'The Luang',
  type: {
    coding: [
      {
        code: 'team',
        display: 'Team',
        system: 'http://terminology.hl7.org/CodeSystem/organization-type',
      },
    ],
  },
};

export const organization2: Organization = {
  active: true,
  id: 3,
  identifier: '4c506c98-d3a9-11e9-bb65-2a2ae2dbcce4',
  name: 'Demo Team',
};

export const organization3: Organization = {
  active: true,
  id: 2,
  identifier: 'd23f7350-d406-11e9-bb65-2a2ae2dbcce4',
  name: 'Takang 1',
  partOf: 1,
  type: {
    coding: [
      {
        code: 'team',
        display: 'Team',
        system: 'http://terminology.hl7.org/CodeSystem/organization-type',
      },
    ],
  },
};

export const organizations: Organization[] = [organization1, organization2];

export const organizationFormObject: OrganizationFormFields = {
  active: true,
  identifier: 'd23f7350-d406-11e9-bb65-2a2ae2dbcce4',
  name: 'Takang 1',
  type: {
    coding: [
      {
        code: 'team',
        display: 'Team',
        system: 'http://terminology.hl7.org/CodeSystem/organization-type',
      },
    ],
  },
};
export const createOrganizationFormObject: OrganizationFormFields = {
  active: false,
  identifier: '',
  name: 'test-01',
  type: {
    coding: [
      {
        code: 'team',
        display: 'Team',
        system: 'http://terminology.hl7.org/CodeSystem/organization-type',
      },
    ],
  },
};

export const practitioner1: Practitioner = {
  active: true,
  identifier: 'p5id',
  name: 'tlv2_name',
  userId: '8af3b7ce-e3fa-420f-8de6-e7c36e08f0bc',
  username: 'tlv2',
};
export const practitioner2: Practitioner = {
  active: true,
  identifier: 'd7c9c000-e9b3-427a-890e-49c301aa48e6',
  name: 'Biophics Tester',
  userId: '8df27310-c7ef-4bb2-b77f-3b9f4bd23713',
  username: 'tak',
};
export const practitioner3: Practitioner = {
  active: true,
  identifier: '437cc699-cfa7-414c-ba27-1668b6b517e6',
  name: 'Test User Lusaka',
  userId: 'cad04f1e-9b05-4eac-92ce-4b38aa478644',
  username: 'lusaka',
};

export const practitioner4: Practitioner = {
  active: true,
  identifier: 'healer',
  name: 'tlv2_name',
  userId: '84f3b7ce-e3fa-420f-8de6-e7c36e08f0bc',
  username: 'tlv2',
};
export const practitioner5: Practitioner = {
  active: true,
  identifier: 'master',
  name: 'Biophics Tester',
  userId: '8df26310-c7ef-4bb2-b77f-3b9f4bd23713',
  username: 'tak',
};
export const practitioner6: Practitioner = {
  active: true,
  identifier: '437cc699-cfd7-414c-ba27-1668b6b517e6',
  name: 'Test User Lusaka',
  userId: 'cad04f1e-9c05-4ebc-92ce-4b38aa478644',
  username: 'lusaka',
};

export const assignment1 = {
  fromDate: '2019-08-31T16:00:00-08:00',
  jurisdiction: 'outpost-number-one',
  organization: 'griff',
  plan: 'alpha',
  toDate: '2019-12-31T16:00:01-08:00',
};
export const assignment2 = {
  fromDate: '2019-08-31T16:00:00-08:00',
  jurisdiction: 'outpost-number-one',
  organization: 'simons',
  plan: 'alpha',
  toDate: '2019-12-31T16:00:01-08:00',
};
export const assignment3 = {
  fromDate: '2019-08-31T16:00:00-08:00',
  jurisdiction: 'blue-base',
  organization: 'tucker',
  plan: 'alpha',
  toDate: '2019-12-31T16:00:01-08:00',
};
export const assignment4 = {
  fromDate: '2019-08-31T16:00:00-08:00',
  jurisdiction: 'blue-base',
  organization: 'caboose',
  plan: 'alpha',
  toDate: '2019-12-31T16:00:01-08:00',
};
export const assignment5 = {
  fromDate: '2019-08-31T16:00:00-08:00',
  jurisdiction: 'blue-base',
  organization: 'caboose',
  plan: 'beta',
  toDate: '2019-12-31T16:00:01-08:00',
};
export const assignment6 = {
  // slightly different from 1
  fromDate: '2019-08-31T16:00:00-08:00',
  jurisdiction: 'outpost-number-one',
  organization: 'griff',
  plan: 'alpha',
  toDate: '1979-12-31T16:00:01-08:00', // different end date to simulate retirement
};
export const assignment7 = {
  // slightly different from 1
  fromDate: '2019-08-31T16:00:00-08:00',
  jurisdiction: 'outpost-number-one',
  organization: 'griff',
  plan: 'alpha',
  toDate: '2020-12-31T16:00:01-08:00', // different end date to simulate retirement
};
export const assignments = [assignment1, assignment2, assignment3, assignment4];

export const practitioners: Practitioner[] = [practitioner1, practitioner2, practitioner3];
export const org3Practitioners: Practitioner[] = [practitioner4, practitioner5, practitioner6];
export const allPractitioners = [...practitioners, ...org3Practitioners];
export const sortedPlansArray = [
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
  {
    id: '236ca3fb-1b74-5028-a0c8-ab954bb28044',
    jurisdiction_depth: 4,
    jurisdiction_id: '4550a8ab-b310-4881-8c76-1b6a817ea63a',
    jurisdiction_name: 'Tha Sen 8',
    jurisdiction_name_path: [
      'Trat 2',
      'Mueng Trat District 2',
      'Laem Klat Canton 2',
      'Laem Klat Moo 8',
    ],
    jurisdiction_parent_id: 'a14c6253-2d3d-4bcc-8c49-35f9e44c66e1',
    jurisdiction_path: [
      '61707fc2-c6ac-4112-a8d6-2a4861958396',
      '8a8e4987-95a9-4b2e-b746-3c9c3eec15c5',
      '735a94f9-6ed2-4bcd-b242-8c2b5f714bee',
      'a14c6253-2d3d-4bcc-8c49-35f9e44c66e1',
    ],
    plan_date: '2019-07-03',
    plan_effective_period_end: '2019-07-30',
    plan_effective_period_start: '2019-06-18',
    plan_fi_reason: 'Case Triggered',
    plan_fi_status: 'A1',
    plan_id: '5ad62ca5-6b9b-4c5e-bd72-c9824074c385',
    plan_intervention_type: 'FI',
    plan_name: 'A1-ThaSen8_01',
    plan_status: 'active',
    plan_title: 'A1 - Tha Sen 8- Focus 01',
    plan_version: '1',
  },
];

export const Item = 0.6;

export const JurisdictionMetadata = [
  {
    key: '79b139c-3a20-4656-b684-d2d9ed83c94e',
    value: '80',
    label: 'test1 metadata',
    description: 'Jurisdiction Metadata for test1 id 79b139c-3a20-4656-b684-d2d9ed83c94e',
    uuid: 'e56ce640-38ee-444a-9f06-a53d64a96116',
    settingsId: '33',
    settingIdentifier: 'jurisdiction_metadata-risk',
    settingMetadataId: '92',
    teamId: '',
    providerId: 'onatest',
    locationId: '',
    v1Settings: false,
    resolveSettings: false,
    documentId: 'bc15c480-0319-4711-8bfe-6e0a64b297e3',
    serverVersion: 1592833111093,
  },
  {
    key: '02ebbc84-5e29-4cd5-9b79-c594058923e9',
    value: '70',
    label: 'test2 metadata',
    description: 'Jurisdiction Metadata for test2 id 02ebbc84-5e29-4cd5-9b79-c594058923e9',
    uuid: 'fd8dfc3e-7202-4ceb-97ce-13c0b7966e61',
    settingsId: '33',
    settingIdentifier: 'jurisdiction_metadata-risk',
    settingMetadataId: '93',
    teamId: '',
    providerId: 'onatest',
    locationId: '',
    v1Settings: false,
    resolveSettings: false,
    documentId: 'bc15c480-0319-4711-8bfe-6e0a64b297e3',
    serverVersion: 1592833111093,
  },
];

export const jurisdictionsResponse = [
  {
    type: 'Feature',
    id: '2980',
    properties: {
      status: 'Active',
      parentId: '2941',
      name: 'Nyaluwiro',
      geographicLevel: 1,
      version: 0,
    },
    serverVersion: 1542961567681,
  },
  {
    type: 'Feature',
    id: '3087',
    properties: {
      status: 'Active',
      parentId: '2967',
      name: 'KSB_25',
      geographicLevel: 2,
      version: 0,
    },
    serverVersion: 1542961695762,
  },
];

export const jurisdictionsMetadataArray = [
  {
    key: '79b139c-3a20-4656-b684-d2d9ed83c94e',
    value: '80',
    label: 'test1 metadata',
    description: 'Jurisdiction Metadata for test1 id 79b139c-3a20-4656-b684-d2d9ed83c94e',
    uuid: 'e56ce640-38ee-444a-9f06-a53d64a96116',
    settingsId: '33',
    settingIdentifier: 'jurisdiction_metadata-risk',
    settingMetadataId: '92',
    teamId: '',
    providerId: 'onatest',
    locationId: '',
    v1Settings: false,
    resolveSettings: false,
    documentId: 'bc15c480-0319-4711-8bfe-6e0a64b297e3',
    serverVersion: 1592833111093,
  },
  {
    key: '02ebbc84-5e29-4cd5-9b79-c594058923e9',
    value: '70',
    label: 'test2 metadata',
    description: 'Jurisdiction Metadata for test2 id 02ebbc84-5e29-4cd5-9b79-c594058923e9',
    uuid: 'fd8dfc3e-7202-4ceb-97ce-13c0b7966e61',
    settingsId: '33',
    settingIdentifier: 'jurisdiction_metadata-risk',
    settingMetadataId: '93',
    teamId: '',
    providerId: 'onatest',
    locationId: '',
    v1Settings: false,
    resolveSettings: false,
    documentId: 'bc15c480-0319-4711-8bfe-6e0a64b297e3',
    serverVersion: 1592833111093,
  },
];

export const irsPlanDefinition1 = {
  action: [
    {
      code: 'IRS',
      description: 'Visit each structure in the operational area and attempt to spray',
      goalId: 'IRS',
      identifier: '79255d56-9190-578d-8452-fc8520f24f2b',
      prefix: 1,
      reason: 'Routine',
      subjectCodableConcept: {
        text: 'Residential_Structure',
      },
      taskTemplate: 'Spray_Structures',
      timingPeriod: {
        end: '2019-08-16',
        start: '2019-08-09',
      },
      title: 'Spray Structures',
    },
  ],
  date: '2019-08-09',
  effectivePeriod: {
    end: '2019-08-29',
    start: '2019-08-09',
  },
  goal: [
    {
      description: 'Spray structures in the operational area',
      id: 'IRS',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: 'Percent',
              value: 90,
            },
          },
          due: '2019-08-16',
          measure: 'Percent of structures sprayed',
        },
      ],
    },
  ],
  identifier: '0230f9e8-1f30-5e91-8693-4c993661785e',
  jurisdiction: [
    {
      code: '3952',
    },
  ],
  name: 'IRS-2019-08-09',
  status: 'draft',
  title: 'IRS 2019-08-09',
  useContext: [
    {
      code: 'interventionType',
      valueCodableConcept: 'IRS',
    },
    {
      code: 'taskGenerationStatus',
      valueCodableConcept: 'False',
    },
  ],
  version: '1',
};
