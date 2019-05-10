export const plans = [
  {
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
  },
];

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

export const goalsByPlanId = {
  '10f9e9fa-ce34-4b27-a961-72fab5206ab6': [goal1, goal2],
  '1337': [goal3],
};
