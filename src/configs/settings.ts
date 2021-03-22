/** This is the main configuration module
 *
 * **** IMPORT RULES ****
 * To avoid circular imports or anything of that nature, the only imports from the Reveal
 * code base allowed in this module are from the following modules:
 *  - constants
 *  - envs
 *  - colors
 *  - types
 *
 * **** CODE RULES ****
 * To keep things simple, the code in this module should be simple statements.  Use of
 * functions is discouraged and should only be done if there is no other way.
 */
import { Providers } from '@onaio/gatekeeper';
import { Color } from 'csstype';
import { Expression, LngLatBoundsLike } from 'mapbox-gl';
import {
  ActionReasonType,
  GoalPriorityType,
  GoalUnit,
  PlanActionCodesType,
  PlanActivities,
  UseContextCodesType,
} from '../components/forms/PlanForm/types';
import { NOT_AVAILABLE } from '../components/TreeWalker/constants';
import {
  A1_DESCRIPTION,
  A1_NAME,
  A2_DESCRIPTION,
  A2_NAME,
  B1_DESCRIPTION,
  B1_NAME,
  B2_DESCRIPTION,
  B2_NAME,
  BCC_ACTIVITY,
  BCC_ACTIVITY_DESCRIPTION,
  BCC_GOAL_DESCRIPTION,
  BCC_GOAL_MEASURE,
  BEDNET_ACTIVITY,
  BEDNET_ACTIVITY_DESCRIPTION,
  BEDNET_GOAL_MEASURE,
  BLOOD_SCREENING_ACTIVITY,
  BLOOD_SCREENING_ACTIVITY_DESCRIPTION,
  BLOOD_SCREENING_GOAL_MEASURE,
  CANTON,
  CASE_CLASSIFICATION_HEADER,
  CASE_CONFIRMATION_ACTIVITY,
  CASE_CONFIRMATION_ACTIVITY_DESCRIPTION,
  CASE_CONFIRMATION_ACTIVITY_GOAL_MEASURE,
  CASE_NOTIF_DATE_HEADER,
  CASE_TRIGGERED_TITLE,
  CDD_SUPERVISION_ACTIVITY,
  CDD_SUPERVISION_ACTIVITY_DESCRIPTION,
  CDD_SUPERVISION_EXPRESSION_DESCRIPTION,
  CDD_SUPERVISION_GOAL_DESCRIPTION,
  CDD_SUPERVISION_GOAL_MEASURE,
  DATE_COMPLETED,
  DEFAULT,
  DISTRICT,
  END_DATE,
  FI_STATUS,
  FOCUS_AREA_HEADER,
  GOAL_UNIT_ACTIVITY,
  GOAL_UNIT_CASE,
  GOAL_UNIT_PERCENT,
  GOAL_UNIT_PERSON,
  GOAL_UNIT_UNKNOWN,
  HIGH_PRIORITIY_LABEL,
  INVESTIGATION as INVESTIGATION_TITLE,
  IRS_ACTIVITY,
  IRS_ACTIVITY_DESCRIPTION,
  IRS_GOAL_DESCRIPTION,
  IRS_GOAL_MEASURE,
  IRS_GREEN_THRESHOLD,
  IRS_GREY_THRESHOLD,
  IRS_ORANGE_THRESHOLD,
  IRS_RED_THRESHOLD,
  IRS_YELLOW_THRESHOLD,
  LARVAL_DIPPING_ACTIVITY,
  LARVAL_DIPPING_ACTIVITY_DESCRIPTION,
  LARVAL_DIPPING_GOAL_MEASURE,
  LOW_PRIORITY_LABEL,
  MDA_ADHERENCE_DESCRIPTION,
  MDA_DISPENSE_ACTIVITY_DESCRIPTION,
  MDA_POINT_ADVERSE_EFFECT_ACTIVITY_DESCRIPTION,
  MDA_POINT_ADVERSE_EFFECT_COLLECTION_GOAL,
  MDA_POINT_DISPENSE_ACTIVITY_DESCRIPTION,
  MDA_POINT_DISPENSE_COLLECTION_GOAL,
  MEDIUM_PRIORITY_LABEL,
  MOSQUITO_COLLECTION_ACTIVITY,
  MOSQUITO_COLLECTION_ACTIVITY_DESCRIPTION,
  MOSQUITO_COLLECTION_GOAL_MEASURE,
  NAME,
  NOT_AVAILABLE_LABEL,
  PLAN_STATUS_ACTIVE,
  PLAN_STATUS_COMPLETE,
  PLAN_STATUS_DRAFT,
  PLAN_STATUS_RETIRED,
  PROVINCE,
  REGISTER_FAMILY_ACTIVITY,
  REGISTER_FAMILY_ACTIVITY_DESCRIPTION,
  REGISTER_FAMILY_ACTIVITY_GOAL_MEASURE,
  ROUTINE_TITLE,
  SHORT,
  START_DATE,
  STATUS_HEADER,
  TALL,
  VILLAGE,
} from '../configs/lang';
import {
  A1,
  A2,
  APPLICABILITY_CONDITION_KIND,
  B1,
  B2,
  BCC_ACTIVITY_CODE,
  BCC_CODE,
  BEDNET_DISTRIBUTION_ACTIVITY_CODE,
  BEDNET_DISTRIBUTION_CODE,
  BLOOD_SCREENING_ACTIVITY_CODE,
  BLOOD_SCREENING_CODE,
  CASE_CONFIRMATION_ACTIVITY_CODE,
  CASE_CONFIRMATION_CODE,
  CASE_NUMBER_CODE,
  CASE_TRIGGERED,
  CDD_SUPERVISION_ACTIVITY_CODE,
  CDD_SUPERVISION_CODE,
  CREATE_TYPE,
  DISABLED,
  DYNAMIC_BCC_ACTIVITY_CODE,
  DYNAMIC_BEDNET_DISTRIBUTION_ACTIVITY_CODE,
  DYNAMIC_BLOOD_SCREENING_ACTIVITY_CODE,
  DYNAMIC_FAMILY_REGISTRATION_ACTIVITY_CODE,
  DYNAMIC_IRS_ACTIVITY_CODE,
  DYNAMIC_LARVAL_DIPPING_ACTIVITY_CODE,
  DYNAMIC_MDA_COMMUNITY_ADHERENCE_ACTIVITY_CODE,
  DYNAMIC_MDA_COMMUNITY_DISPENSE_ACTIVITY_CODE,
  DYNAMIC_MOSQUITO_COLLECTION_ACTIVITY_CODE,
  FALSE,
  FAMILY_REGISTRATION_ACTIVITY_CODE,
  FI_REASON_CODE,
  FI_STATUS_CODE,
  HIGH_PRIORITIY,
  IGNORE,
  INTERNAL,
  INTERVENTION_TYPE_CODE,
  INVESTIGATION,
  IRS_ACTIVITY_CODE,
  IRS_CODE,
  LARVAL_DIPPING_ACTIVITY_CODE,
  LARVAL_DIPPING_CODE,
  LOW_PRIORITY,
  MDA_ADHERENCE,
  MDA_ADHERENCE_CODE,
  MDA_DISPENSE_ACTIVITY_CODE,
  MDA_FAMILY_REGISTRATION,
  MDA_POINT_ADVERSE_EFFECTS_ACTIVITY_CODE,
  MDA_POINT_ADVERSE_EFFECTS_CODE,
  MDA_POINT_DISPENSE_ACTIVITY_CODE,
  MDA_POINT_DISPENSE_CODE,
  MEDIUM_PRIORITY,
  MOSQUITO_COLLECTION_ACTIVITY_CODE,
  MOSQUITO_COLLECTION_CODE,
  NAMED_EVENT_TRIGGER_TYPE,
  OPENSRP_EVENT_ID_CODE,
  PLAN_ACTIVATION_TRIGGER_NAME,
  RACD_REGISTER_FAMILY_CODE,
  ROUTINE,
  TASK_GENERATION_STATUS_CODE,
  TEAM_ASSIGNMENT_STATUS_CODE,
  TRUE,
} from '../constants';
import {
  AUTO_SELECT_FI_CLASSIFICATION,
  DOMAIN_NAME,
  ENABLE_ONADATA_OAUTH,
  ENABLE_OPENSRP_OAUTH,
  ONADATA_ACCESS_TOKEN_URL,
  ONADATA_AUTHORIZATION_URL,
  ONADATA_CLIENT_ID,
  ONADATA_OAUTH_STATE,
  ONADATA_USER_URL,
  OPENSRP_ACCESS_TOKEN_URL,
  OPENSRP_AUTHORIZATION_URL,
  OPENSRP_CLIENT_ID,
  OPENSRP_OAUTH_STATE,
  OPENSRP_USER_URL,
} from './env';
import { JurisdictionTypes } from './types';

