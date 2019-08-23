import { parseISO } from 'date-fns';
import { planFormProps as newPlanFormProps } from '../../General/test/fixtures';

export const planFormProps = {
  ...newPlanFormProps,
  allowMoreJurisdictions: false,
  cascadingSelect: false,
  disabledFields: ['interventionType', 'status'],
  initialValues: {
    ...newPlanFormProps.initialValues,
    activities: [
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
    ],
    interventionType: 'IRS',
  },
  jurisdictionLabel: 'Country',
  redirectAfterAction: '/intervention/irs',
};
