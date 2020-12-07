import {
  actionReasons,
  FIReasons,
  FIStatuses,
  goalPriorities,
  PlanActionCodes,
  PlanActivity,
  PlanActivityTitles,
  PlanDefinition,
  subjectCodableConceptType,
  taskGenerationStatuses,
  useContextCodes,
} from '../../../configs/settings';
import { InterventionType, PlanStatus } from '../../../store/ducks/plans';

/** FI Status type */
export type FIStatusType = typeof FIStatuses[number];

/** FI Reason type */
export type FIReasonType = typeof FIReasons[number];

/** Goal priority type */
export type GoalPriorityType = typeof goalPriorities[number];

/** Action reason type */
export type ActionReasonType = typeof actionReasons[number];

/** Use context codes type */
export type UseContextCodesType = typeof useContextCodes[number];

/** Plan action codes type */
export type PlanActionCodesType = typeof PlanActionCodes[number];

/** Task generation status type */
export type taskGenerationStatusType = keyof typeof taskGenerationStatuses;

/** Plan activity title type */
export type PlanActivityTitlesType = typeof PlanActivityTitles[number];

/** Plan activities type */
export type PlanActivities = { [K in PlanActivityTitlesType]: PlanActivity };

/** Enum representing the possible goal unitss */
export enum GoalUnit {
  ACTIVITY = 'activit(y|ies)',
  CASE = 'case(s)',
  PERCENT = 'Percent',
  PERSON = 'Person(s)',
  UNKNOWN = 'unknown',
}

/** Interface for Plan activity expression */
export interface PlanActivityExpression {
  description: string;
  expression: string;
  subjectCodableConceptText: subjectCodableConceptType;
}

/** Interface for Plan activity trigger */
export interface PlanActivityTrigger {
  description?: string;
  expression?: string;
  name: string;
}

/** Plan activity form fields interface */
export interface PlanActivityFormFields {
  actionCode: string;
  actionDefinitionUri?: string;
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
  teamAssignmentStatus?: string;
  title: string;
  version: string;
}

/** type of function to be called with payload before submission */
export type BeforeSubmit = (payload: PlanDefinition) => boolean;
