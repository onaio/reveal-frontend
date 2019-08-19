import { parseISO } from 'date-fns';
import { FormikErrors } from 'formik';
import { omit, pick } from 'lodash';
import moment from 'moment';
import { FormEvent } from 'react';
import * as Yup from 'yup';
import {
  ACTION_UUID_NAMESPACE,
  DATE_FORMAT,
  DEFAULT_ACTIVITY_DURATION_DAYS,
  DEFAULT_PLAN_VERSION,
  DEFAULT_TIME,
  PLAN_UUID_NAMESPACE,
} from '../../../configs/env';
import {
  actionReasons,
  ActionReasonType,
  FIClassifications,
  FIReasons,
  FIReasonType,
  FIStatusType,
  goalPriorities,
  GoalPriorityType,
  PlanAction,
  PlanActionCodes,
  PlanActionCodesType,
  planActivities,
  PlanActivity,
  PlanDefinition,
  PlanGoal,
  PlanGoalDetail,
  PlanGoaldetailQuantity,
  PlanGoalTarget,
  taskGenerationStatuses,
  taskGenerationStatusType,
  UseContext,
} from '../../../configs/settings';
import { DATE, IS, NAME, REQUIRED } from '../../../constants';
import { generateNameSpacedUUID } from '../../../helpers/utils';
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
      actionIdentifier: Yup.string(),
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
  identifier: Yup.string(),
  interventionType: Yup.string()
    .oneOf(Object.values(InterventionType))
    .required(REQUIRED),
  jurisdictions: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(REQUIRED),
      name: Yup.string(),
    })
  ),
  name: Yup.string().required(`${NAME} ${IS} ${REQUIRED}`),
  opensrpEventId: Yup.string(),
  start: Yup.date().required(REQUIRED),
  status: Yup.string()
    .oneOf(Object.values(PlanStatus))
    .required(REQUIRED),
  taskGenerationStatus: Yup.string().oneOf(taskGenerationStatuses.map(e => e)),
  title: Yup.string().required(REQUIRED),
  version: Yup.string(),
});

/** Plan activity form fields interface */
export interface PlanActivityFormFields {
  actionCode: string;
  actionDescription: string;
  actionIdentifier: string;
  actionReason: string;
  actionTitle: string;
  goalDescription: string;
  goalDue: Date;
  goalPriority: string;
  goalValue: number;
  timingPeriodEnd: Date;
  timingPeriodStart: Date;
}

/** Plan jurisdictions form fields interface */
export interface PlanJurisdictionFormFields {
  id: string;
  name: string;
}

/** Plan form fields interface */
export interface PlanFormFields {
  activities: PlanActivityFormFields[];
  caseNum?: string;
  date: Date;
  end: Date;
  fiReason?: FIReasonType;
  fiStatus?: FIStatusType;
  identifier: string;
  interventionType: InterventionType;
  jurisdictions: PlanJurisdictionFormFields[];
  name: string;
  opensrpEventId?: string;
  start: Date;
  status: PlanStatus;
  taskGenerationStatus: taskGenerationStatusType;
  title: string;
  version: string;
}

/**
 * Convert a plan activity object to an object that can be used in the PlanForm
 * activities section
 * @param activityObj - the plan activity object
 */
