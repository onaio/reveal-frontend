import { Dictionary } from '@onaio/utils';
import { parseISO } from 'date-fns';
import moment from 'moment';
import { FormEvent } from 'react';
import { DEFAULT_ACTIVITY_DURATION_DAYS, DEFAULT_TIME } from '../../../../configs/env';
import {
  planActivities as planActivitiesFromConfig,
  PlanActivity,
} from '../../../../configs/settings';
import { InterventionType, PlanStatus } from '../../../../store/ducks/plans';
import { PlanActivityFormFields, PlanFormFields } from '../types';
import { GoalUnit } from '../types';

const goalDue = moment()
  .add(DEFAULT_ACTIVITY_DURATION_DAYS, 'days')
  .toDate();
goalDue.setMilliseconds(0);

const timingPeriodEnd = moment()
  .add(DEFAULT_ACTIVITY_DURATION_DAYS, 'days')
  .toDate();
timingPeriodEnd.setMilliseconds(0);

const timingPeriodStart = moment().toDate();
timingPeriodStart.setMilliseconds(0);

export const expectedActivity: Dictionary = {};
export const planActivityWithEmptyfields: Dictionary = {};

const processActivity = (activityObj: PlanActivity) => {
  return {
    ...(activityObj.action.condition && {
      condition: activityObj.action.condition.map(item => {
        return {
          description: item.expression.description || '',
          expression: item.expression.expression || '',
        };
      }),
    }),
    ...(activityObj.action.trigger && {
      trigger: activityObj.action.trigger.map(item => {
        return {
          ...(item.expression && {
            description: item.expression.description || '',
            expression: item.expression.expression,
          }),
          name: item.name,
        };
      }),
    }),
    actionCode: activityObj.action.code,
    actionDefinitionUri: activityObj.action.definitionUri || '',
    actionDescription: activityObj.action.description || '',
    actionIdentifier: activityObj.action.identifier || '',
    actionReason: activityObj.action.reason || '',
    actionTitle: activityObj.action.title || '',
    goalDescription: activityObj.goal.description || '',
    goalDue,
    goalPriority: 'medium-priority',
    goalValue: activityObj.goal.target[0].detail.detailQuantity.value,
    timingPeriodEnd,
    timingPeriodStart,
  };
};

for (const [key, activityObj] of Object.entries(planActivitiesFromConfig)) {
  // build expectedActivity
  expectedActivity[key] = processActivity(activityObj);

  // build planActivityWithEmptyfields
  planActivityWithEmptyfields[key] = {
    ...activityObj,
    action: {
      ...activityObj.action,
      description: '',
      identifier: '',
    },
    goal: {
      ...activityObj.goal,
      description: '',
    },
  };
}

export const expectedActivityEmptyField: Dictionary = {};
for (const [key, activityObj] of Object.entries(expectedActivity)) {
  expectedActivityEmptyField[key] = {
    ...activityObj,
    actionDescription: '',
    actionIdentifier: '',
    goalDescription: '',
  };
}

export const extractedActivitiesFromForms = Object.values(planActivitiesFromConfig)
  .sort((a, b) => a.action.prefix - b.action.prefix)
  .map(e => {
    return processActivity(e);
  });

export const planActivities: Dictionary = {};
for (const [key, activityObj] of Object.entries(planActivitiesFromConfig)) {
  planActivities[key] = {
    ...activityObj,
    action: {
      ...activityObj.action,
      timingPeriod: {
        end: timingPeriodEnd.toISOString(),
        start: timingPeriodStart.toISOString(),
      },
    },
    goal: {
      ...activityObj.goal,
      target: activityObj.goal.target.map(e => {
        return {
          ...e,
          due: goalDue.toISOString(),
        };
      }),
    },
  };
}

export const planActivityWithoutTargets: Dictionary = {};
for (const [key, activity] of Object.entries(planActivities)) {
  planActivityWithoutTargets[key] = {
    ...activity,
    goal: {
      description: activity.goal.description,
      id: activity.goal.id,
      priority: activity.goal.priority,
    },
  };
}