/** Interfaces */

/** Interface for a Focus Investigation Classification */
export interface Classification {
  code: string;
  name: string;
  description: string;
}

/** Interface that describes location items */
export interface LocationItem {
  identifier: string /** Should match the name of the column in data */;
  level: number /** The HDX-compliant level of the location in the hierarchy */;
  name: string /** The name of the location */;
}

/** Authentication Configs */
const providers: Providers = {};

if (ENABLE_OPENSRP_OAUTH) {
  providers.OpenSRP = {
    accessTokenUri: OPENSRP_ACCESS_TOKEN_URL,
    authorizationUri: OPENSRP_AUTHORIZATION_URL,
    clientId: OPENSRP_CLIENT_ID,
    redirectUri: `${DOMAIN_NAME}/oauth/callback/OpenSRP/`,
    scopes: ['read', 'write'],
    state: OPENSRP_OAUTH_STATE,
    userUri: OPENSRP_USER_URL,
  };
}

if (ENABLE_ONADATA_OAUTH) {
  providers.Ona = {
    accessTokenUri: ONADATA_ACCESS_TOKEN_URL,
    authorizationUri: ONADATA_AUTHORIZATION_URL,
    clientId: ONADATA_CLIENT_ID,
    redirectUri: `${DOMAIN_NAME}/oauth/callback/Ona/`,
    scopes: ['read', 'write'],
    state: ONADATA_OAUTH_STATE,
    userUri: ONADATA_USER_URL,
  };
}

export { providers };

/** Location configs */

/** Location item hierarchy
 * This is a list of locations.  The "level" field will be used to sort the
 * locations hierarchically, from lowest to highest.
 */
export const locationHierarchy: LocationItem[] = [
  {
    identifier: 'province',
    level: 1,
    name: PROVINCE,
  },
  {
    identifier: 'district',
    level: 2,
    name: DISTRICT,
  },
  {
    identifier: 'canton',
    level: 3,
    name: CANTON,
  },
  {
    identifier: 'village',
    level: 4,
    name: VILLAGE,
  },
];

/** Focus investigation configs */

/**
 * You'll notice we are disabling no-useless-cast in a number of places like the next
 * line.  This is because we want the Typescript compiler to be forced to use const contexts
 * e.g.
 * we want:
 *  const FIStatuses: readonly ["A1", "A2", "B1", "B2"]
 * instead of merely:
 *  const FIStatuses: string[]
 */

/** Allowed FI Status values */
/* tslint:disable-next-line no-useless-cast */
export const FIStatuses = [A1, A2, B1, B2] as const;

/** Allowed FI Status values */
/* tslint:disable-next-line no-useless-cast */
export const FIReasons = [ROUTINE, CASE_TRIGGERED] as const;
export const FIReasonsDisplay: { [key: string]: string } = {
  [ROUTINE]: ROUTINE_TITLE,
  [CASE_TRIGGERED]: CASE_TRIGGERED_TITLE,
};
export const planStatusDisplay: { [key: string]: string } = {
  active: PLAN_STATUS_ACTIVE,
  complete: PLAN_STATUS_COMPLETE,
  draft: PLAN_STATUS_DRAFT,
  retired: PLAN_STATUS_RETIRED,
};
export const goalUnitDisplay: { [key: string]: string } = {
  ['activit(y|ies)']: GOAL_UNIT_ACTIVITY,
  ['case(s)']: GOAL_UNIT_CASE,
  ['Percent']: GOAL_UNIT_PERCENT,
  ['Person(s)']: GOAL_UNIT_PERSON,
  ['unknown']: GOAL_UNIT_UNKNOWN,
};

/** Allowed goal priority values */
/* tslint:disable-next-line no-useless-cast */
export const goalPriorities = [LOW_PRIORITY, MEDIUM_PRIORITY, HIGH_PRIORITIY] as const;
export const goalPrioritiesDisplay: { [key: string]: string } = {
  [LOW_PRIORITY]: LOW_PRIORITY_LABEL,
  [MEDIUM_PRIORITY]: MEDIUM_PRIORITY_LABEL,
  [HIGH_PRIORITIY]: HIGH_PRIORITIY_LABEL,
};

/** Allowed action Reason values */
/* tslint:disable-next-line no-useless-cast */
export const actionReasons = [INVESTIGATION, ROUTINE] as const;

export const actionReasonsDisplay: { [key: string]: string } = {
  [INVESTIGATION]: INVESTIGATION_TITLE,
  [ROUTINE]: ROUTINE_TITLE,
};

/** Allowed useContext Code values */
/* tslint:disable-next-line no-useless-cast */
export const useContextCodes = [
  INTERVENTION_TYPE_CODE,
  FI_STATUS_CODE,
  FI_REASON_CODE,
  OPENSRP_EVENT_ID_CODE,
  CASE_NUMBER_CODE,
  TASK_GENERATION_STATUS_CODE,
  TEAM_ASSIGNMENT_STATUS_CODE,
] as const;

/** Plan activity code values */
/* tslint:disable-next-line no-useless-cast */
export const PlanActionCodes = [
  BCC_CODE,
  IRS_CODE,
  BEDNET_DISTRIBUTION_CODE,
  BLOOD_SCREENING_CODE,
  CASE_CONFIRMATION_CODE,
  RACD_REGISTER_FAMILY_CODE,
  LARVAL_DIPPING_CODE,
  MOSQUITO_COLLECTION_CODE,
  MDA_ADHERENCE_CODE,
  MDA_POINT_DISPENSE_CODE,
  MDA_POINT_ADVERSE_EFFECTS_CODE,
  CDD_SUPERVISION_CODE,
] as const;

/** Allowed taskGenerationStatus values */
/* tslint:disable-next-line no-useless-cast */
export const taskGenerationStatuses = {
  [FALSE]: FALSE,
  [TRUE]: TRUE,
  [DISABLED]: DISABLED,
  [IGNORE]: IGNORE,
  [INTERNAL]: INTERNAL,
} as const;

/** Plan Action Timing Period */
export interface PlanActionTimingPeriod {
  end: string;
  start: string;
}

/** plan action subjectCodableConcept text type  */
export type subjectCodableConceptType =
  | 'Family'
  | 'Person'
  | 'Location'
  | 'Jurisdiction'
  | 'Residential_Structure';

/** Plan Action subjectCodableConcept */
export interface PlanActionsubjectCodableConcept {
  text: subjectCodableConceptType;
}

/** Plan Expression */
export interface PlanExpression {
  description?: string;
  expression: string;
  name?: string;
  reference?: string;
  subjectCodableConcept?: PlanActionsubjectCodableConcept;
}

/** Plan Action Trigger */
export interface PlanActionTrigger {
  expression?: PlanExpression;
  name: string;
  type: Readonly<'named-event'>;
}

/** Plan Action Condition */
export interface PlanActionCondition {
  expression: PlanExpression;
  kind: Readonly<'applicability'>;
}

/** Plan Action */
export interface PlanAction {
  code: PlanActionCodesType;
  condition?: PlanActionCondition[];
  definitionUri?: string;
  description: string;
  goalId: string;
  identifier: string;
  prefix: number;
  reason: ActionReasonType;
  subjectCodableConcept: PlanActionsubjectCodableConcept;
  taskTemplate?: string;
  timingPeriod: PlanActionTimingPeriod;
  title: string;
  trigger?: PlanActionTrigger[];
  type?: string;
}

/** Plan Goal detailQuantity */
export interface PlanGoaldetailQuantity {
  comparator: '>=' | '<=';
  unit: GoalUnit;
  value: number;
}

/** Plan Goal Detail */
export interface PlanGoalDetail {
  detailQuantity: PlanGoaldetailQuantity;
}

