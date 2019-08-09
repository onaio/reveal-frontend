import moment from 'moment';
import { DEFAULT_ACTIVITY_DURATION_DAYS } from '../../../../configs/env';
import { PlanActivities } from '../../../../configs/settings';

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

export const bccTestPlanActivity = {
  BCC: {
    action: {
      code: 'BCC',
      description: 'Conduct BCC activity',
      goalId: 'BCC_Focus',
      identifier: '',
      prefix: 99,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Operational_Area',
      },
      taskTemplate: 'BCC_Focus',
      timingPeriod: {
        end: timingPeriodEnd,
        start: timingPeriodStart,
      },
      title: 'Behaviour Change Communication',
    },
    goal: {
      description: 'Complete at least 1 BCC activity for the operational area',
      id: 'BCC_Focus',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: 'activit(y|ies)',
              value: 1,
            },
          },
          due: goalDue,
          measure: 'Number of BCC Activities Completed',
        },
      ],
    },
  },
};

export const expectedActivity = {
  actionCode: 'BCC',
  actionDescription: 'Conduct BCC activity',
  actionIdentifier: '',
  actionReason: 'Investigation',
  actionTitle: 'Behaviour Change Communication',
  goalDescription: 'Complete at least 1 BCC activity for the operational area',
  goalDue,
  goalPriority: 'medium-priority',
  goalValue: 1,
  timingPeriodEnd,
  timingPeriodStart,
};

export const bccTestPlanActivityWithEmptyfields = {
  BCC: {
    action: {
      goalId: 'BCC_Focus',
      prefix: 99,
      subjectCodableConcept: {
        text: 'Operational_Area',
      },
      taskTemplate: 'BCC_Focus',
      timingPeriod: {
        end: timingPeriodEnd,
        start: timingPeriodStart,
      },
    },
    goal: {
      id: 'BCC_Focus',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: 'activit(y|ies)',
              value: 1,
            },
          },
          due: goalDue,
          measure: 'Number of BCC Activities Completed',
        },
      ],
    },
  },
};

export const expectedActivity2 = {
  actionDescription: '',
  actionIdentifier: '',
  actionReason: '',
  actionTitle: '',
  goalDescription: '',
  goalDue,
  goalPriority: 'medium-priority',
  goalValue: 1,
  timingPeriodEnd,
  timingPeriodStart,
};

export const extractedActivitiesFromForms = [
  {
    actionCode: 'Case Confirmation',
    actionDescription: 'Confirm the index case',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Case Confirmation',
    goalDescription: 'Confirm the index case',
    goalDue: goalDue.toISOString(),
    goalPriority: 'medium-priority',
    goalValue: 1,
    timingPeriodEnd: timingPeriodEnd.toISOString(),
    timingPeriodStart: timingPeriodStart.toISOString(),
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
    goalDue: goalDue.toISOString(),
    goalPriority: 'medium-priority',
    goalValue: 100,
    timingPeriodEnd: timingPeriodEnd.toISOString(),
    timingPeriodStart: timingPeriodStart.toISOString(),
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
    goalDue: goalDue.toISOString(),
    goalPriority: 'medium-priority',
    goalValue: 100,
    timingPeriodEnd: timingPeriodEnd.toISOString(),
    timingPeriodStart: timingPeriodStart.toISOString(),
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
    goalDue: goalDue.toISOString(),
    goalPriority: 'medium-priority',
    goalValue: 100,
    timingPeriodEnd: timingPeriodEnd.toISOString(),
    timingPeriodStart: timingPeriodStart.toISOString(),
  },
  {
    actionCode: 'Larval Dipping',
    actionDescription:
      'Perform a minimum of three larval dipping activities in the operational area',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Larval Dipping',
    goalDescription: 'Perform a minimum of three larval dipping activities in the operational area',
    goalDue: goalDue.toISOString(),
    goalPriority: 'medium-priority',
    goalValue: 3,
    timingPeriodEnd: timingPeriodEnd.toISOString(),
    timingPeriodStart: timingPeriodStart.toISOString(),
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
    goalDue: goalDue.toISOString(),
    goalPriority: 'medium-priority',
    goalValue: 3,
    timingPeriodEnd: timingPeriodEnd.toISOString(),
    timingPeriodStart: timingPeriodStart.toISOString(),
  },
  {
    actionCode: 'IRS',
    actionDescription: 'Visit each structure in the operational area and attempt to spray',
    actionIdentifier: '',
    actionReason: 'Routine',
    actionTitle: 'Spray Structures',
    goalDescription: 'Spray structures in the operational area',
    goalDue: goalDue.toISOString(),
    goalPriority: 'medium-priority',
    goalValue: 90,
    timingPeriodEnd: timingPeriodEnd.toISOString(),
    timingPeriodStart: timingPeriodStart.toISOString(),
  },
  {
    actionCode: 'BCC',
    actionDescription: 'Conduct BCC activity',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Behaviour Change Communication',
    goalDescription: 'Complete at least 1 BCC activity for the operational area',
    goalDue: goalDue.toISOString(),
    goalPriority: 'medium-priority',
    goalValue: 1,
    timingPeriodEnd: timingPeriodEnd.toISOString(),
    timingPeriodStart: timingPeriodStart.toISOString(),
  },
];