export const activities: PlanActivityFormFields[] = [
  {
    actionCode: 'Case Confirmation',
    actionDescription: 'Confirm the index case',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Case Confirmation',
    goalDescription: 'Confirm the index case',
    goalDue: parseISO('2019-08-16T08:39:42.773Z'),
    goalPriority: 'medium-priority',
    goalValue: 1,
    timingPeriodEnd: parseISO('2019-08-16T08:39:42.773Z'),
    timingPeriodStart: parseISO('2019-08-09T08:39:42.773Z'),
  },
  {
    actionCode: 'RACD Register Family',
    actionDescription:
      'Register all families & family members in all residential structures enumerated (100%) within the operational area',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Family Registration',
    goalDescription:
      'Register all families & family members in all residential structures enumerated (100%) within the operational area',
    goalDue: parseISO('2019-08-16T08:39:42.773Z'),
    goalPriority: 'medium-priority',
    goalValue: 100,
    timingPeriodEnd: parseISO('2019-08-16T08:39:42.773Z'),
    timingPeriodStart: parseISO('2019-08-09T08:39:42.774Z'),
  },
  {
    actionCode: 'Blood Screening',
    actionDescription:
      'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Blood screening',
    goalDescription:
      'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
    goalDue: parseISO('2019-08-16T08:39:42.774Z'),
    goalPriority: 'medium-priority',
    goalValue: 100,
    timingPeriodEnd: parseISO('2019-08-16T08:39:42.775Z'),
    timingPeriodStart: parseISO('2019-08-09T08:39:42.775Z'),
  },
  {
    actionCode: 'Bednet Distribution',
    actionDescription:
      'Visit 100% of residential structures in the operational area and provide nets',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Bednet Distribution',
    goalDescription:
      'Visit 100% of residential structures in the operational area and provide nets',
    goalDue: parseISO('2019-08-16T08:39:42.775Z'),
    goalPriority: 'medium-priority',
    goalValue: 100,
    timingPeriodEnd: parseISO('2019-08-16T08:39:42.775Z'),
    timingPeriodStart: parseISO('2019-08-09T08:39:42.775Z'),
  },
  {
    actionCode: 'Larval Dipping',
    actionDescription:
      'Perform a minimum of three larval dipping activities in the operational area',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Larval Dipping',
    goalDescription: 'Perform a minimum of three larval dipping activities in the operational area',
    goalDue: parseISO('2019-08-16T08:39:42.775Z'),
    goalPriority: 'medium-priority',
    goalValue: 3,
    timingPeriodEnd: parseISO('2019-08-16T08:39:42.776Z'),
    timingPeriodStart: parseISO('2019-08-09T08:39:42.776Z'),
  },
  {
    actionCode: 'Mosquito Collection',
    actionDescription:
      'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Mosquito Collection',
    goalDescription:
      'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
    goalDue: parseISO('2019-08-16T08:39:42.776Z'),
    goalPriority: 'medium-priority',
    goalValue: 3,
    timingPeriodEnd: parseISO('2019-08-16T08:39:42.776Z'),
    timingPeriodStart: parseISO('2019-08-09T08:39:42.776Z'),
  },
  {
    actionCode: 'BCC',
    actionDescription: 'Conduct BCC activity',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Behaviour Change Communication',
    goalDescription: 'Complete at least 1 BCC activity for the operational area',
    goalDue: parseISO('2019-08-16T08:39:42.778Z'),
    goalPriority: 'medium-priority',
    goalValue: 1,
    timingPeriodEnd: parseISO('2019-08-16T08:39:42.778Z'),
    timingPeriodStart: parseISO('2019-08-09T08:39:42.778Z'),
  },
];