/** Plan Goal Target */
export interface PlanGoalTarget {
  due: string;
  detail: PlanGoalDetail;
  measure: string;
}

/** Plan Goal */
export interface PlanGoal {
  description: string;
  id: string;
  priority: GoalPriorityType;
  target: PlanGoalTarget[];
}

/** Plan Activity */
export interface PlanActivity {
  action: PlanAction;
  goal: PlanGoal;
}

/** Plan activity title values */
/* tslint:disable-next-line no-useless-cast */
export const PlanActivityTitles = [
  CASE_CONFIRMATION_ACTIVITY_CODE,
  FAMILY_REGISTRATION_ACTIVITY_CODE,
  BLOOD_SCREENING_ACTIVITY_CODE,
  BEDNET_DISTRIBUTION_ACTIVITY_CODE,
  LARVAL_DIPPING_ACTIVITY_CODE,
  MOSQUITO_COLLECTION_ACTIVITY_CODE,
  BCC_ACTIVITY_CODE,
  IRS_ACTIVITY_CODE,
  MDA_POINT_DISPENSE_ACTIVITY_CODE,
  MDA_POINT_ADVERSE_EFFECTS_ACTIVITY_CODE,
  DYNAMIC_FAMILY_REGISTRATION_ACTIVITY_CODE,
  DYNAMIC_BLOOD_SCREENING_ACTIVITY_CODE,
  DYNAMIC_BEDNET_DISTRIBUTION_ACTIVITY_CODE,
  DYNAMIC_LARVAL_DIPPING_ACTIVITY_CODE,
  DYNAMIC_MOSQUITO_COLLECTION_ACTIVITY_CODE,
  DYNAMIC_BCC_ACTIVITY_CODE,
  DYNAMIC_IRS_ACTIVITY_CODE,
  DYNAMIC_MDA_COMMUNITY_DISPENSE_ACTIVITY_CODE,
  DYNAMIC_MDA_COMMUNITY_ADHERENCE_ACTIVITY_CODE,
  MDA_ADHERENCE,
  MDA_FAMILY_REGISTRATION,
  MDA_DISPENSE_ACTIVITY_CODE,
  CDD_SUPERVISION_ACTIVITY_CODE,
] as const;

