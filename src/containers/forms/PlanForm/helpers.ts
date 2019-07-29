import { FormikErrors } from 'formik';
import { omit, pick } from 'lodash';
import moment from 'moment';
import { FormEvent } from 'react';
import * as Yup from 'yup';
import { DATE_FORMAT, DEFAULT_ACTIVITY_DURATION_DAYS } from '../../../configs/env';
import {
  actionReasons,
  FIClassifications,
  FIReasons,
  FIReasonType,
  FIStatusType,
  goalPriorities,
  PlanAction,
  PlanActionCodes,
  planActivities,
  PlanActivity,
  PlanDefinition,
  PlanGoal,
} from '../../../configs/settings';
import { DATE, IRS_TITLE, IS, NAME, REQUIRED } from '../../../constants';
import { InterventionType, PlanStatus } from '../../../store/ducks/plans';

/** separate FI and IRS activities */
export const FIActivities = omit(planActivities, ['IRS']);
export const IRSActivities = pick(planActivities, ['IRS']);

/** Array of FI Statuses */
export const fiStatusCodes = Object.values(FIClassifications).map(e => e.code as FIStatusType);

/** Yup validation schema for PlanForm */
export const PlanSchema = Yup.object().shape({
  activities: Yup.array().of(
    Yup.object().shape({
      actionCode: Yup.string().oneOf(PlanActionCodes.map(e => e)),
      actionDescription: Yup.string().required(REQUIRED),
      actionReason: Yup.string()
        .oneOf(Object.values(actionReasons))
        .required(REQUIRED),
      actionTitle: Yup.string().required(REQUIRED),
      goalDescription: Yup.string().required(REQUIRED),
      goalDue: Yup.date().required(REQUIRED),
      goalPriority: Yup.string()
        .oneOf(Object.values(goalPriorities))
        .required(REQUIRED),
      goalValue: Yup.number()
        .min(1)
        .required(REQUIRED),
      timingPeriodEnd: Yup.date().required(REQUIRED),
      timingPeriodStart: Yup.date().required(REQUIRED),
    })
  ),
  caseNum: Yup.string(),
  date: Yup.string().required(`${DATE} ${IS} ${REQUIRED}`),
  end: Yup.date().required(REQUIRED),
  fiReason: Yup.string().oneOf(FIReasons.map(e => e)),
  fiStatus: Yup.string().oneOf(fiStatusCodes),
  interventionType: Yup.string()
    .oneOf(Object.values(InterventionType))
    .required(REQUIRED),
  name: Yup.string().required(`${NAME} ${IS} ${REQUIRED}`),
  opensrpEventId: Yup.string(),
  start: Yup.date().required(REQUIRED),
  status: Yup.string()
    .oneOf(Object.values(PlanStatus))
    .required(REQUIRED),
  title: Yup.string().required(REQUIRED),
});

/** Plan activity form fields interface */
export interface PlanActivityFormFields {
  actionCode: string;
  actionDescription: string;
  actionReason: string;
  actionTitle: string;
  goalDescription: string;
  goalDue: Date;
  goalPriority: string;
  goalValue: number;
  timingPeriodEnd: Date;
  timingPeriodStart: Date;
}

/** Plan form fields interface */
export interface PlanFormFields {
  activities: PlanActivityFormFields[];
  caseNum?: string;
  date: Date;
  end: Date;
  fiReason?: FIReasonType;
  fiStatus?: FIStatusType;
  interventionType: InterventionType;
  name: string;
  opensrpEventId?: string;
  start: Date;
  status: PlanStatus;
  title: string;
}

/**
 * Convert a plan activity object to an object that can be used in the PlanForm
 * activities section
 * @param activityObj - the plan activity object
 */
export function extractActivityForForm(activityObj: PlanActivity): PlanActivityFormFields {
  const initialGoalDue = activityObj.goal.target[0].due;
  return {
    actionCode: activityObj.action.code,
    actionDescription: activityObj.action.description || '',
    actionReason: activityObj.action.reason || '',
    actionTitle: activityObj.action.title || '',
    goalDescription: activityObj.goal.description || '',
    goalDue:
      initialGoalDue && initialGoalDue !== ''
        ? moment(initialGoalDue).toDate()
        : moment()
            .add(DEFAULT_ACTIVITY_DURATION_DAYS, 'days')
            .toDate(),
    goalPriority: activityObj.goal.priority || goalPriorities[1],
    goalValue: activityObj.goal.target[0].detail.detailQuantity.value || 0,
    timingPeriodEnd:
      activityObj.action.timingPeriod.end && activityObj.action.timingPeriod.end !== ''
        ? moment(activityObj.action.timingPeriod.end).toDate()
        : moment()
            .add(DEFAULT_ACTIVITY_DURATION_DAYS, 'days')
            .toDate(),
    timingPeriodStart:
      activityObj.action.timingPeriod.start && activityObj.action.timingPeriod.start !== ''
        ? moment(activityObj.action.timingPeriod.start).toDate()
        : moment().toDate(),
  };
}

/**
 * Converts a plan activities objects to a list of activities for use on PlanForm
 * @param items - plan activities
 */