export function extractActivityForForm(activityObj: PlanActivity): PlanActivityFormFields {
  return {
    actionCode: activityObj.action.code,
    actionDescription: activityObj.action.description || '',
    actionIdentifier: activityObj.action.identifier || '',
    actionReason: activityObj.action.reason || '',
    actionTitle: activityObj.action.title || '',
    goalDescription: activityObj.goal.description || '',
    goalDue:
      activityObj.goal.target[0].due && activityObj.goal.target[0].due !== ''
        ? parseISO(`${activityObj.goal.target[0].due}${DEFAULT_TIME}`)
        : moment()
            .add(DEFAULT_ACTIVITY_DURATION_DAYS, 'days')
            .toDate(),
    goalPriority: activityObj.goal.priority || goalPriorities[1],
    goalValue: activityObj.goal.target[0].detail.detailQuantity.value || 0,
    timingPeriodEnd:
      activityObj.action.timingPeriod.end && activityObj.action.timingPeriod.end !== ''
        ? parseISO(`${activityObj.action.timingPeriod.end}${DEFAULT_TIME}`)
        : moment()
            .add(DEFAULT_ACTIVITY_DURATION_DAYS, 'days')
            .toDate(),
    timingPeriodStart:
      activityObj.action.timingPeriod.start && activityObj.action.timingPeriod.start !== ''
        ? parseISO(`${activityObj.action.timingPeriod.start}${DEFAULT_TIME}`)
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
 * Get a plan activity from a plan definition object
 * @param {PlanDefinition} planObj - the plan definition
 * @param {PlanActionCodesType} actionCode - the action code
 * @returns {PlanActivity | null} - the plan activity or null
 */
export function getActivityFromPlan(
  planObj: PlanDefinition,
  actionCode: PlanActionCodesType
): PlanActivity | null {
  const actions = planObj.action.filter(e => e.code === actionCode);
  if (actions.length > 0) {
    const goals = planObj.goal.filter(e => e.id === actions[0].goalId);
    if (goals.length > 0) {
      return {
        action: actions[0],
        goal: goals[0],
      };
    }
  }

  return null;
}

/**
 * Get action and plans from PlanForm activities
 * @param {PlanActivityFormFields[]} activities - this of activities from PlanForm
 * @param {string} planIdentifier - this plan identifier
 */
export function extractActivitiesFromPlanForm(
  activities: PlanActivityFormFields[],
  planIdentifier: string = '',
  planObj: PlanDefinition | null = null
) {
  const actions: PlanAction[] = [];
  const goals: PlanGoal[] = [];

  activities.forEach((element, index) => {
    const prefix = index + 1;
    if (PlanActionCodes.includes(element.actionCode as PlanActionCodesType)) {
      const planActionGoal = (planObj &&
        getActivityFromPlan(planObj, element.actionCode as PlanActionCodesType)) || {
        action: {},
        goal: {},
      };

      // we must declare them with some value. BCC chosen randomly here
      let thisAction: PlanAction = planActivities.BCC.action;
      let thisGoal: PlanGoal = planActivities.BCC.goal;

      // first populate with default values
      if (element.actionCode === 'BCC') {
        thisAction = {
          ...planActivities.BCC.action,
          ...planActionGoal.action,
        };
        thisGoal = {
          ...planActivities.BCC.goal,
          ...planActionGoal.goal,
        };
      }
      if (element.actionCode === 'IRS') {
        thisAction = {
          ...planActivities.IRS.action,
          ...planActionGoal.action,
        };
        thisGoal = {
          ...planActivities.IRS.goal,
          ...planActionGoal.goal,
        };
      }
      if (element.actionCode === 'Bednet Distribution') {
        thisAction = {
          ...planActivities.bednetDistribution.action,
          ...planActionGoal.action,
        };
        thisGoal = {
          ...planActivities.bednetDistribution.goal,
          ...planActionGoal.goal,
        };
      }
      if (element.actionCode === 'Blood Screening') {
        thisAction = {
          ...planActivities.bloodScreening.action,
          ...planActionGoal.action,
        };
        thisGoal = {
          ...planActivities.bloodScreening.goal,
          ...planActionGoal.goal,
        };
      }
      if (element.actionCode === 'Case Confirmation') {
        thisAction = {
          ...planActivities.caseConfirmation.action,
          ...planActionGoal.action,
        };
        thisGoal = {
          ...planActivities.caseConfirmation.goal,
          ...planActionGoal.goal,
        };
      }
      if (element.actionCode === 'RACD Register Family') {
        thisAction = {
          ...planActivities.familyRegistration.action,
          ...planActionGoal.action,
        };
        thisGoal = {
          ...planActivities.familyRegistration.goal,
          ...planActionGoal.goal,
        };
      }
      if (element.actionCode === 'Larval Dipping') {
        thisAction = {
          ...planActivities.larvalDipping.action,
          ...planActionGoal.action,
        };
        thisGoal = {
          ...planActivities.larvalDipping.goal,
          ...planActionGoal.goal,
        };
      }
      if (element.actionCode === 'Mosquito Collection') {
        thisAction = {
          ...planActivities.mosquitoCollection.action,
          ...planActionGoal.action,
        };
        thisGoal = {
          ...planActivities.mosquitoCollection.goal,
          ...planActionGoal.goal,
        };
      }

      const thisActionIdentifier =
        !element.actionIdentifier || element.actionIdentifier === ''
          ? planIdentifier === ''
            ? generateNameSpacedUUID(
                `${moment().toString()}-${thisAction.goalId}`,
                ACTION_UUID_NAMESPACE
              )
            : generateNameSpacedUUID(
                `${moment().toString()}-${planIdentifier}-${thisAction.goalId}`,
                ACTION_UUID_NAMESPACE
              )
          : element.actionIdentifier;

      // next put in values from the form
      const actionFields: Partial<PlanAction> = {
        description: element.actionDescription,
        identifier: thisActionIdentifier,
        prefix,
        reason: element.actionReason as ActionReasonType,
        timingPeriod: {
          end: moment(element.timingPeriodEnd).format(DATE_FORMAT.toUpperCase()),
          start: moment(element.timingPeriodStart).format(DATE_FORMAT.toUpperCase()),
        },
        title: element.actionTitle,
      };

      thisAction = Object.assign(thisAction, actionFields);

      if (thisGoal.target[0]) {
        const goalDetailQty: Partial<PlanGoaldetailQuantity> = {
          value: element.goalValue,
        };

        const goalDetail: Partial<PlanGoalDetail> = {
          detailQuantity: Object.assign(thisGoal.target[0].detail.detailQuantity, goalDetailQty),
        };

        const goalTarget: PlanGoalTarget = Object.assign(thisGoal.target[0], {
          detail: goalDetail,
          due: moment(element.goalDue).format(DATE_FORMAT.toUpperCase()),
        });

        const goalFields: Partial<PlanGoal> = {
          description: element.goalDescription,
          priority: element.goalPriority as GoalPriorityType,
          target: [goalTarget],
        };

        thisGoal = Object.assign(thisGoal, goalFields);
      }

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
 * @param {FormEvent} event - the event object
 * @param {PlanFormFields} formValues - the form values
 * @returns {[string, string]} - the plan name and title
 */
export const getNameTitle = (event: FormEvent, formValues: PlanFormFields): [string, string] => {
  const target = event.target as HTMLInputElement;
  const currentInterventionType =
    target.name === 'interventionType' ? target.value : formValues.interventionType;
  const currentFiStatus = target.name === 'fiStatus' ? target.value : formValues.fiStatus;

  let currentJurisdiction = '';
  if (formValues.jurisdictions.length > 0) {
    currentJurisdiction = formValues.jurisdictions[0].name;
  }

  let name = currentInterventionType;
  let title = currentInterventionType;

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
  } else {
    const result = [name, moment(currentDate).format(DATE_FORMAT.toUpperCase())].map(e => {
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
  errors: Array<FormikErrors<PlanActivityFormFields | PlanJurisdictionFormFields> | undefined>
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
export function generatePlanDefinition(
  formValue: PlanFormFields,
  planObj: PlanDefinition | null = null
): PlanDefinition {
  const planIdentifier =
    formValue.identifier && formValue.identifier !== '' // is this an existing plan?
      ? formValue.identifier
      : generateNameSpacedUUID(moment().toString(), PLAN_UUID_NAMESPACE);

  const planVersion =
    formValue.identifier && formValue.identifier !== '' // is this an existing plan?
      ? isNaN(parseInt(formValue.version, 10)) // is the existing version valid?
        ? parseInt(DEFAULT_PLAN_VERSION, 10) + 1
        : parseInt(formValue.version, 10) + 1
      : formValue.version;

  const useContext: UseContext[] = [
    {
      code: 'interventionType',
      valueCodableConcept: formValue.interventionType,
    },
  ];

  if (formValue.fiStatus) {
    useContext.push({ code: 'fiStatus', valueCodableConcept: formValue.fiStatus });
  }

  if (formValue.fiReason) {
    useContext.push({ code: 'fiReason', valueCodableConcept: formValue.fiReason });
  }

  if (formValue.caseNum) {
    useContext.push({ code: 'caseNum', valueCodableConcept: formValue.caseNum });
  }

  if (formValue.opensrpEventId) {
    useContext.push({ code: 'opensrpEventId', valueCodableConcept: formValue.opensrpEventId });
  }

  if (formValue.taskGenerationStatus) {
    useContext.push({
      code: 'taskGenerationStatus',
      valueCodableConcept: formValue.taskGenerationStatus,
    });
  }

  return {
    ...extractActivitiesFromPlanForm(
      formValue.activities,
      planObj ? planObj.identifier : '',
      planObj
    ), // action and goal
    date: moment(formValue.date).format(DATE_FORMAT.toUpperCase()),
    effectivePeriod: {
      end: moment(formValue.end).format(DATE_FORMAT.toUpperCase()),
      start: moment(formValue.start).format(DATE_FORMAT.toUpperCase()),
    },
    identifier: planIdentifier,
    jurisdiction: formValue.jurisdictions
      ? formValue.jurisdictions.map(e => {
          return { code: e.id };
        })
      : [],
    name: formValue.name,
    status: formValue.status,
    title: formValue.title,
    useContext,
    version: planVersion as string,
  };
}

/**
 * Get plan form field values from plan definition object
 * @param planObject - the plan definition object
 * @returns {PlanFormFields} - the plan form field values
 */
export function getPlanFormValues(planObject: PlanDefinition): PlanFormFields {
  const typeUseContext = planObject.useContext.filter(e => e.code === 'interventionType');
  const reasonUseContext = planObject.useContext.filter(e => e.code === 'fiReason');
  const statusUseContext = planObject.useContext.filter(e => e.code === 'fiStatus');
  const eventIdUseContext = planObject.useContext.filter(e => e.code === 'opensrpEventId');
  const caseNumUseContext = planObject.useContext.filter(e => e.code === 'caseNum');
  const taskGenerationStatusContext = planObject.useContext.filter(
    e => e.code === 'taskGenerationStatus'
  );

  const interventionType =
    typeUseContext.length > 0
      ? (typeUseContext[0].valueCodableConcept as InterventionType)
      : InterventionType.FI;

  let activities = planObject.action.reduce(
    (accumulator: PlanActivityFormFields[], currentAction) => {
      const goalArray = planObject.goal.filter(goal => goal.id === currentAction.goalId);
      goalArray.map(currentGoal => {
        const currentActivity = extractActivityForForm({
          action: currentAction,
          goal: currentGoal,
        });
        accumulator.push(currentActivity);
      });
      return accumulator;
    },
    []
  );

  if (activities.length < 1) {
    activities =
      interventionType === InterventionType.IRS
        ? getFormActivities(IRSActivities)
        : getFormActivities(FIActivities);
  }

  return {
    activities,
    caseNum: caseNumUseContext.length > 0 ? caseNumUseContext[0].valueCodableConcept : '',
    date: parseISO(`${planObject.date}${DEFAULT_TIME}`),
    end: parseISO(`${planObject.effectivePeriod.end}${DEFAULT_TIME}`),
    fiReason:
      reasonUseContext.length > 0
        ? (reasonUseContext[0].valueCodableConcept as FIReasonType)
        : undefined,
    fiStatus:
      statusUseContext.length > 0
        ? (statusUseContext[0].valueCodableConcept as FIStatusType)
        : undefined,
    identifier: planObject.identifier,
    interventionType,
    jurisdictions: planObject.jurisdiction.map(e => ({
      id: e.code,
      name: e.code,
    })) /** a little cheating: since we dnt have the name yet, we just use code */,
    name: planObject.name,
    opensrpEventId:
      eventIdUseContext.length > 0 ? eventIdUseContext[0].valueCodableConcept : undefined,
    start: parseISO(`${planObject.effectivePeriod.start}${DEFAULT_TIME}`),
    status: planObject.status as PlanStatus,
    taskGenerationStatus:
      taskGenerationStatusContext.length > 0
        ? (taskGenerationStatusContext[0].valueCodableConcept as taskGenerationStatusType)
        : taskGenerationStatuses[1],
    title: planObject.title,
    version: planObject.version,
  };
}