export const planActivities: PlanActivities = {
  BCC: {
    action: {
      code: 'BCC',
      description: 'Conduct BCC activity',
      goalId: 'BCC_Focus',
      identifier: '',
      prefix: 99,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Operational_Area',
      },
      taskTemplate: 'BCC_Focus',
      timingPeriod: {
        end: timingPeriodEnd.toString(),
        start: timingPeriodStart.toString(),
      },
      title: 'Behaviour Change Communication',
    },
    goal: {
      description: 'Complete at least 1 BCC activity for the operational area',
      id: 'BCC_Focus',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: 'activit(y|ies)',
              value: 1,
            },
          },
          due: goalDue.toString(),
          measure: 'Number of BCC Activities Completed',
        },
      ],
    },
  },
  IRS: {
    action: {
      code: 'IRS',
      description: 'Visit each structure in the operational area and attempt to spray',
      goalId: 'IRS',
      identifier: '',
      prefix: 7,
      reason: 'Routine',
      subjectCodableConcept: {
        text: 'Residential_Structure',
      },
      taskTemplate: 'Spray_Structures',
      timingPeriod: {
        end: timingPeriodEnd.toString(),
        start: timingPeriodStart.toString(),
      },
      title: 'Spray Structures',
    },
    goal: {
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
          due: goalDue.toString(),
          measure: 'Percent of structures sprayed',
        },
      ],
    },
  },
  bednetDistribution: {
    action: {
      code: 'Bednet Distribution',
      description: 'Visit 100% of residential structures in the operational area and provide nets',
      goalId: 'RACD_bednet_distribution',
      identifier: '',
      prefix: 4,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Residential_Structure',
      },
      taskTemplate: 'Bednet_Distribution',
      timingPeriod: {
        end: timingPeriodEnd.toString(),
        start: timingPeriodStart.toString(),
      },
      title: 'Bednet Distribution',
    },
    goal: {
      description: 'Visit 100% of residential structures in the operational area and provide nets',
      id: 'RACD_bednet_distribution',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: 'Percent',
              value: 100,
            },
          },
          due: goalDue.toString(),
          measure: 'Percent of residential structures received nets',
        },
      ],
    },
  },
  bloodScreening: {
    action: {
      code: 'Blood Screening',
      description:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      goalId: 'RACD_Blood_Screening',
      identifier: '',
      prefix: 3,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Person',
      },
      taskTemplate: 'RACD_Blood_Screening',
      timingPeriod: {
        end: timingPeriodEnd.toString(),
        start: timingPeriodStart.toString(),
      },
      title: 'Blood screening',
    },
    goal: {
      description:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      id: 'RACD_Blood_Screening',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: 'Person(s)',
              value: 100,
            },
          },
          due: goalDue.toString(),
          measure: 'Number of registered people tested',
        },
      ],
    },
  },
  caseConfirmation: {
    action: {
      code: 'Case Confirmation',
      description: 'Confirm the index case',
      goalId: 'Case_Confirmation',
      identifier: '',
      prefix: 1,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Case_Confirmation',
      },
      taskTemplate: 'Case_Confirmation',
      timingPeriod: {
        end: timingPeriodEnd.toString(),
        start: timingPeriodStart.toString(),
      },
      title: 'Case Confirmation',
    },
    goal: {
      description: 'Confirm the index case',
      id: 'Case_Confirmation',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: 'case(s)',
              value: 1,
            },
          },
          due: goalDue.toString(),
          measure: 'Number of cases confirmed',
        },
      ],
    },
  },
  familyRegistration: {
    action: {
      code: 'RACD Register Family',
      description:
        'Register all families & family members in all residential structures enumerated (100%) within the operational area',
      goalId: 'RACD_register_families',
      identifier: '',
      prefix: 2,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Residential_Structure',
      },
      taskTemplate: 'RACD_register_families',
      timingPeriod: {
        end: timingPeriodEnd.toString(),
        start: timingPeriodStart.toString(),
      },
      title: 'Family Registration',
    },
    goal: {
      description:
        'Register all families & family members in all residential structures enumerated (100%) within the operational area',
      id: 'RACD_register_families',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: 'Percent',
              value: 100,
            },
          },
          due: goalDue.toString(),
          measure: 'Percent of residential structures with full family registration',
        },
      ],
    },
  },
  larvalDipping: {
    action: {
      code: 'Larval Dipping',
      description: 'Perform a minimum of three larval dipping activities in the operational area',
      goalId: 'Larval_Dipping',
      identifier: '',
      prefix: 5,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Breeding_Site',
      },
      taskTemplate: 'Larval_Dipping',
      timingPeriod: {
        end: timingPeriodEnd.toString(),
        start: timingPeriodStart.toString(),
      },
      title: 'Larval Dipping',
    },
    goal: {
      description: 'Perform a minimum of three larval dipping activities in the operational area',
      id: 'Larval_Dipping',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: 'activit(y|ies)',
              value: 3,
            },
          },
          due: goalDue.toString(),
          measure: 'Number of larval dipping activities completed',
        },
      ],
    },
  },
  mosquitoCollection: {
    action: {
      code: 'Mosquito Collection',
      description:
        'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
      goalId: 'Mosquito_Collection',
      identifier: '',
      prefix: 6,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Mosquito_Collection_Point',
      },
      taskTemplate: 'Mosquito_Collection_Point',
      timingPeriod: {
        end: timingPeriodEnd.toString(),
        start: timingPeriodStart.toString(),
      },
      title: 'Mosquito Collection',
    },
    goal: {
      description:
        'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
      id: 'Mosquito_Collection',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: 'activit(y|ies)',
              value: 3,
            },
          },
          due: goalDue.toString(),
          measure: 'Number of mosquito collection activities completed',
        },
      ],
    },
  },
};