export function getFormActivities(items: typeof FIActivities | typeof IRSActivities) {
  return Object.values(items)
    .sort((a, b) => a.action.prefix - b.action.prefix)
    .map(e => extractActivityForForm(e));
}

/**
 * Get action and plans from PlanForm activities
 * @param {PlanActivityFormFields[]} activities - this of activities from PlanForm
 */
export function extractActivitiesFromPlanForm(activities: PlanActivityFormFields[]) {
  const actions: PlanAction[] = [];
  const goals: PlanGoal[] = [];

  activities.forEach(element => {
    if (element.actionCode in PlanActionCodes) {
      // we must declare them with some value. BCC chosen randomly here
      let thisAction: PlanAction = planActivities.BCC.action;
      let thisGoal: PlanGoal = planActivities.BCC.goal;
      // first populate with default values
      switch (element.actionCode) {
        case 'BCC':
          thisAction = planActivities.BCC.action;
          thisGoal = planActivities.BCC.goal;
        case 'IRS':
          thisAction = planActivities.IRS.action;
          thisGoal = planActivities.IRS.goal;
        case 'Bednet Distribution':
          thisAction = planActivities.bednetDistribution.action;
          thisGoal = planActivities.bednetDistribution.goal;
        case 'Blood Screening':
          thisAction = planActivities.bloodScreening.action;
          thisGoal = planActivities.bloodScreening.goal;
        case 'Case Confirmation':
          thisAction = planActivities.caseConfirmation.action;
          thisGoal = planActivities.caseConfirmation.goal;
        case 'RACD Register Family':
          thisAction = planActivities.familyRegistration.action;
          thisGoal = planActivities.familyRegistration.goal;
        case 'Larval Dipping':
          thisAction = planActivities.larvalDipping.action;
          thisGoal = planActivities.larvalDipping.goal;
        case 'Mosquito Collection':
          thisAction = planActivities.mosquitoCollection.action;
          thisGoal = planActivities.mosquitoCollection.goal;
      }
      // next put in values from the form
      thisAction = Object.assign(thisAction, {
        description: element.actionDescription,
        reason: element.actionReason,
        timingPeriod: {
          end: moment(element.timingPeriodEnd).format(DATE_FORMAT.toUpperCase()),
          start: moment(element.timingPeriodStart).format(DATE_FORMAT.toUpperCase()),
        },
        title: element.actionTitle,
      });
      thisGoal = Object.assign(thisGoal, {
        description: element.goalDescription,
        priority: element.goalPriority,
        target: [
          Object.assign(thisGoal.target, {
            detail: {
              detailQuantity: Object.assign(thisGoal.target[0].detail.detailQuantity, {
                value: element.goalValue,
              }),
            },
            due: moment(element.goalDue).format(DATE_FORMAT.toUpperCase()),
          }),
        ],
      });
      actions.push(thisAction);
      goals.push(thisGoal);
    }
  });

  return {
    action: actions,
    goal: goals,
  };
}

/**
 * Get the plan name and title
 * @param {any} event - the event object
 * @param {PlanFormFields} formValues - the form values
 * @returns {[string, string]} - the plan name and title
 */
export const getNameTitle = (event: FormEvent, formValues: PlanFormFields): [string, string] => {
  const target = event.target as HTMLInputElement;
  let name = IRS_TITLE;
  let title = IRS_TITLE;
  const currentInterventionType =
    target.name === 'interventionType' ? target.value : formValues.interventionType;
  const currentFiStatus = target.name === 'fiStatus' ? target.value : formValues.fiStatus;
  const currentJurisdiction = 'Some Jurisdiction';
  const currentDate = target.name === 'date' ? target.value : formValues.date;
  if (currentInterventionType === InterventionType.FI) {
    const result = [
      currentFiStatus,
      currentJurisdiction,
      moment(currentDate).format(DATE_FORMAT.toUpperCase()),
    ].map(e => {
      if (e) {
        return e;
      }
    });
    name = result.join('-');
    title = result.join(' ');
  }
  return [name, title];
};

/**
 * Check if field in field array has an error
 * @param field - the form field
 * @param index - the index in the field array
 * @param errors - the list of error objects
 */
export function doesFieldHaveErrors(
  field: string,
  index: number,
  errors: Array<FormikErrors<PlanActivityFormFields> | undefined>
) {
  return (
    errors && Object.entries(errors[index] || {}).filter(([key, val]) => key === field).length > 0
  );
}

/**
 * Generate an OpenSRP plan definition object from the PlanForm
 * @param formValue - the value gotten from the PlanForm
 * @returns {PlanDefinition} - the plan definition object
 */
export function generatePlanDefinition(formValue: PlanFormFields): PlanDefinition {
  return {
    action: [],
    date: moment(formValue.date).format(DATE_FORMAT.toUpperCase()),
    effectivePeriod: {
      end: moment(formValue.end).format(DATE_FORMAT.toUpperCase()),
      start: moment(formValue.start).format(DATE_FORMAT.toUpperCase()),
    },
    goal: [],
    identifier: '',
    jurisdiction: [],
    name: formValue.name,
    status: formValue.status,
    title: formValue.title,
    useContext: [],
    version: '1',
  };
}
