import {
  actionReasons,
  FIReasons,
  FIStatuses,
  goalPriorities,
  PlanActionCodes,
  PlanActivity,
  PlanActivityTitles,
  taskGenerationStatuses,
  useContextCodes,
} from '../../../configs/settings';

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
export type taskGenerationStatusType = typeof taskGenerationStatuses[number];

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