export const expectedExtractActivityFromPlanformResult = {
  action: [
    {
      code: 'Case Confirmation',
      description: 'Confirm the index case',
      goalId: 'Case_Confirmation',
      identifier: '5728cbf8-0e95-5b1b-863a-d03769a785c9',
      prefix: 1,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Jurisdiction',
      },
      taskTemplate: 'Case_Confirmation',
      timingPeriod: {
        end: '2019-08-16',
        start: '2019-08-09',
      },
      title: 'Case Confirmation',
    },
    {
      code: 'RACD Register Family',
      description:
        'Register all families & family members in all residential structures enumerated (100%) within the operational area',
      goalId: 'RACD_register_families',
      identifier: '541258e7-4bd0-5699-89ba-7e832e5452b3',
      prefix: 2,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'RACD_register_families',
      timingPeriod: {
        end: '2019-08-16',
        start: '2019-08-09',
      },
      title: 'Family Registration',
    },
    {
      code: 'Blood Screening',
      description:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      goalId: 'RACD_Blood_Screening',
      identifier: 'a73a487d-b93a-5a06-84eb-19ccf9785045',
      prefix: 3,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Person',
      },
      taskTemplate: 'RACD_Blood_Screening',
      timingPeriod: {
        end: '2019-08-16',
        start: '2019-08-09',
      },
      title: 'Blood screening',
    },
    {
      code: 'Bednet Distribution',
      description: 'Visit 100% of residential structures in the operational area and provide nets',
      goalId: 'RACD_bednet_distribution',
      identifier: '2439129c-3d1f-5d16-99b0-a0f02db4dd83',
      prefix: 4,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'Bednet_Distribution',
      timingPeriod: {
        end: '2019-08-16',
        start: '2019-08-09',
      },
      title: 'Bednet Distribution',
    },
    {
      code: 'Larval Dipping',
      description: 'Perform a minimum of three larval dipping activities in the operational area',
      goalId: 'Larval_Dipping',
      identifier: 'c1054dec-2c11-5cf8-83fe-c31b1f5de660',
      prefix: 5,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'Larval_Dipping',
      timingPeriod: {
        end: '2019-08-16',
        start: '2019-08-09',
      },
      title: 'Larval Dipping',
    },
    {
      code: 'Mosquito Collection',
      description:
        'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
      goalId: 'Mosquito_Collection',
      identifier: '28633053-4c6a-5332-8f6e-fa26d5ccb2f6',
      prefix: 6,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'Mosquito_Collection_Point',
      timingPeriod: {
        end: '2019-08-16',
        start: '2019-08-09',
      },
      title: 'Mosquito Collection',
    },
    {
      code: 'BCC',
      description: 'Conduct BCC activity',
      goalId: 'BCC_Focus',
      identifier: '089522a3-bd02-5de3-b2d5-95234b1a5d01',
      prefix: 7,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Jurisdiction',
      },
      taskTemplate: 'BCC_Focus',
      timingPeriod: {
        end: '2019-08-16',
        start: '2019-08-09',
      },
      title: 'Behaviour Change Communication',
    },
  ],
  goal: [
    {
      description: 'Confirm the index case',
      id: 'Case_Confirmation',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.CASE,
              value: 1,
            },
          },
          due: '2019-08-16',
          measure: 'Number of cases confirmed',
        },
      ],
    },
    {
      description:
        'Register all families & family members in all residential structures enumerated (100%) within the operational area',
      id: 'RACD_register_families',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '2019-08-16',
          measure: 'Percent of residential structures with full family registration',
        },
      ],
    },
    {
      description:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      id: 'RACD_Blood_Screening',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERSON,
              value: 100,
            },
          },
          due: '2019-08-16',
          measure: 'Number of registered people tested',
        },
      ],
    },
    {
      description: 'Visit 100% of residential structures in the operational area and provide nets',
      id: 'RACD_bednet_distribution',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '2019-08-16',
          measure: 'Percent of residential structures received nets',
        },
      ],
    },
    {
      description: 'Perform a minimum of three larval dipping activities in the operational area',
      id: 'Larval_Dipping',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 3,
            },
          },
          due: '2019-08-16',
          measure: 'Number of larval dipping activities completed',
        },
      ],
    },
    {
      description:
        'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
      id: 'Mosquito_Collection',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 3,
            },
          },
          due: '2019-08-16',
          measure: 'Number of mosquito collection activities completed',
        },
      ],
    },
    {
      description: 'Complete at least 1 BCC activity for the operational area',
      id: 'BCC_Focus',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 1,
            },
          },
          due: '2019-08-16',
          measure: 'BCC Activities Completed',
        },
      ],
    },
  ],
};

export const values: PlanFormFields = {
  activities: [
    {
      actionCode: 'IRS',
      actionDescription: 'Visit each structure in the operational area and attempt to spray',
      actionIdentifier: '',
      actionReason: 'Routine',
      actionTitle: 'Spray Structures',
      goalDescription: 'Spray structures in the operational area',
      goalDue: parseISO('2019-08-16T11:33:50.997Z'),
      goalPriority: 'medium-priority',
      goalValue: 90,
      timingPeriodEnd: parseISO('2019-08-16T11:33:50.997Z'),
      timingPeriodStart: parseISO('2019-08-09T11:33:50.997Z'),
    },
  ],
  caseNum: '',
  date: parseISO('2019-08-09T11:33:20.156Z'),
  end: parseISO('2019-08-29T11:33:20.156Z'),
  fiStatus: 'A1',
  identifier: '',
  interventionType: InterventionType.IRS,
  jurisdictions: [
    {
      id: '',
      name: '',
    },
  ],
  name: 'IRS-2019-08-09',
  start: parseISO('2019-08-09T11:33:20.156Z'),
  status: PlanStatus.DRAFT,
  taskGenerationStatus: 'True',
  title: 'IRS 2019-08-09',
  version: '1',
};

