import moment from 'moment';
import { DEFAULT_ACTIVITY_DURATION_DAYS } from '../../../../configs/env';
import { PlanActivities } from '../../../../configs/settings';

const goalDue = moment()
  .add(DEFAULT_ACTIVITY_DURATION_DAYS, 'days')
  .toDate();

const timingPeriodEnd = moment()
  .add(DEFAULT_ACTIVITY_DURATION_DAYS, 'days')
  .toDate();

const timingPeriodStart = moment().toDate();

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
