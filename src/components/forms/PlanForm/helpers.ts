import { Dictionary } from '@onaio/utils';
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
  DISPLAYED_PLAN_TYPES,
  OPENSRP_GENERATED_TASKS_INTERVENTIONS,
  PLAN_TYPES_ALLOWED_TO_CREATE,
  PLAN_UUID_NAMESPACE,
  TASK_GENERATION_STATUS,
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
  subjectCodableConceptType,
  taskGenerationStatuses,
  UseContext,
} from '../../../configs/settings';
import {
  APPLICABILITY_CONDITION_KIND,
  BCC_ACTIVITY_CODE,
  BEDNET_DISTRIBUTION_ACTIVITY_CODE,
  BLOOD_SCREENING_ACTIVITY_CODE,
  CASE_CONFIRMATION_ACTIVITY_CODE,
  CASE_NUMBER_CODE,
  CDD_SUPERVISION_ACTIVITY_CODE,
  CONDITION,
  DAYS,
  DYNAMIC_BCC_ACTIVITY_CODE,
  DYNAMIC_BEDNET_DISTRIBUTION_ACTIVITY_CODE,
  DYNAMIC_BLOOD_SCREENING_ACTIVITY_CODE,
  DYNAMIC_CASE_CONFIRMATION_ACTIVITY_CODE,
  DYNAMIC_FAMILY_REGISTRATION_ACTIVITY_CODE,
  DYNAMIC_IRS_ACTIVITY_CODE,
  DYNAMIC_LARVAL_DIPPING_ACTIVITY_CODE,
  DYNAMIC_MDA_COMMUNITY_ADHERENCE_ACTIVITY_CODE,
  DYNAMIC_MDA_COMMUNITY_DISPENSE_ACTIVITY_CODE,
  DYNAMIC_MOSQUITO_COLLECTION_ACTIVITY_CODE,
  FAMILY_REGISTRATION_ACTIVITY_CODE,
  FI_REASON_CODE,
  FI_STATUS_CODE,
  INTERNAL,
  INTERVENTION_TYPE_CODE,
  IRS_ACTIVITY_CODE,
  LARVAL_DIPPING_ACTIVITY_CODE,
  MDA_ADHERENCE,
  MDA_DISPENSE_ACTIVITY_CODE,
  MDA_FAMILY_REGISTRATION,
  MDA_POINT_ADVERSE_EFFECTS_ACTIVITY_CODE,
  MDA_POINT_DISPENSE_ACTIVITY_CODE,
  MOSQUITO_COLLECTION_ACTIVITY_CODE,
  NAMED_EVENT_TRIGGER_TYPE,
  OPENSRP_EVENT_ID_CODE,
  TASK_GENERATION_STATUS_CODE,
  TEAM_ASSIGNMENT_STATUS_CODE,
  TRIGGER,
} from '../../../constants';
import { generateNameSpacedUUID } from '../../../helpers/utils';
import { addPlanDefinition } from '../../../store/ducks/opensrp/PlanDefinition';
import { InterventionType, PlanStatus } from '../../../store/ducks/plans';
import {
  ActionReasonType,
  FIReasonType,
  FIStatusType,
  GoalPriorityType,
  GoalUnit,
  PlanActionCodesType,
  PlanActivityExpression,
  PlanActivityFormFields,
  PlanActivityTitlesType,
  PlanActivityTrigger,
  PlanFormFields,
  PlanJurisdictionFormFields,
  taskGenerationStatusType,
} from './types';

/** Array of FI Statuses */
export const fiStatusCodes = Object.values(FIClassifications).map(e => e.code as FIStatusType);

/** intervention types on which to show action.definitionUri form */
export const showDefinitionUriFor = [
  InterventionType.DynamicFI,
  InterventionType.DynamicIRS,
  InterventionType.DynamicMDA,
  InterventionType.MDALite,
];

/**
 * Check if intervention type id FI or Dynamic FI
 * @param {InterventionType} interventionType - intervention type
 */
export const isFIOrDynamicFI = (interventionType: InterventionType): boolean =>
  [InterventionType.DynamicFI, InterventionType.FI].includes(interventionType);

