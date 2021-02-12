import { parseISO } from 'date-fns';
import { defaultProps as defaultPlanFormProps } from '../../../../../components/forms/PlanForm';
import { PlanDefinition } from '../../../../../configs/settings';

export const updatePlanFormProps = {
  ...defaultPlanFormProps,
  allowMoreJurisdictions: true,
  cascadingSelect: true,
  disabledActivityFields: ['actionReason', 'goalPriority'],
  disabledFields: [
    'interventionType',
    'fiReason',
    'fiStatus',
    'identifier',
    'name',
    'caseNum',
    'opensrpEventId',
    'jurisdictions',
    'activities',
    'date',
    'end',
    'fiReason',
    'fiStatus',
    'start',
    'taskGenerationStatus',
    'teamAssignmentStatus',
    'title',
    'version',
  ],
  initialValues: {
    activities: [
      {
        actionCode: 'BCC',
        actionDefinitionUri: '',
        actionDescription: 'Perform BCC for the operational area',
        actionIdentifier: '3f2eef38-38fe-4108-abb3-4e896b880302',
        actionReason: 'Routine',
        actionTitle: 'Perform BCC',
        goalDescription: 'Complete BCC for the operational area',
        goalDue: parseISO('2019-07-10T00:00:00.000Z'),
        goalPriority: 'medium-priority',
        goalValue: 1,
        timingPeriodEnd: parseISO('2019-07-30T00:00:00.000Z'),
        timingPeriodStart: parseISO('2019-07-10T00:00:00.000Z'),
      },
      {
        actionCode: 'IRS',
        actionDefinitionUri: '',
        actionDescription: 'Visit each structure in the operational area and attempt to spray',
        actionIdentifier: '95a5a00f-a411-4fe5-bd9c-460a856239c9',
        actionReason: 'Routine',
        actionTitle: 'Spray Structures',
        goalDescription: 'Spray 90 % of structures in the operational area',
        goalDue: parseISO('2019-07-30T00:00:00.000Z'),
        goalPriority: 'medium-priority',
        goalValue: 90,
        timingPeriodEnd: parseISO('2019-07-30T00:00:00.000Z'),
        timingPeriodStart: parseISO('2019-07-10T00:00:00.000Z'),
      },
    ],
    caseNum: '',
    date: parseISO('2019-07-10T00:00:00.000Z'),
    end: parseISO('2019-07-30T00:00:00.000Z'),
    fiReason: undefined,
    fiStatus: undefined,
    identifier: '8fa7eb32-99d7-4b49-8332-9ecedd6d51ae',
    interventionType: 'IRS',
    jurisdictions: [
      {
        id: '35968df5-f335-44ae-8ae5-25804caa2d86',
        name: '35968df5-f335-44ae-8ae5-25804caa2d86',
      },
      {
        id: '3952',
        name: '3952',
      },
      {
        id: 'ac7ba751-35e8-4b46-9e53-3cbaad193697',
        name: 'ac7ba751-35e8-4b46-9e53-3cbaad193697',
      },
    ],
    name: 'TwoTwoOne_01_IRS_2019-07-10',
    opensrpEventId: undefined,
    start: parseISO('2019-07-10T00:00:00.000Z'),
    status: 'active',
    taskGenerationStatus: 'False',
    teamAssignmentStatus: '',
    title: 'TwoTwoOne_01 IRS 2019-07-10',
    version: '1',
  },
  jurisdictionLabel: 'Focus Area',
  redirectAfterAction: '/plans/list',
};

