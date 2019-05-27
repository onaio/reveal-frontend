import { clone } from 'lodash';

export const plan1 = {
  id: 'ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f',
  jurisdiction_depth: 2,
  jurisdiction_id: '3377',
  jurisdiction_name: 'NVI_439',
  jurisdiction_name_path: ['Chadiza', 'Naviluli'],
  jurisdiction_parent_id: '2944',
  jurisdiction_path: ['2939', '2944'],
  plan_fi_reason: 'Routine',
  plan_fi_status: 'A1',
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  plan_status: 'active',
  plan_title: 'A1-Tha Luang Village 1 Focus 01',
};

export const plan2 = {
  id: 'plan-id-2',
  jurisdiction_depth: 2,
  jurisdiction_id: '3378',
  jurisdiction_name: 'TLv1_02',
  jurisdiction_name_path: ['Canton Tha Luang', 'Tha Luang Village'],
  jurisdiction_parent_id: '2977',
  jurisdiction_path: ['2989', '2977'],
  plan_fi_reason: 'Case-triggered',
  plan_fi_status: 'A1',
  plan_id: 'plan-id-2',
  plan_status: 'active',
  plan_title: 'A1-Tha Luang Village 1 Focus 01',
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
  plan_fi_reason: 'Routine',
  plan_fi_status: 'A1',
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  plan_status: 'active',
  plan_title: 'A1-Tha Luang Village 1 Focus 01',
};

export const plans = [plan1, plan2];

export const plansIdArray = [plan1.plan_id];

export const goal1 = {
  action_code: 'Case Confirmation',
  completed_task_count: 0,
  goal_comparator: '=',
  goal_id: 'Case_Confirmation',
  goal_unit: 'each',
  goal_value: 1,
  measure: 'Case confirmation complete',
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  task_count: 0,
};

export const goal2 = {
  action_code: 'Larval Dipping',
  completed_task_count: 0,
  goal_comparator: '>=',
  goal_id: 'Larval_Dipping_Min_3_Sites',
  goal_unit: 'each',
  goal_value: 3,
  measure: 'Number of larval dipping activities',
  plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
  task_count: 2,
};

export const goal3 = {
  action_code: 'Blood Screening',
  completed_task_count: 0,
  goal_comparator: '=',
  goal_id: 'RACD_blood_screening_1km_radius',
  goal_unit: 'percent',
  goal_value: 100,
  measure: 'Percent of registered people tested',
  plan_id: '1337',
  task_count: 0,
};

export const goals = [goal1, goal2, goal3];

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

const task76 = clone(task2);
task76.task_identifier = 'moshT';
task76.geojson.id = 'moshT';
(task76.geojson as any) = JSON.stringify(task76.geojson);
export { task76 };

export const tasks = [task1, task2, task3, task4];

export const taskIdsArray = [
  task1.task_identifier,
  task2.task_identifier,
  task3.task_identifier,
  task4.task_identifier,
];

export const jurisdictions = [
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
      id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
      properties: {
        jurisdiction_name: 'TLv1_01',
        jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
      },
      type: 'Feature',
    },
    jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
  },
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
];

const jurisdiction3 = clone(jurisdictions[1]);
jurisdiction3.jurisdiction_id = 'abcde';
jurisdiction3.geojson.id = 'abcde';
(jurisdiction3.geojson as any) = JSON.stringify(jurisdiction3.geojson);
export { jurisdiction3 };

export const jurisdictionsIdsArray = jurisdictions.map((e: any) => e.jurisdiction_id);