export const activities = [
  {
    actionCode: 'Case Confirmation',
    actionDescription: 'Confirm the index case',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Case Confirmation',
    goalDescription: 'Confirm the index case',
    goalDue: '2019-08-16T08:39:42.773Z',
    goalPriority: 'medium-priority',
    goalValue: 1,
    timingPeriodEnd: '2019-08-16T08:39:42.773Z',
    timingPeriodStart: '2019-08-09T08:39:42.773Z',
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
    goalDue: '2019-08-16T08:39:42.773Z',
    goalPriority: 'medium-priority',
    goalValue: 100,
    timingPeriodEnd: '2019-08-16T08:39:42.773Z',
    timingPeriodStart: '2019-08-09T08:39:42.774Z',
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
    goalDue: '2019-08-16T08:39:42.774Z',
    goalPriority: 'medium-priority',
    goalValue: 100,
    timingPeriodEnd: '2019-08-16T08:39:42.775Z',
    timingPeriodStart: '2019-08-09T08:39:42.775Z',
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
    goalDue: '2019-08-16T08:39:42.775Z',
    goalPriority: 'medium-priority',
    goalValue: 100,
    timingPeriodEnd: '2019-08-16T08:39:42.775Z',
    timingPeriodStart: '2019-08-09T08:39:42.775Z',
  },
  {
    actionCode: 'Larval Dipping',
    actionDescription:
      'Perform a minimum of three larval dipping activities in the operational area',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Larval Dipping',
    goalDescription: 'Perform a minimum of three larval dipping activities in the operational area',
    goalDue: '2019-08-16T08:39:42.775Z',
    goalPriority: 'medium-priority',
    goalValue: 3,
    timingPeriodEnd: '2019-08-16T08:39:42.776Z',
    timingPeriodStart: '2019-08-09T08:39:42.776Z',
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
    goalDue: '2019-08-16T08:39:42.776Z',
    goalPriority: 'medium-priority',
    goalValue: 3,
    timingPeriodEnd: '2019-08-16T08:39:42.776Z',
    timingPeriodStart: '2019-08-09T08:39:42.776Z',
  },
  {
    actionCode: 'BCC',
    actionDescription: 'Conduct BCC activity',
    actionIdentifier: '',
    actionReason: 'Investigation',
    actionTitle: 'Behaviour Change Communication',
    goalDescription: 'Complete at least 1 BCC activity for the operational area',
    goalDue: '2019-08-16T08:39:42.778Z',
    goalPriority: 'medium-priority',
    goalValue: 1,
    timingPeriodEnd: '2019-08-16T08:39:42.778Z',
    timingPeriodStart: '2019-08-09T08:39:42.778Z',
  },
];

export const expectedExtractActivityFromPlanformResult = {
  action: [
    {
      code: 'Case Confirmation',
      description: 'Confirm the index case',
      goalId: 'Case_Confirmation',
      identifier: 'd60f14f2-9975-57c7-af8e-decd7e108606',
      prefix: 1,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Case_Confirmation',
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
      identifier: '02958cc9-f63e-5536-bfd0-c864c784146f',
      prefix: 2,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Residential_Structure',
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
      identifier: 'ccbfaee6-7153-5b29-a41c-946ebdb7c52c',
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
      identifier: '81a4cb1e-63d1-5880-948f-189bc6a16ae4',
      prefix: 4,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Residential_Structure',
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
      identifier: '312afb80-b754-506c-a12a-66c74e21a705',
      prefix: 5,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Breeding_Site',
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
      identifier: '86ee2e9e-1fd2-5188-b73f-3fcce4af85cd',
      prefix: 6,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Mosquito_Collection_Point',
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
      identifier: '8862886b-0e94-5dc1-a09e-35639c5d46c4',
      prefix: 7,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Operational_Area',
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
              unit: 'case(s)',
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
              unit: 'Percent',
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
              unit: 'Person(s)',
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
              unit: 'Percent',
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
              unit: 'activit(y|ies)',
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
              unit: 'activit(y|ies)',
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
              unit: 'activit(y|ies)',
              value: 1,
            },
          },
          due: '2019-08-16',
          measure: 'Number of BCC Activities Completed',
        },
      ],
    },
  ],
};
