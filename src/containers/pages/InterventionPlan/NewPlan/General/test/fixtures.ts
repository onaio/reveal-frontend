import { parseISO } from 'date-fns';

export const planFormProps = {
  allFormActivities: [
    {
      actionCode: 'Case Confirmation',
      actionDescription: 'Confirm the index case',
      actionIdentifier: '',
      actionReason: 'Investigation',
      actionTitle: 'Case Confirmation',
      goalDescription: 'Confirm the index case',
      goalDue: parseISO('2017-07-20T19:31:00.000Z'),
      goalPriority: 'medium-priority',
      goalValue: 1,
      timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
      timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
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
      goalDue: parseISO('2017-07-20T19:31:00.000Z'),
      goalPriority: 'medium-priority',
      goalValue: 100,
      timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
      timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
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
      goalDue: parseISO('2017-07-20T19:31:00.000Z'),
      goalPriority: 'medium-priority',
      goalValue: 100,
      timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
      timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
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
      goalDue: parseISO('2017-07-20T19:31:00.000Z'),
      goalPriority: 'medium-priority',
      goalValue: 100,
      timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
      timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
    },
    {
      actionCode: 'Larval Dipping',
      actionDescription:
        'Perform a minimum of three larval dipping activities in the operational area',
      actionIdentifier: '',
      actionReason: 'Investigation',
      actionTitle: 'Larval Dipping',
      goalDescription:
        'Perform a minimum of three larval dipping activities in the operational area',
      goalDue: parseISO('2017-07-20T19:31:00.000Z'),
      goalPriority: 'medium-priority',
      goalValue: 3,
      timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
      timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
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
      goalDue: parseISO('2017-07-20T19:31:00.000Z'),
      goalPriority: 'medium-priority',
      goalValue: 3,
      timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
      timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
    },
    {
      actionCode: 'IRS',
      actionDescription: 'Visit each structure in the operational area and attempt to spray',
      actionIdentifier: '',
      actionReason: 'Routine',
      actionTitle: 'Spray Structures',
      goalDescription: 'Spray structures in the operational area',
      goalDue: parseISO('2017-07-20T19:31:00.000Z'),
      goalPriority: 'medium-priority',
      goalValue: 90,
      timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
      timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
    },
    {
      actionCode: 'BCC',
      actionDescription: 'Conduct BCC activity',
      actionIdentifier: '',
      actionReason: 'Investigation',
      actionTitle: 'Behaviour Change Communication',
      goalDescription: 'Complete at least 1 BCC activity for the operational area',
      goalDue: parseISO('2017-07-20T19:31:00.000Z'),
      goalPriority: 'medium-priority',
      goalValue: 1,
      timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
      timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
    },
  ],
  allowMoreJurisdictions: true,
  cascadingSelect: true,
  disabledActivityFields: [],
  disabledFields: [],
  initialValues: {
    activities: [
      {
        actionCode: 'Case Confirmation',
        actionDescription: 'Confirm the index case',
        actionIdentifier: '',
        actionReason: 'Investigation',
        actionTitle: 'Case Confirmation',
        goalDescription: 'Confirm the index case',
        goalDue: parseISO('2017-07-20T19:31:00.000Z'),
        goalPriority: 'medium-priority',
        goalValue: 1,
        timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
        timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
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
        goalDue: parseISO('2017-07-20T19:31:00.000Z'),
        goalPriority: 'medium-priority',
        goalValue: 100,
        timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
        timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
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
        goalDue: parseISO('2017-07-20T19:31:00.000Z'),
        goalPriority: 'medium-priority',
        goalValue: 100,
        timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
        timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
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
        goalDue: parseISO('2017-07-20T19:31:00.000Z'),
        goalPriority: 'medium-priority',
        goalValue: 100,
        timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
        timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
      },
      {
        actionCode: 'Larval Dipping',
        actionDescription:
          'Perform a minimum of three larval dipping activities in the operational area',
        actionIdentifier: '',
        actionReason: 'Investigation',
        actionTitle: 'Larval Dipping',
        goalDescription:
          'Perform a minimum of three larval dipping activities in the operational area',
        goalDue: parseISO('2017-07-20T19:31:00.000Z'),
        goalPriority: 'medium-priority',
        goalValue: 3,
        timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
        timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
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
        goalDue: parseISO('2017-07-20T19:31:00.000Z'),
        goalPriority: 'medium-priority',
        goalValue: 3,
        timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
        timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
      },
      {
        actionCode: 'BCC',
        actionDescription: 'Conduct BCC activity',
        actionIdentifier: '',
        actionReason: 'Investigation',
        actionTitle: 'Behaviour Change Communication',
        goalDescription: 'Complete at least 1 BCC activity for the operational area',
        goalDue: parseISO('2017-07-20T19:31:00.000Z'),
        goalPriority: 'medium-priority',
        goalValue: 1,
        timingPeriodEnd: parseISO('2017-07-20T19:31:00.000Z'),
        timingPeriodStart: parseISO('2017-07-13T19:31:00.000Z'),
      },
    ],
    caseNum: '',
    date: parseISO('2017-07-13T19:31:00.000Z'),
    end: parseISO('2017-08-02T19:31:00.000Z'),
    fiReason: undefined,
    fiStatus: undefined,
    identifier: '',
    interventionType: 'FI',
    jurisdictions: [
      {
        id: '',
        name: '',
      },
    ],
    name: '',
    opensrpEventId: undefined,
    start: parseISO('2017-07-13T19:31:00.000Z'),
    status: 'draft',
    taskGenerationStatus: 'False',
    title: '',
    version: '1',
  },
  jurisdictionLabel: 'Focus Area',
  redirectAfterAction: '/plans/list',
};
