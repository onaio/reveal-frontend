import { parseISO } from 'date-fns';
import { FormikErrors } from 'formik';
import { findKey, pick } from 'lodash';
import moment from 'moment';
import { FormEvent } from 'react';
import * as Yup from 'yup';
import {
  ACTION_UUID_NAMESPACE,
  DATE_FORMAT,
  DEFAULT_ACTIVITY_DURATION_DAYS,
  DEFAULT_PLAN_VERSION,
  DEFAULT_TIME,
  ENABLED_PLAN_TYPES,
  PLAN_UUID_NAMESPACE,
} from '../../../configs/env';
import { DATE_IS_REQUIRED, NAME_IS_REQUIRED, REQUIRED } from '../../../configs/lang';
import {
  actionReasons,
  FIClassifications,
  FIReasons,
  goalPriorities,
  PlanAction,
  PlanActionCodes,
  PlanActionCondition,
  PlanActionTrigger,
  planActivities,
  PlanActivity,
  PlanDefinition,
  PlanGoal,
  PlanGoalDetail,
  PlanGoaldetailQuantity,
  PlanGoalTarget,
  taskGenerationStatuses,
  UseContext,
} from '../../../configs/settings';
import { generateNameSpacedUUID } from '../../../helpers/utils';
import { InterventionType, PlanStatus } from '../../../store/ducks/plans';
import {
  ActionReasonType,
  FIReasonType,
  FIStatusType,
  GoalPriorityType,
  GoalUnit,
  PlanActionCodesType,
  PlanActivityTitlesType,
  taskGenerationStatusType,
} from './types';

/** group plan activities */
export const FIActivities = pick(planActivities, [
  'BCC',
  'bednetDistribution',
  'bloodScreening',
  'caseConfirmation',
  'familyRegistration',
  'larvalDipping',
  'mosquitoCollection',
]);
export const IRSActivities = pick(planActivities, ['IRS']);
export const MDAActivities = pick(planActivities, ['caseConfirmation']);
export const MDAPointActivities = pick(planActivities, ['pointAdverseMDA', 'pointDispenseMDA']);
export const DynamicFIActivities = pick(planActivities, [
  'dynamicBCC',
  'dynamicBednetDistribution',
  'dynamicBloodScreening',
  'dynamicFamilyRegistration',
  'dynamicLarvalDipping',
  'dynamicMosquitoCollection',
]);
export const DynamicMDAActivities = pick(planActivities, [
  'dynamicCommunityAdherenceMDA',
  'dynamicCommunityDispenseMDA',
  'dynamicFamilyRegistration',
]);
export const DynamicIRSActivities = pick(planActivities, ['dynamicBCC', 'dynamicIRS']);

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
  date: Yup.string().required(DATE_IS_REQUIRED),
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
  name: Yup.string().required(NAME_IS_REQUIRED),
  opensrpEventId: Yup.string(),
  start: Yup.date().required(REQUIRED),
  status: Yup.string()
    .oneOf(Object.values(PlanStatus))
    .required(REQUIRED),
  taskGenerationStatus: Yup.string().oneOf(taskGenerationStatuses.map(e => e)),
  title: Yup.string().required(REQUIRED),
  version: Yup.string(),
});

interface PlanActivityExpression {
  description: string;
  expression: string;
}

interface PlanActivityTrigger {
  description?: string;
  expression?: string;
  name: string;
}

/** Plan activity form fields interface */
export interface PlanActivityFormFields {
  actionCode: string;
  actionDescription: string;
  actionIdentifier: string;
  actionReason: string;
  actionTitle: string;
  condition?: PlanActivityExpression[];
  goalDescription: string;
  goalDue: Date;
  goalPriority: string;
  goalValue: number;
  timingPeriodEnd: Date;
  timingPeriodStart: Date;
  trigger?: PlanActivityTrigger[];
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
  const planActivityKey: string =
    findKey(planActivities, (a: PlanActivity) => a.action.code === activityObj.action.code) || '';