/** Yup validation schema for PlanForm */
export const PlanSchema = Yup.object().shape({
  activities: Yup.array().of(
    Yup.object().shape({
      actionCode: Yup.string().oneOf(PlanActionCodes.map(e => e)),
      actionDefinitionUri: Yup.string(),
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
  fiReason: Yup.string().when('interventionType', {
    is: value => isFIOrDynamicFI(value),
    otherwise: Yup.string(),
    then: Yup.string()
      .oneOf(FIReasons.map(e => e))
      .required(REQUIRED),
  }),
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
  taskGenerationStatus: Yup.string().oneOf(Object.values(taskGenerationStatuses)),
  teamAssignmentStatus: Yup.string(),
  title: Yup.string().required(REQUIRED),
  version: Yup.string(),
});

/** group plan activities */
export const AllPlanActivities = {
  [InterventionType.FI]: pick(planActivities, [
    BCC_ACTIVITY_CODE,
    BEDNET_DISTRIBUTION_ACTIVITY_CODE,
    BLOOD_SCREENING_ACTIVITY_CODE,
    CASE_CONFIRMATION_ACTIVITY_CODE,
    FAMILY_REGISTRATION_ACTIVITY_CODE,
    LARVAL_DIPPING_ACTIVITY_CODE,
    MOSQUITO_COLLECTION_ACTIVITY_CODE,
  ]),
  [InterventionType.IRS]: pick(planActivities, [IRS_ACTIVITY_CODE]),
  [InterventionType.MDA]: pick(planActivities, [
    MDA_FAMILY_REGISTRATION,
    MDA_DISPENSE_ACTIVITY_CODE,
    MDA_ADHERENCE,
  ]),
  [InterventionType.MDAPoint]: pick(planActivities, [
    MDA_POINT_ADVERSE_EFFECTS_ACTIVITY_CODE,
    MDA_POINT_DISPENSE_ACTIVITY_CODE,
  ]),
  [InterventionType.DynamicFI]: pick(planActivities, [
    DYNAMIC_BCC_ACTIVITY_CODE,
    DYNAMIC_BEDNET_DISTRIBUTION_ACTIVITY_CODE,
    DYNAMIC_BLOOD_SCREENING_ACTIVITY_CODE,
    DYNAMIC_FAMILY_REGISTRATION_ACTIVITY_CODE,
    DYNAMIC_LARVAL_DIPPING_ACTIVITY_CODE,
    DYNAMIC_MOSQUITO_COLLECTION_ACTIVITY_CODE,
  ]),
  [InterventionType.DynamicMDA]: pick(planActivities, [
    DYNAMIC_MDA_COMMUNITY_ADHERENCE_ACTIVITY_CODE,
    DYNAMIC_MDA_COMMUNITY_DISPENSE_ACTIVITY_CODE,
    DYNAMIC_FAMILY_REGISTRATION_ACTIVITY_CODE,
  ]),
  [InterventionType.DynamicIRS]: pick(planActivities, [DYNAMIC_IRS_ACTIVITY_CODE]),
  [InterventionType.IRSLite]: [],
  [InterventionType.MDALite]: pick(planActivities, [CDD_SUPERVISION_ACTIVITY_CODE]),
};

/** group plan activities that should only be considered when editing plan */
export const editOnlyPlanActivities: Dictionary = {
  [InterventionType.DynamicFI]: pick(planActivities, [DYNAMIC_CASE_CONFIRMATION_ACTIVITY_CODE]),
};

/**
 * Convert a plan activity object to an object that can be used in the PlanForm
 * activities section
 * @param activityObj - the plan activity object
 */
export function extractActivityForForm(
  activityObj: PlanActivity,
  interventionType: InterventionType | null = null
): PlanActivityFormFields {
  const planActivitiesToUse = interventionType
    ? AllPlanActivities[interventionType]
    : planActivities;
  const planActivityKey: string =
    findKey(planActivitiesToUse, (a: PlanActivity) => a.action.code === activityObj.action.code) ||
    '';

  const condition: PlanActivityExpression[] = [];
  if (activityObj.action.condition) {
    for (const iterator of activityObj.action.condition) {
      condition.push({
        description: iterator.expression.description || '',
        expression: iterator.expression.expression || '',
        subjectCodableConceptText: (iterator.expression.subjectCodableConcept?.text ||
          '') as subjectCodableConceptType,
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
    actionDefinitionUri: activityObj.action.definitionUri || '',
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
            .add(DEFAULT_ACTIVITY_DURATION_DAYS, DAYS)
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
            .add(DEFAULT_ACTIVITY_DURATION_DAYS, DAYS)
            .toDate(),
    timingPeriodStart:
      activityObj.action.timingPeriod.start && activityObj.action.timingPeriod.start !== ''
        ? parseISO(`${activityObj.action.timingPeriod.start}${DEFAULT_TIME}`)
        : moment().toDate(),
  };
}

export type FormActivity =
  | typeof AllPlanActivities[InterventionType.FI]
  | typeof AllPlanActivities[InterventionType.IRS]
  | typeof AllPlanActivities[InterventionType.MDA]
  | typeof AllPlanActivities[InterventionType.MDAPoint]
  | typeof AllPlanActivities[InterventionType.DynamicFI]
  | typeof AllPlanActivities[InterventionType.DynamicMDA]
  | typeof AllPlanActivities[InterventionType.DynamicIRS]
  | typeof AllPlanActivities[InterventionType.MDALite];

/**
 * Converts a plan activities objects to a list of activities for use on PlanForm
 * @param items - plan activities
 */
export function getFormActivities(
  items: FormActivity,
  interventionType: InterventionType | null = null
) {
  return Object.values(items)
    .sort((a, b) => a.action.prefix - b.action.prefix)
    .map(e => extractActivityForForm(e, interventionType));
}

const planActivitiesMap: Dictionary<PlanActivityFormFields[]> = {};
planActivitiesMap[InterventionType.IRS] = getFormActivities(
  AllPlanActivities[InterventionType.IRS],
  InterventionType.IRS
);
planActivitiesMap[InterventionType.FI] = getFormActivities(
  AllPlanActivities[InterventionType.FI],
  InterventionType.FI
);
planActivitiesMap[InterventionType.MDA] = getFormActivities(
  AllPlanActivities[InterventionType.MDA],
  InterventionType.MDA
);
planActivitiesMap[InterventionType.MDAPoint] = getFormActivities(
  AllPlanActivities[InterventionType.MDAPoint],
  InterventionType.MDAPoint
);
planActivitiesMap[InterventionType.DynamicFI] = getFormActivities(
  AllPlanActivities[InterventionType.DynamicFI],
  InterventionType.DynamicFI
);
planActivitiesMap[InterventionType.DynamicIRS] = getFormActivities(
  AllPlanActivities[InterventionType.DynamicIRS],
  InterventionType.DynamicIRS
);
planActivitiesMap[InterventionType.DynamicMDA] = getFormActivities(
  AllPlanActivities[InterventionType.DynamicMDA],
  InterventionType.DynamicMDA
);
planActivitiesMap[InterventionType.MDALite] = getFormActivities(
  AllPlanActivities[InterventionType.MDALite],
  InterventionType.MDALite
);
export { planActivitiesMap };

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
 * Get all plan activities for a plan intervention type
 * @param {InterventionType} interventionType - plan intervention type
 */
export const getInterventionPlanActivities = (interventionType: InterventionType) => {
  const editOnlyActivities: PlanActivity[] = Object.values(
    editOnlyPlanActivities[interventionType] || {}
  );
  const createOnlyActivities = Object.values(AllPlanActivities[interventionType] || {});
  return [...editOnlyActivities, ...createOnlyActivities];
};

/**
 * Get plan activity object using an action code
 * @param {PlanActionCodesType} actionCode - the action code
 * @param {boolean} isDynamic - whether we are looking for dynamic activities
 */
export function getPlanActivityFromActionCode(
  actionCode: PlanActionCodesType,
  interventionType: InterventionType
): PlanActivity | null {
  const search =
    getInterventionPlanActivities(interventionType).filter(
      item => item.action.code === actionCode
    ) || [];
  return search.length > 0 ? search[0] : null;
}

/**
 * Get the plan definition conditions from form field values
 * @param element - form field values for one plan activity
 */
export const getConditionFromFormField = (
  element: PlanActivityFormFields
): PlanActionCondition[] | undefined => {
  return (
    element.condition &&
    element.condition.map(item => {
      const subjectCodableConcept = {
        text: item.subjectCodableConceptText,
      };
      return {
        expression: {
          ...(item.description && { description: item.description }),
          ...(item.subjectCodableConceptText && { subjectCodableConcept }),
          expression: item.expression,
        },
        kind: APPLICABILITY_CONDITION_KIND,
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
        type: NAMED_EVENT_TRIGGER_TYPE,
      } as PlanActionTrigger;
    })
  );
};

/**
 * check if action code exists on the plans for specified intervention
 * @param {InterventionType} interventionType - plan intervention type
 * @param {PlanActionCodesType} actionCode - plan action code
 */
const interventionHasActionCode = (
  interventionType: InterventionType,
  actionCode: PlanActionCodesType
) => {
  return getInterventionPlanActivities(interventionType).some(
    item => item.action.code === actionCode
  );
};
/**
 * Get action and plans from PlanForm activities
 * @param {PlanActivityFormFields[]} activities - this of activities from PlanForm
 * @param {string} planIdentifier - this plan identifier
 */
export function extractActivitiesFromPlanForm(
  activities: PlanActivityFormFields[],
  interventionType: InterventionType,
  planIdentifier: string = '',
  planObj: PlanDefinition | null = null
) {
  const actions: PlanAction[] = [];
  const goals: PlanGoal[] = [];

  activities.forEach((element, index) => {
    const prefix = index + 1;
    if (
      PlanActionCodes.includes(element.actionCode as PlanActionCodesType) &&
      interventionHasActionCode(interventionType, element.actionCode as PlanActionCodesType)
    ) {
      const planActionGoal = (planObj &&
        getActivityFromPlan(planObj, element.actionCode as PlanActionCodesType)) || {
        action: {},
        goal: {},
      };

      // we must declare them with some value. BCC chosen randomly here
      let thisAction: PlanAction = planActivities.BCC.action;
      let thisGoal: PlanGoal = planActivities.BCC.goal;

      const planActivity = getPlanActivityFromActionCode(
        element.actionCode as PlanActionCodesType,
        interventionType
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
        ...(element.actionDefinitionUri && { definitionUri: element.actionDefinitionUri }),
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
    target.name === INTERVENTION_TYPE_CODE ? target.value : formValues.interventionType;
  const currentFiStatus = target.name === FI_STATUS_CODE ? target.value : formValues.fiStatus;

  let currentJurisdiction = '';
  if (formValues.jurisdictions.length > 0) {
    currentJurisdiction = formValues.jurisdictions[0].name;
  }

  let name = currentInterventionType;
  let title;

  const currentDate = target.name === 'date' ? target.value : formValues.date;
  if (isFIOrDynamicFI(currentInterventionType as InterventionType)) {
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
 * Check if the plan is a dynamic plan
 * @param planObject - the plan
 */
export const isDynamicPlan = <T extends Pick<PlanDefinition, 'action'> = PlanDefinition>(
  planObject: T
) =>
  planObject.action
    .map(action => {
      return Object.keys(action).includes(CONDITION) || Object.keys(action).includes(TRIGGER);
    })
    .includes(true);

/** try to deduce the task generation status value from envs, if cant get a proper valid value
 * return undefined
 * @param - configuredEnv -  env of what the task generation status value should be
 * @param - planDefinition actions , to help deduce if plan is dynamic
 */
export const getTaskGenerationValue = (
  configuredEnv: string | undefined,
  planActions: Pick<PlanDefinition, 'action'>
) => {
  const isDynamic = isDynamicPlan(planActions);
  let taskGenerationStatusValue: taskGenerationStatusType | undefined;
  /** we should probably add a validation check for the envs higher at point of entry */
  taskGenerationStatusValue =
    isDynamic &&
    configuredEnv &&
    Object.values(taskGenerationStatuses).includes(configuredEnv as taskGenerationStatusType)
      ? (configuredEnv as taskGenerationStatusType)
      : undefined;
  return taskGenerationStatusValue;
};

/**
 * Generate an OpenSRP plan definition object from the PlanForm
 * @param formValue - the value gotten from the PlanForm
 * @returns {PlanDefinition} - the plan definition object
 */
export function generatePlanDefinition(
  formValue: PlanFormFields,
  planObj: PlanDefinition | null = null,
  isEditMode: boolean = false
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

  const actionAndGoals = extractActivitiesFromPlanForm(
    formValue.activities,
    formValue.interventionType,
    planObj ? planObj.identifier : '',
    planObj
  );

  const taskGenerationStatusValue =
    getTaskGenerationValue(TASK_GENERATION_STATUS, actionAndGoals) ??
    formValue.taskGenerationStatus;

  const useContext: UseContext[] = [
    {
      code: INTERVENTION_TYPE_CODE,
      valueCodableConcept: formValue.interventionType,
    },
  ];

  if (formValue.fiStatus) {
    useContext.push({ code: FI_STATUS_CODE, valueCodableConcept: formValue.fiStatus });
  }

  if (formValue.fiReason && isFIOrDynamicFI(formValue.interventionType)) {
    useContext.push({ code: FI_REASON_CODE, valueCodableConcept: formValue.fiReason });
  }

  if (formValue.caseNum) {
    useContext.push({ code: CASE_NUMBER_CODE, valueCodableConcept: formValue.caseNum });
  }

  if (formValue.opensrpEventId) {
    useContext.push({ code: OPENSRP_EVENT_ID_CODE, valueCodableConcept: formValue.opensrpEventId });
  }
  const generateTasksInOpensrp = OPENSRP_GENERATED_TASKS_INTERVENTIONS.includes(
    formValue.interventionType
  );
  if (
    (formValue.taskGenerationStatus &&
      formValue.taskGenerationStatus !== taskGenerationStatuses.ignore &&
      (taskGenerationStatusValue !== taskGenerationStatuses.ignore || isEditMode)) ||
    generateTasksInOpensrp
  ) {
    let valueCodableConcept: taskGenerationStatusType = generateTasksInOpensrp
      ? INTERNAL
      : taskGenerationStatusValue;
    valueCodableConcept = isEditMode ? formValue.taskGenerationStatus : valueCodableConcept;
    useContext.push({
      code: TASK_GENERATION_STATUS_CODE,
      valueCodableConcept,
    });
  }

  if (formValue.teamAssignmentStatus && formValue.teamAssignmentStatus.trim() && isEditMode) {
    useContext.push({
      code: TEAM_ASSIGNMENT_STATUS_CODE,
      valueCodableConcept: formValue.teamAssignmentStatus,
    });
  }

  return {
    ...actionAndGoals, // action and goal
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
  const teamAssignmentStatusContext = [];

  for (const context of planObject.useContext) {
    switch (context.code) {
      case INTERVENTION_TYPE_CODE:
        typeUseContext.push(context);
        break;
      case FI_REASON_CODE:
        reasonUseContext.push(context);
        break;
      case FI_STATUS_CODE:
        statusUseContext.push(context);
        break;
      case OPENSRP_EVENT_ID_CODE:
        eventIdUseContext.push(context);
        break;
      case CASE_NUMBER_CODE:
        caseNumUseContext.push(context);
        break;
      case TASK_GENERATION_STATUS_CODE:
        taskGenerationStatusContext.push(context);
        break;
      case TEAM_ASSIGNMENT_STATUS_CODE:
        teamAssignmentStatusContext.push(context);
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
        const currentActivity = extractActivityForForm(
          {
            action: currentAction,
            goal: currentGoal,
          },
          interventionType
        );
        accumulator.push(currentActivity);
      });

      return accumulator;
    },
    []
  );

  if (activities.length < 1) {
    if (planActivitiesMap.hasOwnProperty(interventionType)) {
      activities = planActivitiesMap[interventionType];
    }
  }

  const taskGenerationStatus: taskGenerationStatusType =
    taskGenerationStatusContext.length > 0
      ? (taskGenerationStatusContext[0].valueCodableConcept as taskGenerationStatusType)
      : isDynamicPlan(planObject)
      ? taskGenerationStatuses.ignore
      : taskGenerationStatuses.False;

  const teamAssignmentStatus: string =
    teamAssignmentStatusContext.length > 0
      ? teamAssignmentStatusContext[0].valueCodableConcept
      : '';

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
    teamAssignmentStatus,
    title: planObject.title,
    version: planObject.version,
  };
}

/**
 * Get goal unit from action code
 * @param {PlanActionCodesType} actionCode - the plan action code
 */
export function getGoalUnitFromActionCode(
  actionCode: PlanActionCodesType,
  interventionType: InterventionType
): GoalUnit {
  const planActivity = getPlanActivityFromActionCode(actionCode, interventionType);
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
  DISPLAYED_PLAN_TYPES.includes(planType);

/**
 * Check if plan type should be created and display all plan types on edit mode
 * @param {InterventionType} planType - plan type
 * @param {boolean} isEditMode - are we editing or creating a plan
 */
export const displayPlanTypeOnForm = (planType: InterventionType, isEditMode: boolean): boolean =>
  isEditMode || PLAN_TYPES_ALLOWED_TO_CREATE.includes(planType);

/**
 * Handle after form successful submission to the api
 * @param setSubmitting
 * @param setAreWeDoneHere
 * @param payload
 * @param addPlan
 */
export const onSubmitSuccess = (
  setSubmitting: (isSubmitting: boolean) => void,
  setAreWeDoneHere: React.Dispatch<React.SetStateAction<boolean>>,
  payload: PlanDefinition,
  addPlan?: typeof addPlanDefinition
) => {
  if (addPlan) {
    addPlan(payload);
  }

  setSubmitting(false);
  setAreWeDoneHere(true);
};