/** default plan activities */
export const planActivities: PlanActivities = {
  BCC: {
    action: {
      code: BCC_CODE,
      description: BCC_ACTIVITY_DESCRIPTION,
      goalId: 'BCC_Focus',
      identifier: '',
      prefix: 99,
      reason: INVESTIGATION,
      subjectCodableConcept: {
        text: 'Jurisdiction',
      },
      taskTemplate: 'BCC_Focus',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: BCC_ACTIVITY,
    },
    goal: {
      description: BCC_GOAL_DESCRIPTION,
      id: 'BCC_Focus',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 1,
            },
          },
          due: '',
          measure: BCC_GOAL_MEASURE,
        },
      ],
    },
  },
  CDDSupervision: {
    action: {
      code: CDD_SUPERVISION_CODE,
      condition: [
        {
          expression: {
            description: CDD_SUPERVISION_EXPRESSION_DESCRIPTION,
            expression: '$this.is(FHIR.Location)',
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
      ],
      definitionUri: 'community_drug_distributor_supervisor_daily_summary_form.json',
      description: CDD_SUPERVISION_ACTIVITY_DESCRIPTION,
      goalId: 'CDD_Supervision',
      identifier: '',
      prefix: 1,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Location',
      },
      timingPeriod: {
        end: '',
        start: '',
      },
      title: CDD_SUPERVISION_ACTIVITY,
      trigger: [
        {
          name: PLAN_ACTIVATION_TRIGGER_NAME,
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
      ],
      type: CREATE_TYPE,
    },
    goal: {
      description: CDD_SUPERVISION_GOAL_DESCRIPTION,
      id: 'CDD_Supervision',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '',
          measure: CDD_SUPERVISION_GOAL_MEASURE,
        },
      ],
    },
  },
  IRS: {
    action: {
      code: IRS_CODE,
      description: IRS_ACTIVITY_DESCRIPTION,
      goalId: 'IRS',
      identifier: '',
      prefix: 7,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'Spray_Structures',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: IRS_ACTIVITY,
    },
    goal: {
      description: IRS_GOAL_DESCRIPTION,
      id: 'IRS',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 90,
            },
          },
          due: '',
          measure: IRS_GOAL_MEASURE,
        },
      ],
    },
  },
  MDAAdherence: {
    action: {
      code: MDA_ADHERENCE_CODE,
      description: MDA_ADHERENCE_DESCRIPTION,
      goalId: 'MDA_Adherence',
      identifier: '',
      prefix: 3,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Person',
      },
      taskTemplate: 'MDA_Adherence',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: MDA_ADHERENCE_CODE,
      type: CREATE_TYPE,
    },
    goal: {
      description: MDA_ADHERENCE_DESCRIPTION,
      id: 'MDA_Adherence',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '',
          measure: 'Percent of dispense recipients',
        },
      ],
    },
  },
  MDADispenseCode: {
    action: {
      code: MDA_POINT_DISPENSE_CODE,
      description: MDA_DISPENSE_ACTIVITY_DESCRIPTION,
      goalId: 'MDA_Dispense',
      identifier: '',
      prefix: 2,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Person',
      },
      taskTemplate: 'MDA_Dispense',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: MDA_POINT_DISPENSE_CODE,
      type: CREATE_TYPE,
    },
    goal: {
      description: MDA_DISPENSE_ACTIVITY_DESCRIPTION,
      id: 'MDA_Dispense',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '',
          measure: 'Percent of Registered person(s)',
        },
      ],
    },
  },
  MDAFamilyRegistration: {
    action: {
      code: RACD_REGISTER_FAMILY_CODE,
      description: REGISTER_FAMILY_ACTIVITY_DESCRIPTION,
      goalId: 'RACD_register_families',
      identifier: '',
      prefix: 1,
      reason: INVESTIGATION,
      subjectCodableConcept: {
        text: 'Residential_Structure',
      },
      taskTemplate: 'RACD_register_families',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: REGISTER_FAMILY_ACTIVITY,
      type: CREATE_TYPE,
    },
    goal: {
      description: REGISTER_FAMILY_ACTIVITY_DESCRIPTION,
      id: 'RACD_register_families',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '',
          measure: REGISTER_FAMILY_ACTIVITY_GOAL_MEASURE,
        },
      ],
    },
  },
  bednetDistribution: {
    action: {
      code: BEDNET_DISTRIBUTION_CODE,
      description: BEDNET_ACTIVITY_DESCRIPTION,
      goalId: 'RACD_bednet_distribution',
      identifier: '',
      prefix: 4,
      reason: INVESTIGATION,
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'Bednet_Distribution',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: BEDNET_ACTIVITY,
    },
    goal: {
      description: BEDNET_ACTIVITY_DESCRIPTION,
      id: 'RACD_bednet_distribution',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '',
          measure: BEDNET_GOAL_MEASURE,
        },
      ],
    },
  },
  bloodScreening: {
    action: {
      code: BLOOD_SCREENING_CODE,
      description: BLOOD_SCREENING_ACTIVITY_DESCRIPTION,
      goalId: 'RACD_Blood_Screening',
      identifier: '',
      prefix: 3,
      reason: INVESTIGATION,
      subjectCodableConcept: {
        text: 'Person',
      },
      taskTemplate: 'RACD_Blood_Screening',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: BLOOD_SCREENING_ACTIVITY,
    },
    goal: {
      description: BLOOD_SCREENING_ACTIVITY_DESCRIPTION,
      id: 'RACD_Blood_Screening',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERSON,
              value: 100,
            },
          },
          due: '',
          measure: BLOOD_SCREENING_GOAL_MEASURE,
        },
      ],
    },
  },
  caseConfirmation: {
    action: {
      code: CASE_CONFIRMATION_CODE,
      description: CASE_CONFIRMATION_ACTIVITY_DESCRIPTION,
      goalId: 'Case_Confirmation',
      identifier: '',
      prefix: 1,
      reason: INVESTIGATION,
      subjectCodableConcept: {
        text: 'Jurisdiction',
      },
      taskTemplate: 'Case_Confirmation',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: CASE_CONFIRMATION_ACTIVITY,
    },
    goal: {
      description: CASE_CONFIRMATION_ACTIVITY_DESCRIPTION,
      id: 'Case_Confirmation',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.CASE,
              value: 1,
            },
          },
          due: '',
          measure: CASE_CONFIRMATION_ACTIVITY_GOAL_MEASURE,
        },
      ],
    },
  },
  dynamicBCC: {
    action: {
      code: BCC_CODE,
      condition: [
        {
          expression: {
            description: 'Jurisdiction type location',
            expression: "Location.physicalType.text = 'jdn'",
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
      ],
      definitionUri: 'behaviour_change_communication.json',
      description: BCC_ACTIVITY_DESCRIPTION,
      goalId: 'BCC_Focus',
      identifier: '',
      prefix: 101,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Jurisdiction',
      },
      timingPeriod: {
        end: '',
        start: '',
      },
      title: BCC_ACTIVITY,
      trigger: [
        {
          name: PLAN_ACTIVATION_TRIGGER_NAME,
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
      ],
      type: CREATE_TYPE,
    },
    goal: {
      description: BCC_GOAL_DESCRIPTION,
      id: 'BCC_Focus',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 1,
            },
          },
          due: '',
          measure: BCC_GOAL_MEASURE,
        },
      ],
    },
  },
  dynamicBednetDistribution: {
    action: {
      code: BEDNET_DISTRIBUTION_CODE,
      condition: [
        {
          expression: {
            description: 'Structure is residential or type does not exist',
            expression:
              "$this.is(FHIR.QuestionnaireResponse) or (($this.type.where(id='locationType').exists().not() or $this.type.where(id='locationType').text = 'Residential Structure') and $this.contained.exists())",
            subjectCodableConcept: {
              text: 'Family',
            },
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
      ],
      definitionUri: 'bednet_distribution.json',
      description: BEDNET_ACTIVITY_DESCRIPTION,
      goalId: 'RACD_bednet_distribution',
      identifier: '',
      prefix: 4,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Location',
      },
      timingPeriod: {
        end: '',
        start: '',
      },
      title: BEDNET_ACTIVITY,
      trigger: [
        {
          name: PLAN_ACTIVATION_TRIGGER_NAME,
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
        {
          expression: {
            description: 'Trigger when a Family Registration event is submitted',
            expression: "questionnaire = 'Family_Registration'",
          },
          name: 'event-submission',
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
      ],
      type: CREATE_TYPE,
    },
    goal: {
      description: BEDNET_ACTIVITY_DESCRIPTION,
      id: 'RACD_bednet_distribution',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '',
          measure: BEDNET_GOAL_MEASURE,
        },
      ],
    },
  },
  dynamicBloodScreening: {
    action: {
      code: BLOOD_SCREENING_CODE,
      condition: [
        {
          expression: {
            description:
              'Person is older than 5 years or person associated with questionnaire response if older than 5 years',
            expression:
              "($this.is(FHIR.Patient) and $this.birthDate <= today() - 5 'years') or ($this.contained.where(Patient.birthDate <= today() - 5 'years').exists())",
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
      ],
      definitionUri: 'blood_screening.json',
      description: BLOOD_SCREENING_ACTIVITY_DESCRIPTION,
      goalId: 'RACD_Blood_Screening',
      identifier: '',
      prefix: 3,
      reason: INVESTIGATION,
      subjectCodableConcept: {
        text: 'Person',
      },
      timingPeriod: {
        end: '',
        start: '',
      },
      title: BLOOD_SCREENING_ACTIVITY,
      trigger: [
        {
          name: PLAN_ACTIVATION_TRIGGER_NAME,
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
        {
          expression: {
            description: 'Trigger when a Family Member Registration event is submitted',
            expression: "questionnaire = 'Family_Member_Registration'",
          },
          name: 'event-submission',
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
      ],
      type: CREATE_TYPE,
    },
    goal: {
      description: BLOOD_SCREENING_ACTIVITY_DESCRIPTION,
      id: 'RACD_Blood_Screening',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERSON,
              value: 100,
            },
          },
          due: '',
          measure: BLOOD_SCREENING_GOAL_MEASURE,
        },
      ],
    },
  },
  dynamicCommunityAdherenceMDA: {
    action: {
      code: MDA_ADHERENCE_CODE,
      condition: [
        {
          expression: {
            description: 'The person fully received the dispense activity',
            expression:
              "$this.item.where(linkId='business_status').answer.value = 'Fully Received'",
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
      ],
      definitionUri: 'mda_adherence.json',
      description:
        'Visit all residential structures (100%) and confirm adherence of each registered person',
      goalId: 'MDA_Adherence',
      identifier: '',
      prefix: 11,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Person',
      },
      timingPeriod: {
        end: '',
        start: '',
      },
      title: MDA_ADHERENCE_CODE,
      trigger: [
        {
          expression: {
            description: 'Trigger when a MDA Dispense event is submitted',
            expression: "questionnaire = 'mda_dispense'",
          },
          name: 'event-submission',
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
      ],
      type: CREATE_TYPE,
    },
    goal: {
      description:
        'Visit all residential structures (100%) and confirm adherence of each registered person',
      id: 'MDA_Adherence',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '',
          measure: 'Percent of dispense recipients',
        },
      ],
    },
  },
  dynamicCommunityDispenseMDA: {
    action: {
      code: MDA_POINT_DISPENSE_CODE,
      condition: [
        {
          expression: {
            description:
              'Person or person associated with questionaire response is older than 5 years and younger than 15 years',
            expression:
              "($this.is(FHIR.Patient) and $this.birthDate <= today() - 5 'years' and $this.birthDate > today() - 15 'years') or ($this.contained.where(Patient.birthDate <= today() - 5 'years' and $this.birthDate > today() - 15 'years').exists())",
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
      ],
      definitionUri: 'mda_dispense.json',
      description:
        'Visit all residential structures (100%) and dispense prophylaxis to each registered person',
      goalId: 'MDA_Dispense',
      identifier: '',
      prefix: 10,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Person',
      },
      timingPeriod: {
        end: '',
        start: '',
      },
      title: 'Distribute Drugs',
      trigger: [
        {
          name: PLAN_ACTIVATION_TRIGGER_NAME,
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
        {
          expression: {
            description:
              'Trigger when a Family Registration or Family Member Registration event is submitted',
            expression:
              "questionnaire = 'Family_Registration' or questionnaire = 'Family_Member_Registration'",
          },
          name: 'event-submission',
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
      ],
      type: CREATE_TYPE,
    },
    goal: {
      description:
        'Visit all residential structures (100%) dispense prophylaxis to each registered person',
      id: 'MDA_Dispense',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 75,
            },
          },
          due: '',
          measure: 'Percent of Registered person(s)',
        },
      ],
    },
  },
  dynamicFamilyRegistration: {
    action: {
      code: RACD_REGISTER_FAMILY_CODE,
      condition: [
        {
          expression: {
            description: 'Structure is residential or type does not exist',
            expression:
              "$this.is(FHIR.QuestionnaireResponse) or (($this.type.where(id='locationType').exists().not() or $this.type.where(id='locationType').text = 'Residential Structure') and $this.contained.exists().not())",
            subjectCodableConcept: {
              text: 'Family',
            },
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
        {
          expression: {
            description: 'Apply to residential structures in Register_Structure questionnaires',
            expression:
              "$this.is(FHIR.Location) or (questionnaire = 'Register_Structure' and $this.item.where(linkId='structureType').answer.value ='Residential Structure')",
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
      ],
      definitionUri: 'family_register.json',
      description: REGISTER_FAMILY_ACTIVITY_DESCRIPTION,
      goalId: 'RACD_register_families',
      identifier: '',
      prefix: 2,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Location',
      },
      timingPeriod: {
        end: '',
        start: '',
      },
      title: REGISTER_FAMILY_ACTIVITY,
      trigger: [
        {
          name: PLAN_ACTIVATION_TRIGGER_NAME,
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
        {
          expression: {
            description: 'Trigger when a Register_Structure event is submitted',
            expression: "questionnaire = 'Register_Structure' or questionnaire = 'Archive_Family'",
          },
          name: 'event-submission',
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
      ],
      type: CREATE_TYPE,
    },
    goal: {
      description: REGISTER_FAMILY_ACTIVITY_DESCRIPTION,
      id: 'RACD_register_families',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '',
          measure: REGISTER_FAMILY_ACTIVITY_GOAL_MEASURE,
        },
      ],
    },
  },
  dynamicIRS: {
    action: {
      code: IRS_CODE,
      condition: [
        {
          expression: {
            description: 'Structure is residential or type does not exist',
            expression:
              "$this.is(FHIR.QuestionnaireResponse) or $this.type.where(id='locationType').exists().not() or $this.type.where(id='locationType').text = 'Residential Structure'",
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
        {
          expression: {
            description: 'Apply to residential structures in Register_Structure questionnaires',
            expression:
              "$this.is(FHIR.Location) or (questionnaire = 'Register_Structure' and $this.item.where(linkId='structureType').answer.value ='Residential Structure')",
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
      ],
      definitionUri: 'spray_form.json',
      description: IRS_ACTIVITY_DESCRIPTION,
      goalId: 'IRS',
      identifier: '',
      prefix: 7,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Location',
      },
      timingPeriod: {
        end: '',
        start: '',
      },
      title: IRS_ACTIVITY,
      trigger: [
        {
          name: PLAN_ACTIVATION_TRIGGER_NAME,
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
        {
          expression: {
            description: 'Trigger when a Register_Structure event is submitted',
            expression: "questionnaire = 'Register_Structure'",
          },
          name: 'event-submission',
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
      ],
      type: CREATE_TYPE,
    },
    goal: {
      description: IRS_GOAL_DESCRIPTION,
      id: 'IRS',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 90,
            },
          },
          due: '',
          measure: IRS_GOAL_MEASURE,
        },
      ],
    },
  },
  dynamicLarvalDipping: {
    action: {
      code: LARVAL_DIPPING_CODE,
      condition: [
        {
          expression: {
            description: 'Structure is a larval breeding site',
            expression:
              "$this.is(FHIR.QuestionnaireResponse) or $this.type.where(id='locationType').text = 'Larval Breeding Site'",
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
        {
          expression: {
            description: 'Apply to larval breeding sites in Register_Structure questionnaires',
            expression:
              "$this.is(FHIR.Location) or (questionnaire = 'Register_Structure' and $this.item.where(linkId='structureType').answer.value ='Larval Breeding Site')",
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
      ],
      definitionUri: 'larval_dipping_form.json',
      description: LARVAL_DIPPING_ACTIVITY_DESCRIPTION,
      goalId: 'Larval_Dipping',
      identifier: '',
      prefix: 5,
      reason: INVESTIGATION,
      subjectCodableConcept: {
        text: 'Location',
      },
      timingPeriod: {
        end: '',
        start: '',
      },
      title: LARVAL_DIPPING_ACTIVITY,
      trigger: [
        {
          name: PLAN_ACTIVATION_TRIGGER_NAME,
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
        {
          expression: {
            description: 'Trigger when a Register_Structure event is submitted',
            expression: "questionnaire = 'Register_Structure'",
          },
          name: 'event-submission',
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
      ],
      type: CREATE_TYPE,
    },
    goal: {
      description: LARVAL_DIPPING_ACTIVITY_DESCRIPTION,
      id: 'Larval_Dipping',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 3,
            },
          },
          due: '',
          measure: LARVAL_DIPPING_GOAL_MEASURE,
        },
      ],
    },
  },
  dynamicMosquitoCollection: {
    action: {
      code: MOSQUITO_COLLECTION_CODE,
      condition: [
        {
          expression: {
            description: 'Structure is a mosquito collection point',
            expression:
              "$this.is(FHIR.QuestionnaireResponse) or $this.type.where(id='locationType').text = 'Mosquito Collection Point'",
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
        {
          expression: {
            description: 'Apply to mosquito collection point in Register_Structure questionnaires',
            expression:
              "$this.is(FHIR.Location) or (questionnaire = 'Register_Structure' and $this.item.where(linkId='structureType').answer.value ='Mosquito Collection Point')",
          },
          kind: APPLICABILITY_CONDITION_KIND,
        },
      ],
      definitionUri: 'mosquito_collection_form.json',
      description: MOSQUITO_COLLECTION_ACTIVITY_DESCRIPTION,
      goalId: 'Mosquito_Collection',
      identifier: '',
      prefix: 6,
      reason: INVESTIGATION,
      subjectCodableConcept: {
        text: 'Location',
      },
      timingPeriod: {
        end: '',
        start: '',
      },
      title: MOSQUITO_COLLECTION_ACTIVITY,
      trigger: [
        {
          name: PLAN_ACTIVATION_TRIGGER_NAME,
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
        {
          expression: {
            description: 'Trigger when a Register_Structure event is submitted',
            expression: "questionnaire = 'Register_Structure'",
          },
          name: 'event-submission',
          type: NAMED_EVENT_TRIGGER_TYPE,
        },
      ],
      type: CREATE_TYPE,
    },
    goal: {
      description: MOSQUITO_COLLECTION_ACTIVITY_DESCRIPTION,
      id: 'Mosquito_Collection',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 3,
            },
          },
          due: '',
          measure: MOSQUITO_COLLECTION_GOAL_MEASURE,
        },
      ],
    },
  },
  familyRegistration: {
    action: {
      code: RACD_REGISTER_FAMILY_CODE,
      description: REGISTER_FAMILY_ACTIVITY_DESCRIPTION,
      goalId: 'RACD_register_families',
      identifier: '',
      prefix: 2,
      reason: INVESTIGATION,
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'RACD_register_families',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: REGISTER_FAMILY_ACTIVITY,
    },
    goal: {
      description: REGISTER_FAMILY_ACTIVITY_DESCRIPTION,
      id: 'RACD_register_families',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '',
          measure: REGISTER_FAMILY_ACTIVITY_GOAL_MEASURE,
        },
      ],
    },
  },
  larvalDipping: {
    action: {
      code: LARVAL_DIPPING_CODE,
      description: LARVAL_DIPPING_ACTIVITY_DESCRIPTION,
      goalId: 'Larval_Dipping',
      identifier: '',
      prefix: 5,
      reason: INVESTIGATION,
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'Larval_Dipping',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: LARVAL_DIPPING_ACTIVITY,
    },
    goal: {
      description: LARVAL_DIPPING_ACTIVITY_DESCRIPTION,
      id: 'Larval_Dipping',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 3,
            },
          },
          due: '',
          measure: LARVAL_DIPPING_GOAL_MEASURE,
        },
      ],
    },
  },
  mosquitoCollection: {
    action: {
      code: MOSQUITO_COLLECTION_CODE,
      description: MOSQUITO_COLLECTION_ACTIVITY_DESCRIPTION,
      goalId: 'Mosquito_Collection',
      identifier: '',
      prefix: 6,
      reason: INVESTIGATION,
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'Mosquito_Collection_Point',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: MOSQUITO_COLLECTION_ACTIVITY,
    },
    goal: {
      description: MOSQUITO_COLLECTION_ACTIVITY_DESCRIPTION,
      id: 'Mosquito_Collection',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 3,
            },
          },
          due: '',
          measure: MOSQUITO_COLLECTION_GOAL_MEASURE,
        },
      ],
    },
  },
  pointAdverseMDA: {
    action: {
      code: MDA_POINT_ADVERSE_EFFECTS_CODE,
      description: MDA_POINT_ADVERSE_EFFECT_ACTIVITY_DESCRIPTION,
      goalId: 'Point_adverse_effect_MDA',
      identifier: '',
      prefix: 9,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'MDA_Point_Adverse_Event',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: MDA_POINT_ADVERSE_EFFECTS_CODE,
    },
    goal: {
      description: MDA_POINT_ADVERSE_EFFECT_ACTIVITY_DESCRIPTION,
      id: 'Point_adverse_effect_MDA',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '<=',
              unit: GoalUnit.PERCENT,
              value: 2,
            },
          },
          due: '',
          measure: MDA_POINT_ADVERSE_EFFECT_COLLECTION_GOAL,
        },
      ],
    },
  },
  pointDispenseMDA: {
    action: {
      code: MDA_POINT_DISPENSE_CODE,
      description: MDA_POINT_DISPENSE_ACTIVITY_DESCRIPTION,
      goalId: 'Point_dispense_MDA',
      identifier: '',
      prefix: 8,
      reason: ROUTINE,
      subjectCodableConcept: {
        text: 'Location',
      },
      taskTemplate: 'MDA_Point_Dispense',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: MDA_POINT_DISPENSE_CODE,
    },
    goal: {
      description: MDA_POINT_DISPENSE_ACTIVITY_DESCRIPTION,
      id: 'Point_dispense_MDA',
      priority: MEDIUM_PRIORITY,
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 75,
            },
          },
          due: '',
          measure: MDA_POINT_DISPENSE_COLLECTION_GOAL,
        },
      ],
    },
  },
};