  const condition: PlanActivityExpression[] = [];
  if (activityObj.action.condition) {
    for (const iterator of activityObj.action.condition) {
      condition.push({
        description: iterator.expression.description || '',
        expression: iterator.expression.expression || '',
      });
    }
  }

  const trigger: PlanActivityTrigger[] = [];
  if (activityObj.action.trigger) {
    for (const iterator of activityObj.action.trigger) {
      trigger.push({
        ...(iterator.expression && {
          description: iterator.expression.description || '',
          expression: iterator.expression.expression,
        }),
        name: iterator.name,
      });
    }
  }

  return {
    ...(condition.length > 0 && { condition }),
    ...(trigger.length > 0 && { trigger }),
    actionCode: activityObj.action.code,
    actionDescription: activityObj.action.description || '',
    actionIdentifier: activityObj.action.identifier || '',
    actionReason: activityObj.action.reason || '',
    actionTitle: activityObj.action.title || '',
    goalDescription: activityObj.goal.description || '',
    goalDue:
      activityObj.goal.target &&
      activityObj.goal.target[0].due &&
      activityObj.goal.target[0].due !== ''
        ? parseISO(`${activityObj.goal.target[0].due}${DEFAULT_TIME}`)
        : moment()
            .add(DEFAULT_ACTIVITY_DURATION_DAYS, 'days')
            .toDate(),
    goalPriority: activityObj.goal.priority || goalPriorities[1],
    goalValue:
      (activityObj.goal.target && activityObj.goal.target[0].detail.detailQuantity.value) ||
      (planActivityKey &&
        planActivities[planActivityKey as PlanActivityTitlesType] &&
        planActivities[planActivityKey as PlanActivityTitlesType].goal.target[0].detail
          .detailQuantity.value) ||
      1,
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

export type FormActivity =
  | typeof FIActivities
  | typeof IRSActivities
  | typeof MDAPointActivities
  | typeof DynamicFIActivities
  | typeof DynamicIRSActivities
  | typeof DynamicMDAActivities;

/**
 * Converts a plan activities objects to a list of activities for use on PlanForm
 * @param items - plan activities
 */
export function getFormActivities(items: FormActivity) {
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
 * Get plan activity object using an action code
 * @param {PlanActionCodesType} actionCode - the action code
 * @param {boolean} isDynamic - whether we are looking for dynamic activities
 */
export function getPlanActivityFromActionCode(
  actionCode: PlanActionCodesType,
  isDynamic: boolean = false
): PlanActivity | null {
  const search = Object.values(planActivities).filter(item => {
    if (isDynamic) {
      return (
        item.action.code === actionCode &&
        (Object.keys(item.action).includes('condition') ||
          Object.keys(item.action).includes('trigger'))
      );
    } else {
      return (
        item.action.code === actionCode &&
        !Object.keys(item.action).includes('condition') &&
        !Object.keys(item.action).includes('trigger')
      );
    }
  });
  if (search.length > 0) {
    return search[0];
  }

  return null;
}

/**
 * Get the plan definition conditions from form field values
 * @param element - form field values for one plan activity
 */
const getConditionFromFormField = (
  element: PlanActivityFormFields
): PlanActionCondition[] | undefined => {
  return (
    element.condition &&
    element.condition.map(item => {
      return {
        expression: {
          ...(item.description && { description: item.description }),
          expression: item.expression,
        },
        kind: 'applicability',
      };
    })
  );
};

/**
 * Get the plan definition triggers from form field values
 * @param element - form field values for one plan activity
 */
const getTriggerFromFormField = (
  element: PlanActivityFormFields
): PlanActionTrigger[] | undefined => {
  return (
    element.trigger &&
    element.trigger.map(item => {
      return {
        ...((item.description || item.expression) && {
          expression: {
            ...(item.description && { description: item.description }),
            ...(item.expression && { expression: item.expression }),
          },
        }),
        name: item.name,
        type: 'named-event',
      } as PlanActionTrigger;
    })
  );
};

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

      // lets figure out if this is a dynamic activity
      const isDynamic =
        Object.keys(element).includes('condition') || Object.keys(element).includes('trigger');
      const planActivity = getPlanActivityFromActionCode(
        element.actionCode as PlanActionCodesType,
        isDynamic
      );

      if (planActivity) {
        thisAction = {
          ...planActivity.action,
          ...planActionGoal.action,
        };
        thisGoal = {
          ...planActivity.goal,
          ...planActionGoal.goal,
        };
      }

      const condition = getConditionFromFormField(element);
      const trigger = getTriggerFromFormField(element);

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
        ...(condition && { condition }),
        ...(trigger && { trigger }),
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
  let title;

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
    errors && Object.entries(errors[index] || {}).filter(([key, _]) => key === field).length > 0
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
    experimental: false,
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
 * Check if the plan is a dynamic plan
 * @param planObject - the plan
 */
export const isDynamicPlan = (planObject: PlanDefinition) =>
  planObject.action
    .map(action => {
      return Object.keys(action).includes('condition') || Object.keys(action).includes('trigger');
    })
    .includes(true);

/**
 * Get plan form field values from plan definition object
 * @param planObject - the plan definition object
 * @returns {PlanFormFields} - the plan form field values
 */
export function getPlanFormValues(planObject: PlanDefinition): PlanFormFields {
  const typeUseContext = [];
  const reasonUseContext = [];
  const statusUseContext = [];
  const eventIdUseContext = [];
  const caseNumUseContext = [];
  const taskGenerationStatusContext = [];

  for (const context of planObject.useContext) {
    switch (context.code) {
      case 'interventionType':
        typeUseContext.push(context);
        break;
      case 'fiReason':
        reasonUseContext.push(context);
        break;
      case 'fiStatus':
        statusUseContext.push(context);
        break;
      case 'opensrpEventId':
        eventIdUseContext.push(context);
        break;
      case 'caseNum':
        caseNumUseContext.push(context);
        break;
      case 'taskGenerationStatus':
        taskGenerationStatusContext.push(context);
        break;
    }
  }

  const interventionType =
    typeUseContext.length > 0
      ? (typeUseContext[0].valueCodableConcept as InterventionType)
      : InterventionType.FI;

  let activities = planObject.action.reduce(
    (accumulator: PlanActivityFormFields[], currentAction) => {
      const goalArray = planObject.goal.filter(goal => goal.id === currentAction.goalId);

      goalArray.forEach(currentGoal => {
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
    if (interventionType === InterventionType.IRS) {
      activities = getFormActivities(IRSActivities);
    }
    if (interventionType === InterventionType.FI) {
      activities = getFormActivities(FIActivities);
    }
    if (interventionType === InterventionType.MDAPoint) {
      activities = getFormActivities(MDAPointActivities);
    }
    // TODO: add the new plan types
  }

  let taskGenerationStatus: taskGenerationStatusType;

  if (isDynamicPlan(planObject)) {
    taskGenerationStatus = taskGenerationStatuses[2]; // Disabled
  } else {
    taskGenerationStatus =
      taskGenerationStatusContext.length > 0
        ? (taskGenerationStatusContext[0].valueCodableConcept as taskGenerationStatusType)
        : taskGenerationStatuses[1];
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
    taskGenerationStatus,
    title: planObject.title,
    version: planObject.version,
  };
}

/**
 * Get goal unit from action code
 * @param {PlanActionCodesType} actionCode - the plan action code
 */
export function getGoalUnitFromActionCode(actionCode: PlanActionCodesType): GoalUnit {
  const planActivity = getPlanActivityFromActionCode(actionCode);
  if (planActivity) {
    return planActivity.goal.target[0].detail.detailQuantity.unit;
  }
  return GoalUnit.UNKNOWN;
}

/**
 * Check if a plan type should be visible
 * @param {InterventionType} planType - plan type
 */
export const isPlanTypeEnabled = (planType: InterventionType): boolean =>
  ENABLED_PLAN_TYPES.includes(planType);