export const valuesWithJurisdiction: PlanFormFields = {
  activities: [
    {
      actionCode: 'IRS',
      actionDescription: 'Visit each structure in the operational area and attempt to spray',
      actionIdentifier: '',
      actionReason: 'Routine',
      actionTitle: 'Spray Structures',
      goalDescription: 'Spray structures in the operational area',
      goalDue: parseISO('2019-08-16T11:33:50.997Z'),
      goalPriority: 'medium-priority',
      goalValue: 90,
      timingPeriodEnd: parseISO('2019-08-16T11:33:50.997Z'),
      timingPeriodStart: parseISO('2019-08-09T11:33:50.997Z'),
    },
  ],
  caseNum: '',
  date: parseISO('2019-08-09T11:33:20.156Z'),
  end: parseISO('2019-08-29T11:33:20.156Z'),
  fiStatus: 'A1',
  identifier: '',
  interventionType: InterventionType.IRS,
  jurisdictions: [
    {
      id: 'd6396aeb-436d-4b78-91bd-7387ec2e8d5c',
      name: 'TLv2_01',
    },
  ],
  name: 'IRS-2019-08-09',
  start: parseISO('2019-08-09T11:33:20.156Z'),
  status: PlanStatus.DRAFT,
  taskGenerationStatus: 'False',
  title: 'IRS 2019-08-09',
  version: '1',
};

export const event: FormEvent = {
  bubbles: false,
  cancelable: false,
  currentTarget: {} as EventTarget & Element,
  defaultPrevented: false,
  eventPhase: 0,
  isDefaultPrevented: () => false,
  isPropagationStopped: () => false,
  isTrusted: true,
  nativeEvent: {} as Event,
  persist: () => null,
  preventDefault: () => null,
  stopPropagation: () => null,
  target: {
    addEventListener: () => false,
    dispatchEvent: () => false,
    name: 'interventionType',
    removeEventListener: () => false,
    value: 'FI',
  } as EventTarget,
  timeStamp: 0,
  type: '',
};

export const event2: FormEvent = {
  bubbles: false,
  cancelable: false,
  currentTarget: {} as EventTarget & Element,
  defaultPrevented: false,
  eventPhase: 0,
  isDefaultPrevented: () => false,
  isPropagationStopped: () => false,
  isTrusted: true,
  nativeEvent: {} as Event,
  persist: () => null,
  preventDefault: () => null,
  stopPropagation: () => null,
  target: {
    addEventListener: () => false,
    dispatchEvent: () => false,
    name: 'interventionType',
    removeEventListener: () => false,
    value: 'IRS',
  } as EventTarget,
  timeStamp: 0,
  type: '',
};

export const event3: FormEvent = {
  bubbles: false,
  cancelable: false,
  currentTarget: {} as EventTarget & Element,
  defaultPrevented: false,
  eventPhase: 0,
  isDefaultPrevented: () => false,
  isPropagationStopped: () => false,
  isTrusted: true,
  nativeEvent: {} as Event,
  persist: () => null,
  preventDefault: () => null,
  stopPropagation: () => null,
  target: {
    addEventListener: () => null,
    dispatchEvent: () => false,
    removeEventListener: () => null,
  } as EventTarget,
  timeStamp: 0,
  type: '',
};