/** UseContext - interface for PlanPayload.useContext[] items */
export interface UseContext {
  code: UseContextCodesType;
  valueCodableConcept: string;
}

/** interface that describes plan definition objects from OpenSRP */
export interface PlanDefinition {
  action: PlanAction[];
  date: string;
  effectivePeriod: {
    end: string;
    start: string;
  };
  experimental?: Readonly<false>;
  goal: PlanGoal[];
  identifier: string;
  jurisdiction: Array<{
    code: string;
  }>;
  name: string;
  serverVersion?: number;
  status: string;
  title: string;
  useContext: UseContext[];
  version: string;
}

/** Focus Investigation case classifications */
export const defaultFIClassifications: Classification[] = [
  {
    code: A1,
    description: A1_DESCRIPTION,
    name: A1_NAME,
  },
  {
    code: A2,
    description: A2_DESCRIPTION,
    name: A2_NAME,
  },
  {
    code: B1,
    description: B1_DESCRIPTION,
    name: B1_NAME,
  },
  {
    code: B2,
    description: B2_DESCRIPTION,
    name: B2_NAME,
  },
];
export const FIClassifications: Classification[] = AUTO_SELECT_FI_CLASSIFICATION
  ? [
      {
        code: NOT_AVAILABLE,
        description: '',
        name: NOT_AVAILABLE_LABEL,
      },
      ...defaultFIClassifications,
    ]
  : defaultFIClassifications;