// tslint:disable: object-literal-sort-keys
export const planDefinition1: PlanDefinition = {
  identifier: 'e1d716f4-cd97-428f-b21f-1a1e5005a8bf',
  version: '1',
  name: 'A1-สะพานหิน(ข)-PFN20191101_PLN20191101-2019-11-01-Site',
  title: 'A1 - สะพานหิน(ข) - PFN20191101 PLN20191101 - 2019-11-01 - Site',
  status: 'active',
  date: '2019-11-01',
  effectivePeriod: {
    start: '2019-11-01',
    end: '2019-11-21',
  },
  useContext: [
    {
      code: 'interventionType',
      valueCodableConcept: 'FI',
    },
    {
      code: 'fiStatus',
      valueCodableConcept: 'A1',
    },
    {
      code: 'fiReason',
      valueCodableConcept: 'Case Triggered',
    },
    {
      code: 'opensrpEventId',
      valueCodableConcept: 'ee1f53cf-a6ce-41c0-a5cb-d0083009f973',
    },
    {
      code: 'caseNum',
      valueCodableConcept: '3404',
    },
    {
      code: 'taskGenerationStatus',
      valueCodableConcept: 'True',
    },
  ],
  jurisdiction: [
    {
      code: '55d80e8e-73f0-4331-ba45-81cfcd68a38c',
    },
  ],
  serverVersion: 1572604783787,
  goal: [
    {
      id: 'Case_Confirmation',
      description: 'Confirm the index case',
      priority: 'medium-priority',
      target: [
        {
          measure: 'Number of cases confirmed',
          detail: {
            detailQuantity: {
              value: 1.0,
              comparator: '>=',
              unit: 'case(s)',
            } as any,
          },
          due: '2019-11-11',
        },
      ],
    },
  ],
  action: [
    {
      identifier: '424c6950-4979-4a17-a721-7d87dac3a660',
      prefix: 7,
      title: 'Mosquito Collection',
      description:
        'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
      code: 'Mosquito Collection',
      timingPeriod: {
        start: '2019-11-01',
        end: '2019-11-21',
      },
      reason: 'Investigation',
      goalId: 'Mosquito_Collection',
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'Mosquito_Collection_Point',
    },
  ],
};

export const planDefinition2: PlanDefinition = {
  identifier: '4c6dd0b9-7885-5c63-b447-86897b7f4766',
  version: '1',
  name: 'B2-OuSM_01-2019-07-31',
  title: 'B2 OuSM_01 2019-07-31',
  status: 'draft',
  date: '2019-07-31',
  effectivePeriod: {
    start: '2019-07-31',
    end: '2019-08-20',
  },
  useContext: [
    {
      code: 'taskGenerationStatus',
      valueCodableConcept: 'True',
    },
    {
      code: 'interventionType',
      valueCodableConcept: 'FI',
    },
    {
      code: 'fiReason',
      valueCodableConcept: 'Routine',
    },
    {
      code: 'fiStatus',
      valueCodableConcept: 'B2',
    },
  ],
  jurisdiction: [
    {
      code: 'f31f8088-5b99-4be4-adb7-6ea7ac212a3c',
    },
  ],
  serverVersion: 1565898590417,
  goal: [
    {
      id: 'BCC_Focus',
      description: 'Complete at least 1 BCC activity for the operational area',
      priority: 'high-priority',
    },
  ] as any,
  action: [
    {
      identifier: 'ead40315-3dd8-517c-a109-ad91a4627463',
      prefix: 7,
      title: 'Behaviour Change Communication',
      description: 'Conduct BCC activity',
      code: 'BCC',
      timingPeriod: {
        start: '2019-07-31',
        end: '2019-08-07',
      },
      reason: 'Investigation',
      goalId: 'BCC_Focus',
      subjectCodableConcept: {
        text: 'Jurisdiction',
      },
      taskTemplate: 'BCC_Focus',
    },
  ],
};

export const retirePlan1Payload =
  '{"baseEntityId":"8fa7eb32-99d7-4b49-8332-9ecedd6d51ae","details":{"planIdentifier":"8fa7eb32-99d7-4b49-8332-9ecedd6d51ae"},"entityType":"PlanDefinition","eventDate":"2017-07-13","eventType":"Retire_Plan","formSubmissionId":"1e782ffa-d7ba-5d83-bf1d-47b8954564d7","obs":[{"fieldCode":"retire_reason","fieldDataType":"text","fieldType":"formsubmissionField","formSubmissionField":"retire_reason","humanReadableValues":[],"parentCode":"","saveObsAsArray":false,"set":[],"values":["Plan is duplicated"]}],"providerId":"","type":"Event","version":1499974260000}';