export const expectedPlanDefinition = {
  action: [
    {
      code: 'IRS',
      description: 'Visit each structure in the operational area and attempt to spray',
      goalId: 'IRS',
      identifier: '79255d56-9190-578d-8452-fc8520f24f2b',
      prefix: 1,
      reason: 'Routine',
      subjectCodableConcept: {
        text: 'Location',
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
  experimental: false,
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
              unit: GoalUnit.PERCENT,
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

export const values2: PlanFormFields = {
  activities: [
    {
      actionCode: 'IRS',
      actionDescription: 'Visit each structure in the operational area and attempt to spray',
      actionIdentifier: '',
      actionReason: 'Routine',
      actionTitle: 'Spray Structures',
      goalDescription: 'Spray structures in the operational area',
      goalDue: parseISO(`2019-08-16${DEFAULT_TIME}`),
      goalPriority: 'medium-priority',
      goalValue: 90,
      timingPeriodEnd: parseISO(`2019-08-16${DEFAULT_TIME}`),
      timingPeriodStart: parseISO(`2019-08-09${DEFAULT_TIME}`),
    },
  ],
  caseNum: '',
  date: parseISO(`2019-08-09${DEFAULT_TIME}`),
  end: parseISO(`2019-08-29${DEFAULT_TIME}`),
  identifier: '',
  interventionType: InterventionType.IRS,
  jurisdictions: [
    {
      id: '3952',
      name: 'Akros_2',
    },
  ],
  name: 'IRS-2019-08-09',
  start: parseISO(`2019-08-09${DEFAULT_TIME}`),
  status: PlanStatus.DRAFT,
  taskGenerationStatus: 'False',
  title: 'IRS 2019-08-09',
  version: '1',
};

export const planFormValues = {
  activities: [
    {
      actionCode: 'IRS',
      actionDescription: 'Visit each structure in the operational area and attempt to spray',
      actionIdentifier: 'ce6f39db-505a-5d44-b70d-c92a73be6c15',
      actionReason: 'Routine',
      actionTitle: 'Spray Structures',
      goalDescription: 'Spray structures in the operational area',
      goalDue: parseISO(`2019-08-16${DEFAULT_TIME}`),
      goalPriority: 'medium-priority',
      goalValue: 90,
      timingPeriodEnd: parseISO(`2019-08-16${DEFAULT_TIME}`),
      timingPeriodStart: parseISO(`2019-08-09${DEFAULT_TIME}`),
    },
  ],
  caseNum: '',
  date: parseISO(`2019-08-09${DEFAULT_TIME}`),
  end: parseISO(`2019-08-29${DEFAULT_TIME}`),
  fiReason: undefined,
  fiStatus: undefined,
  identifier: 'afbfc83d-c7a2-5293-9db5-081781235c60',
  interventionType: 'IRS',
  jurisdictions: [
    {
      id: '3952',
      name: 'Akros_2',
    },
  ],
  name: 'IRS-2019-08-09',
  opensrpEventId: undefined,
  start: parseISO(`2019-08-09${DEFAULT_TIME}`),
  status: 'draft',
  taskGenerationStatus: 'False',
  title: 'IRS 2019-08-09',
  version: '1',
};

export const planFormValues2 = {
  activities: [
    {
      actionCode: 'Case Confirmation',
      actionDefinitionUri: '',
      actionDescription: 'Confirm the index case',
      actionIdentifier: 'c711ae51-6432-4b68-84c3-d2b5b1fd1948',
      actionReason: 'Investigation',
      actionTitle: 'Case Confirmation',
      goalDescription: 'Confirm the index case',
      goalDue: moment('2019-05-21T00:00:00.000Z').toDate(),
      goalPriority: 'medium-priority',
      goalValue: 1,
      timingPeriodEnd: moment('2019-05-24T00:00:00.000Z').toDate(),
      timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
    },
    {
      actionCode: 'RACD Register Family',
      actionDefinitionUri: '',
      actionDescription:
        'Register all families & famiy members in all residential structures enumerated (100%) within the operational area',
      actionIdentifier: '402b8c13-6774-4515-929f-48e71a61a379',
      actionReason: 'Investigation',
      actionTitle: 'Family Registration',
      goalDescription:
        'Register all families and family members in all residential structures enumerated or added (100%) within operational area',
      goalDue: moment('2019-08-30T00:00:00.000Z').toDate(),
      goalPriority: 'medium-priority',
      goalValue: 100,
      timingPeriodEnd: moment('2019-08-30T00:00:00.000Z').toDate(),
      timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
    },
    {
      actionCode: 'Bednet Distribution',
      actionDefinitionUri: '',
      actionDescription:
        'Visit 100% of residential structures in the operational area and provide nets',
      actionIdentifier: '1bd830ea-50e3-44dc-b855-9d5e9339e2be',
      actionReason: 'Routine',
      actionTitle: 'Bednet Distribution',
      goalDescription:
        'Visit 100% of residential structures in the operational area and provide nets',
      goalDue: moment('2019-08-30T00:00:00.000Z').toDate(),
      goalPriority: 'medium-priority',
      goalValue: 100,
      timingPeriodEnd: moment('2019-08-30T00:00:00.000Z').toDate(),
      timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
    },
    {
      actionCode: 'Blood Screening',
      actionDefinitionUri: '',
      actionDescription:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      actionIdentifier: '2303a70e-4e3f-4fb9-a430-f0476010bfb5',
      actionReason: 'Investigation',
      actionTitle: 'RACD Blood screening',
      goalDescription:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      goalDue: moment('2019-05-28T00:00:00.000Z').toDate(),
      goalPriority: 'medium-priority',
      goalValue: 100,
      timingPeriodEnd: moment('2019-05-28T00:00:00.000Z').toDate(),
      timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
    },
    {
      actionCode: 'Larval Dipping',
      actionDefinitionUri: '',
      actionDescription:
        'Perform a minimum of three larval dipping activities in the operational area',
      actionIdentifier: '2482dfd7-8284-43c6-bea1-a03dcda71ff4',
      actionReason: 'Investigation',
      actionTitle: 'Larval Dipping',
      goalDescription:
        'Perform a minimum of three larval dipping activities in the operational area',
      goalDue: moment('2019-05-28T00:00:00.000Z').toDate(),
      goalPriority: 'medium-priority',
      goalValue: 3,
      timingPeriodEnd: moment('2019-05-28T00:00:00.000Z').toDate(),
      timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
    },
    {
      actionCode: 'Mosquito Collection',
      actionDefinitionUri: '',
      actionDescription:
        'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
      actionIdentifier: '423f6665-5367-40be-855e-7c5e6941a0c3',
      actionReason: 'Investigation',
      actionTitle: 'Mosquito Collection',
      goalDescription:
        'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
      goalDue: moment('2019-05-28T00:00:00.000Z').toDate(),
      goalPriority: 'medium-priority',
      goalValue: 3,
      timingPeriodEnd: moment('2019-05-28T00:00:00.000Z').toDate(),
      timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
    },
    {
      actionCode: 'BCC',
      actionDefinitionUri: '',
      actionDescription: 'Conduct BCC activity',
      actionIdentifier: 'c8fc89a9-cdd2-4746-8272-650883ae380e',
      actionReason: 'Investigation',
      actionTitle: 'Behaviour Change Communication',
      goalDescription: 'Complete at least 1 BCC activity for the operational area',
      goalDue: moment('2019-06-21T00:00:00.000Z').toDate(),
      goalPriority: 'medium-priority',
      goalValue: 1,
      timingPeriodEnd: moment('2019-06-21T00:00:00.000Z').toDate(),
      timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
    },
  ],
  caseNum: '',
  date: moment('2019-05-19T00:00:00.000Z').toDate(),
  end: moment('2019-08-30T00:00:00.000Z').toDate(),
  fiReason: 'Routine',
  fiStatus: 'A2',
  identifier: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
  interventionType: 'FI',
  jurisdictions: [{ id: '3952', name: '3952' }],
  name: 'A2-Lusaka_Akros_Focus_2',
  opensrpEventId: undefined,
  start: moment('2019-05-20T00:00:00.000Z').toDate(),
  status: 'active',
  taskGenerationStatus: 'False',
  title: 'A2-Lusaka Akros Test Focus 2',
  version: '1',
};

export const planFormValues3 = {
  activities: [
    {
      actionCode: 'IRS',
      actionDescription: 'Visit each structure in the operational area and attempt to spray',
      actionIdentifier: 'b646cfe1-7180-4494-80b5-ee20579dc343',
      actionReason: 'Routine',
      actionTitle: 'Spray Structures',
      condition: [
        {
          description: 'Structure is residential',
          expression:
            "$this.is(FHIR.QuestionnaireResponse) or $this.type.where(id='locationType').text = 'Residential Structure'",
        },
        {
          description: 'Register structure Event submitted for a residential structure',
          expression:
            "$this.is(FHIR.Location) or (questionnaire = 'Register_Structure' and item.where(linkId='structureType').answer.value ='Residential Structure')",
        },
      ],
      goalDescription: 'Spray structures in the operational area',
      goalDue: moment('2020-12-31T00:00:00.000Z').toDate(),
      goalPriority: 'medium-priority',
      goalValue: 90,
      timingPeriodEnd: moment('2020-12-31T00:00:00.000Z').toDate(),
      timingPeriodStart: moment('2020-06-24T00:00:00.000Z').toDate(),
      trigger: [
        { name: 'plan-activation' },
        {
          description: '',
          expression: "questionnaire = 'Register_Structure'",
          name: 'event-submission',
        },
      ],
    },
  ],
  caseNum: '',
  date: moment('2020-06-24T00:00:00.000Z').toDate(),
  end: moment('2020-12-31T00:00:00.000Z').toDate(),
  fiReason: undefined,
  fiStatus: undefined,
  identifier: '043fc8cb-0459-4b39-b71c-abc15f13a5dd',
  interventionType: InterventionType.DynamicIRS,
  jurisdictions: [
    { id: '6fffaf7f-f16f-4713-a1ac-0cf6e2fe7f2a', name: '6fffaf7f-f16f-4713-a1ac-0cf6e2fe7f2a' },
  ],
  name: 'IRS-2020-06-24-Dynamic-Task-Test-Plan',
  opensrpEventId: undefined,
  start: moment('2020-06-24T00:00:00.000Z').toDate(),
  status: PlanStatus.ACTIVE,
  taskGenerationStatus: 'Disabled',
  title: 'IRS 2020-06-24 Dynamic Task Test Plan',
  version: '1',
};

export const jurisdictionLevel0JSON =
  '[{"type":"Feature","id":"2942","properties":{"status":"Active","name":"Lusaka","geographicLevel":0,"version":0},"serverVersion":1545204913827},{"type":"Feature","id":"f8863022-ff88-4c22-b2d1-83f59f31b874","properties":{"status":"Active","name":"Oddar Meanchey Province","geographicLevel":0,"version":0},"serverVersion":1553900609745},{"type":"Feature","id":"9c3c2db4-bddd-44c5-870a-a0eef539e4da","properties":{"status":"Active","name":"Lop Buri","geographicLevel":0,"version":0},"serverVersion":1554861473099},{"type":"Feature","id":"3953","properties":{"status":"Active","name":"Siavonga","geographicLevel":0,"version":0},"serverVersion":1549235783958},{"type":"Feature","id":"3954","properties":{"status":"Active","name":"Siavonga","geographicLevel":0,"version":0},"serverVersion":1549387863860},{"type":"Feature","id":"2940","properties":{"status":"Active","name":"Katete","geographicLevel":0,"version":0},"serverVersion":1545218425249},{"type":"Feature","id":"2941","properties":{"status":"Active","name":"Sinda","geographicLevel":0,"version":0},"serverVersion":1545219282280},{"type":"Feature","id":"2939","properties":{"status":"Active","name":"Chadiza","geographicLevel":0,"version":0},"serverVersion":1545217996275},{"type":"Feature","id":"16a77bba-8777-4bc4-8566-d193cb04af4c","properties":{"status":"Active","name":"Botswana","geographicLevel":0,"version":0},"serverVersion":1563583239021},{"type":"Feature","id":"f45b9380-c970-4dd1-8533-9e95ab12f128","properties":{"status":"Active","name":"Namibia","geographicLevel":0,"version":0,"ADM0_EN":"Namibia","ADM0_PCODE":"NA"},"serverVersion":1564401702479}]';

export const jurisdictionParen1JSON =
  '[{"type":"Feature","id":"3019","properties":{"status":"Active","parentId":"2942","name":"Mtendere","geographicLevel":1,"version":0},"serverVersion":1545204913828}]';

export const jurisdictionFocusAreasJSON =
  '[{"type":"Feature","id":"1337","properties":{"status":"Active","parentId":"3019","name":"REVEAL TEST","geographicLevel":2,"version":0},"serverVersion":1548770400099},{"type":"Feature","id":"3951","properties":{"status":"Active","parentId":"3019","name":"Akros_1","geographicLevel":2,"version":0},"serverVersion":1545204913829},{"type":"Feature","id":"3952","properties":{"status":"Active","parentId":"3019","name":"Akros_2","geographicLevel":2,"version":0},"serverVersion":1545204913830}]';