/** Indicators configs */

// thresholds
export const GREEN_THRESHOLD = 0.9;
export const YELLOW_THRESHOLD = 0.2;
export const ORANGE_THRESHOLD = 0.8;

// 1-3-7 thresholds
export const ONE = 0;
export const ZERO = 0;

/** Line layer configuration */
export const lineLayerConfig = {
  id: 'single-jurisdiction',
  paint: {
    'line-color': '#FFDC00',
    'line-opacity': 1,
    'line-width': 3,
  },
  source: {
    data: {
      data: {
        coordinates: [],
        type: 'Point',
      },
      type: 'stringified-geojson',
    },
    type: 'geojson',
  },
  type: 'line',
  visible: false,
};

export const jurisdictionSelectionTooltipHint: string =
  'Shift+Click a Jurisdiction to toggle its selection';

/** Fill opacity configuration */
export const structureFillOpacity: Expression = [
  'match',
  ['get', 'task_business_status'],
  ['Not Visited'],
  0.7,
  ['Not Sprayed', 'Incomplete', 'In Progress'],
  0.7,
  ['Sprayed'],
  0.7,
  ['Not Sprayable'],
  1,
  0.75,
];

/** Jurisdiction Selection Map Layer Style Settings */
export const fullySelectedJurisdictionOpacity: number = 0.9;
export const partiallySelectedJurisdictionOpacity: number = 0.6;
export const deselectedJurisdictionOpacity: number = 0.3;

/** Fill layer configuration */
export const fillLayerConfig = {
  id: 'single-jurisdiction',
  paint: {
    'fill-color': '#FFDC00',
    'fill-opacity': structureFillOpacity,
    'fill-outline-color': '#FFDC00',
  },
  source: {
    data: {
      data: {
        coordinates: [],
        type: 'Point',
      },
      type: 'stringified-geojson',
    },
    type: 'geojson',
  },
  type: 'fill',
  visible: false,
};

/** Circle layer configuration */
export const circleLayerConfig = {
  categories: {
    color: '#ff0000',
  },
  id: 'single-jurisdiction',
  paint: {
    'circle-color': '#FFDC00',
    'circle-opacity': 0.7,
    'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 15.75, 2.5, 20.8, 50],
    'circle-stroke-width': 2,
  },
  source: {
    data: {
      data: {
        coordinates: [],
        type: 'Point',
      },
      type: 'stringified-geojson',
    },
    type: 'geojson',
  },
  type: 'circle',
  visible: false,
};

/** Symbol layer configuration */
export const symbolLayerConfig = {
  id: 'symbollayers',
  layout: {
    'icon-image': 'mosquito',
    'icon-size': 2,
  },
  paint: {
    'text-color': '#0000ff',
    'text-halo-blur': 1,
    'text-halo-color': '#fff',
    'text-halo-width': 1.3,
  },
  source: {
    data: {
      data: {
        coordinates: [],
        type: 'Point',
      },
      type: 'stringified-geojson',
    },
    minzoom: 5.2,
    type: 'geojson',
  },
  type: 'symbol',
};

/** Default colors layer fill colors per administrative level */
export const adminLayerColors = ['black', 'red', 'orange', 'yellow', 'green'];

/** interface describing indicator threshold item */
export interface IndicatorThresholdItem {
  color: Color;
  name: string;
  orEquals?: boolean;
  value: number;
}

/** interface describing threshold configs for IRS report indicators */
export interface IndicatorThresholds {
  [key: string]: IndicatorThresholdItem;
}

/** IRS Reporting configs */
export const indicatorThresholdsIRS: IndicatorThresholds = {
  GREEN_THRESHOLD: {
    color: '#2ECC40',
    name: IRS_GREEN_THRESHOLD,
    orEquals: true,
    value: 1,
  },
  GREY_THRESHOLD: {
    color: '#dddddd',
    name: IRS_GREY_THRESHOLD,
    value: 0.2,
  },
  RED_THRESHOLD: {
    color: '#FF4136',
    name: IRS_RED_THRESHOLD,
    orEquals: true,
    value: 0.75,
  },
  YELLOW_THRESHOLD: {
    color: '#FFDC00',
    name: IRS_YELLOW_THRESHOLD,
    value: 0.9,
  },
};
/** END IRS Reporting configs */

/** IRS Reporting configs */
export const indicatorThresholdsIRSLite: IndicatorThresholds = {
  GREEN_THRESHOLD: {
    color: '#2ECC40',
    name: IRS_GREEN_THRESHOLD,
    orEquals: true,
    value: 1,
  },
  GREY_THRESHOLD: {
    color: '#dddddd',
    name: IRS_GREY_THRESHOLD,
    value: 0.2,
  },
  RED_THRESHOLD: {
    color: '#FF4136',
    name: IRS_RED_THRESHOLD,
    orEquals: true,
    value: 0.75,
  },
  YELLOW_THRESHOLD: {
    color: '#FFDC00',
    name: IRS_YELLOW_THRESHOLD,
    value: 0.9,
  },
};
/** END IRS Reporting configs */

/** Namibia IRS Reporting configs */
export const indicatorThresholdsIRSNamibia: IndicatorThresholds = {
  GREEN_THRESHOLD: {
    color: '#4C9A2A',
    name: IRS_GREEN_THRESHOLD,
    orEquals: true,
    value: 1,
  },
  GREY_THRESHOLD: {
    color: '#dddddd',
    name: IRS_GREY_THRESHOLD,
    value: 0.2,
  },
  RED_THRESHOLD: {
    color: '#FF4136',
    name: IRS_RED_THRESHOLD,
    value: 0.75,
  },
  YELLOW_THRESHOLD: {
    color: '#FFDC00',
    name: IRS_YELLOW_THRESHOLD,
    value: 0.9,
  },
};
/** END Namibia IRS Reporting configs */

/** Focus Investigation Reporting Configs */
export const indicatorThresholdsFI: IndicatorThresholds = {
  GREEN_THRESHOLD: {
    color: '#33ad33',
    name: IRS_GREEN_THRESHOLD,
    orEquals: true,
    value: 0.9,
  },
  ORANGE_THRESHOLD: {
    color: '#ff8533',
    name: IRS_ORANGE_THRESHOLD,
    orEquals: true,
    value: 0.8,
  },
  RED_THRESHOLD: {
    color: '#ff5c33',
    name: IRS_RED_THRESHOLD,
    orEquals: true,
    value: 0.2,
  },
  YELLOW_THRESHOLD: {
    color: '#ff3',
    name: IRS_YELLOW_THRESHOLD,
    orEquals: true,
    value: 0.0001,
  },
};
/** END Focus Investigation Reporting Configs */

/** Interface describing thresholds look up */
export interface IndicatorThresholdsLookUp {
  [key: string]: IndicatorThresholds;
}

/** Thresholds lookup
 * For custom indicator thresholds, define it and add it here,
 * otherwise the default indicator thresholds will be used.
 */
export const indicatorThresholdsLookUpIRS: IndicatorThresholdsLookUp = {
  namibia2019: indicatorThresholdsIRSNamibia,
};

/** interface describing base configs for irs reporting configurations */
export interface IrsReportingConfig {
  indicatorThresholds: IndicatorThresholds;
}

/* tslint:disable:object-literal-sort-keys */
/** The actual configuration object controlling how IRS Reporting is handled for different clients */
export const irsReportingCongif: {
  [key: string]: IrsReportingConfig;
} = {
  // Namibia Structures Configs
  [process.env.REACT_APP_SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE_NA as string]: {
    indicatorThresholds: indicatorThresholdsIRS,
  } as IrsReportingConfig,
};
/* tslint:enable:object-literal-sort-keys */

/** Thresholds lookup
 * For custom indicator thresholds, define it and add it here,
 * otherwise the default indicator thresholds will be used.
 */
export const indicatorThresholdsLookUpIRSLite: IndicatorThresholdsLookUp = {
  irsLite2020: indicatorThresholdsIRSLite,
};

/* tslint:disable:object-literal-sort-keys */
/** The actual configuration object controlling how IRS Reporting is handled for different clients */
export const irsLiteReportingCongif: {
  [key: string]: IrsReportingConfig;
} = {
  // Namibia Structures Configs
  [process.env.REACT_APP_SUPERSET_IRS_LITE_REPORTING_STRUCTURES_DATA_SLICE_NA as string]: {
    indicatorThresholds: indicatorThresholdsIRS,
  } as IrsReportingConfig,
};
/* tslint:enable:object-literal-sort-keys */

/** END IRS Reporting interfaces */

/** Interfaces describing administrative hierarchy via ISO 3166 admin codes */
export interface ADMN0 {
  ADMN0_PCODE: string;
  ADMN0_EN: string;
}
export interface ADMN1 extends ADMN0 {
  ADMN1_PCODE: string;
  ADMN1_EN: string;
}
export interface ADMN2 extends ADMN1 {
  ADMN2_PCODE: string;
  ADMN2_EN: string;
}
export interface ADMN3 extends ADMN2 {
  ADMN3_PCODE: string;
  ADMN3_EN: string;
}

export const baseTilesetGeographicLevel: number = 1; // this tells the Jurisdiction Selection map at which geographic level to start rendering administrative fill layers
/* tslint:disable-next-line no-useless-cast */
export const JurisdictionLevels = ['administrative', 'operational'] as const;
export interface Tileset {
  idField: string; // the feature property corresponding with jurisdiction_id (for joining)
  jurisdictionType: JurisdictionTypes; // Admin or OA/FA/SA
  labelField?: string; // the feature property corresponding with the display name
  layer: string; // the Mapbox tileset-layer name
  parentIdField: string; // the feature property corresponding with parent_id (for joining)
  url: string; // the Mapbox tileset url
}
/** interface describing basic country level information */
export interface JurisdictionsByCountry extends ADMN0 {
  // the GPS extents of given geometry(s)
  bounds?: LngLatBoundsLike;

  // the top level jurisdiction_Ids from OpenSRP
  // this is most useful for instances where tilesets DO NOT match the OpenSRP hierarchy
  jurisdictionIds: string[];

  // the top level jurisdiction_id of the country
  jurisdictionId: string;

  // the UUID of the Jurisdiction from the
  id?: string;

  // list of tilesets used for administrative boundaries
  tilesets?: Tileset[];
}
/** Country Jurisdictions definition for Zambia staging */
export const ZambiaStageAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Zambia',
  ADMN0_PCODE: 'ZM',
  bounds: [28.20209213900005, -15.549759923999941, 32.755632835000085, -13.718855579980357],
  jurisdictionId: '',
  jurisdictionIds: ['2939', '2940', '2942', '2942', '2953', '2954'],
  tilesets: [],
};
/** Country Jurisdictions definition for Zambia staging */
export const ZambiaStageAdminRA0: JurisdictionsByCountry = {
  ADMN0_EN: 'ra Zambia',
  ADMN0_PCODE: 'ZMra',
  bounds: [28.20209213900005, -15.549759923999941, 32.755632835000085, -13.718855579980357],
  jurisdictionId: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
  jurisdictionIds: [],
  tilesets: [],
};

/** Country Jurisdictions definition for Zambia production */
export const ZambiaProd0: JurisdictionsByCountry = {
  ADMN0_EN: 'Zambia',
  ADMN0_PCODE: 'ZM',
  bounds: [21.9993509, -18.0765945, 33.701111, -8.2712822],
  jurisdictionId: '22bc44dd-752d-4c20-8761-617361b4f1e7',
  jurisdictionIds: [],
  tilesets: [],
};

/** Country Jurisdictions definition for Thailand */
export const ThailandAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Thailand',
  ADMN0_PCODE: 'TH',
  bounds: [
    [105.63681192, 5.61285098],
    [97.34380713, 20.46483364],
  ],
  jurisdictionId: '',
  jurisdictionIds: [
    '64301afa-e973-447b-a88c-4da20025c76f',
    '7f204867-fab0-4246-a97c-92e0b936cab6',
    '9c3c2db4-bddd-44c5-870a-a0eef539e4da',
  ],
  tilesets: [
    {
      idField: 'ADM0_EN',
      jurisdictionType: JurisdictionLevels[0] as JurisdictionTypes,
      // labelField: '',
      layer: 'TH_0',
      parentIdField: '',
      url: 'mapbox://thailandbvbd.6o8cg6kd',
    },
    {
      idField: 'ADM1_EN',
      jurisdictionType: JurisdictionLevels[0] as JurisdictionTypes,
      // labelField: '',
      layer: 'TH_1',
      parentIdField: 'ADM0_EN',
      url: 'mapbox://thailandbvbd.91ktth0q',
    },
  ],
};

/** Country Jurisdictions definition for Namibia - WIP */
const NamibiaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Namibia',
  ADMN0_PCODE: 'NA',
  bounds: [
    [11.76, -28.97],
    [25.26, -16.95],
  ],
  jurisdictionId: 'f45b9380-c970-4dd1-8533-9e95ab12f128',
  jurisdictionIds: [],
  tilesets: [
    {
      idField: 'jurisdictionId',
      jurisdictionType: JurisdictionLevels[0] as JurisdictionTypes,
      labelField: 'name',
      layer: 'NA_0',
      parentIdField: 'name',
      url: 'mapbox://thailandbvbd.8k701kz0',
    },
    {
      idField: 'jurisdictionId',
      jurisdictionType: JurisdictionLevels[0] as JurisdictionTypes,
      labelField: 'name',
      layer: 'NA_1',
      parentIdField: 'parentId',
      url: 'mapbox://thailandbvbd.4pm7lyll',
    },
    {
      idField: 'jurisdictionId',
      jurisdictionType: JurisdictionLevels[0] as JurisdictionTypes,
      labelField: 'name',
      layer: 'NA_2',
      parentIdField: 'parentId',
      url: 'mapbox://thailandbvbd.d7wo2nki',
    },
    {
      idField: 'id',
      jurisdictionType: JurisdictionLevels[1],
      labelField: 'name',
      layer: 'NA_3',
      parentIdField: 'parentId',
      url: 'mapbox://thailandbvbd.2gab6o28',
    },
  ],
};

export const BotswanaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Botswana',
  ADMN0_PCODE: 'BW',
  bounds: [19.99953461, -26.90737915, 29.36831093, -17.7808094],
  jurisdictionId: '16a77bba-8777-4bc4-8566-d193cb04af4c',
  jurisdictionIds: [],
  tilesets: [],
};
export const ChadizaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Chadiza',
  ADMN0_PCODE: 'Chadiza',
  bounds: [32.21137675056678, -14.309769922999974, 32.755632835000085, -13.899201952999928],
  jurisdictionId: '2939',
  jurisdictionIds: [],
  tilesets: [],
};
export const SindaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Sinda',
  ADMN0_PCODE: 'Sinda',
  bounds: [28.09754672919825, -16.727876287030366, 28.856324992204744, -16.196615979643692],
  jurisdictionId: '2941',
  jurisdictionIds: [],
  tilesets: [],
};
export const KateteAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Katete',
  ADMN0_PCODE: 'Katete',
  bounds: [31.796349266000046, -14.376530907999832, 32.32032420000019, -13.718855579980357],
  jurisdictionId: '2940',
  jurisdictionIds: [],
  tilesets: [],
};
export const SiavongaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Siavonga',
  ADMN0_PCODE: 'Siavonga',
  bounds: [28.09754672919825, -16.727876287030366, 28.856324992204744, -16.196615979643692],
  jurisdictionId: '3954',
  jurisdictionIds: [],
  tilesets: [],
};
export const LopBuriAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Lop Buri',
  ADMN0_PCODE: 'Lop Buri',
  bounds: [100.41996838300008, 14.646843667000041, 101.40442895400008, 15.756128613000044],
  jurisdictionId: '9c3c2db4-bddd-44c5-870a-a0eef539e4da',
  jurisdictionIds: [],
  tilesets: [],
};
export const OddarMeancheyProvinceAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Oddar Meanchey Province',
  ADMN0_PCODE: 'Oddar Meanchey Province',
  bounds: [103.0318109980105, 13.87666596238883, 104.5085170565606, 14.440129974021772],
  jurisdictionId: 'f8863022-ff88-4c22-b2d1-83f59f31b874',
  jurisdictionIds: [],
  tilesets: [],
};
export const LusakaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Lusaka',
  ADMN0_PCODE: 'Lusaka',
  bounds: [28.20209213900005, -15.549759923999941, 28.488907821000048, -15.31976316599997],
  jurisdictionId: '2942',
  jurisdictionIds: [],
  tilesets: [],
};
export const ราชอาณาจักรไทยAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'ราชอาณาจักรไทย',
  ADMN0_PCODE: 'ราชอาณาจักรไทย',
  bounds: [97.685, 15.117, 99.529, 17.917],
  jurisdictionId: 'ef33a6d9-aaaa-44ad-91b7-583ab3fcdb22',
  jurisdictionIds: [],
};
export const TakAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Tak',
  ADMN0_PCODE: 'Tak',
  bounds: [97.685, 15.117, 99.529, 17.917],
  jurisdictionId: '5e37d232-d471-4ac1-b8a6-f5215a8aa117',
  jurisdictionIds: [],
};

/** dictionary of JurisdictionsByCountry by country code */
export const CountriesAdmin0 = {
  BW: BotswanaAdmin0,
  Chadiza: ChadizaAdmin0,
  Katete: KateteAdmin0,
  ['Lop Buri']: LopBuriAdmin0,
  Lusaka: LusakaAdmin0,
  NA: NamibiaAdmin0,
  ['Oddar Meanchey Province']: OddarMeancheyProvinceAdmin0,
  Siavonga: SiavongaAdmin0,
  Sinda: SindaAdmin0,
  TH: ThailandAdmin0,
  Tak: TakAdmin0,
  ZM: ZambiaStageAdmin0,
  ['ra Zambia']: ZambiaStageAdminRA0,
  Zambia: ZambiaProd0,
  ราชอาณาจักรไทย: ราชอาณาจักรไทยAdmin0,
};
/** Columns for various Plans */
/** complete reactive columns with no data */
export const emptyCompleteReactivePlans = [
  {
    Header: NAME,
  },
  {
    Header: DATE_COMPLETED,
  },
  {
    Header: CASE_NOTIF_DATE_HEADER,
  },
  {
    Header: CASE_CLASSIFICATION_HEADER,
  },
];
/** complete routine columns with no data */
export const emptyCompleteRoutinePlans = [
  {
    Header: NAME,
  },
  {
    Header: START_DATE,
  },
  {
    Header: END_DATE,
  },
  {
    Header: DATE_COMPLETED,
  },
];
/** current reactive columns with no data */
export const emptyCurrentReactivePlans: any = [{}, {}, {}, {}];
/** current routine columns with no data */
export const emptyCurrentRoutinePlans = [
  {
    Header: NAME,
  },
  {
    Header: FI_STATUS,
  },
  {
    Header: PROVINCE,
  },
  {
    Header: DISTRICT,
  },
  {
    Header: CANTON,
  },
  {
    Header: VILLAGE,
  },
  {
    Header: FOCUS_AREA_HEADER,
  },
  {
    Header: STATUS_HEADER,
  },
  {
    Header: START_DATE,
  },
  {
    Header: END_DATE,
  },
];
/** current reactive columns with data */
export const currentReactivePlansColumns = [
  {
    Header: CASE_NOTIF_DATE_HEADER,
    accessor: 'caseNotificationDate',
    minWidth: 90,
  },
  {
    Header: CASE_CLASSIFICATION_HEADER,
    accessor: 'caseClassification',
  },
];
/** current routine columns with data */
export const currentRoutinePlansColumn = [
  {
    Header: STATUS_HEADER,
    accessor: 'status',
    maxWidth: 60,
  },
  {
    Header: START_DATE,
    accessor: 'plan_effective_period_start',
    minWidth: 80,
  },
  {
    Header: END_DATE,
    accessor: 'plan_effective_period_end',
  },
];
/** complete reactive columns with data */
export const completeReactivePlansColumn = [
  {
    Header: END_DATE,
    accessor: 'plan_effective_period_end',
  },
  {
    Header: CASE_NOTIF_DATE_HEADER,
    accessor: 'caseNotificationDate',
    minWidth: 90,
  },
  {
    Header: CASE_CLASSIFICATION_HEADER,
    accessor: 'caseClassification',
  },
];
/** complete routine columns with data */
export const completeRoutinePlansColumn = [
  {
    Header: START_DATE,
    accessor: 'plan_effective_period_start',
    minWidth: 80,
  },
  {
    Header: END_DATE,
    accessor: 'plan_effective_period_end',
    id: END_DATE,
  },
  {
    Header: DATE_COMPLETED,
    accessor: 'plan_effective_period_end',
    id: DATE_COMPLETED,
  },
];
/** Date completed field not there in the current plan  */
export const dateCompletedColumn = [
  {
    Header: DATE_COMPLETED,
    accessor: 'date_completed',
    minWidth: 80,
  },
];
// status column
export const statusColumn = [
  {
    Header: FI_STATUS,
    accessor: 'plan_status',
    id: FI_STATUS,
    minWidth: 80,
  },
];

// icons to add to map
export const imgArr = [
  {
    id: 'current-case-confirmation',
    imageUrl:
      'https://raw.githubusercontent.com/onaio/reveal-frontend/master/src/assets/images/current-case-confirmation.png',
  },
  {
    id: 'case-confirmation',
    imageUrl:
      'https://raw.githubusercontent.com/onaio/reveal-frontend/master/src/assets/images/case-confirmation.png',
  },
  {
    id: 'larval',
    imageUrl:
      'https://raw.githubusercontent.com/onaio/reveal-frontend/master/src/assets/images/larval.png',
  },
  {
    id: 'mosquito',
    imageUrl:
      'https://raw.githubusercontent.com/onaio/reveal-frontend/master/src/assets/images/mosquito.png',
  },
];
/** row height possible values */
export const rowHeights = {
  DEFAULT: {
    label: DEFAULT,
    value: '2em',
  },
  SHORT: {
    label: SHORT,
    value: '1em',
  },
  TALL: {
    label: TALL,
    value: '3em',
  },
};
