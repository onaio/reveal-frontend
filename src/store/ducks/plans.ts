import { get, keyBy, keys, pickBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import uuidv4 from 'uuid/v4';
import { PlanAction, planActivities, PlanGoal } from '../../configs/settings';
import { FlexObject, transformValues } from '../../helpers/utils';

/** the reducer name */
export const reducerName = 'plans';

// todo: add '*' as any?
/** Enum representing the possible intervention types */
export enum InterventionType {
  FI = 'FI',
  IRS = 'IRS',
}

/** interface for plan Objects */
/** Enum representing the possible intervention types */
export enum PlanStatus {
  ACTIVE = 'active',
  COMPLETE = 'complete',
  DRAFT = 'draft',
  RETIRED = 'retired',
}
/** PlanRecordResponse - interface for response objects from SUPERSET_PLANS_TABLE_SLICE */
export interface PlanRecordResponse {
  date: string;
  effective_period_end: string;
  effective_period_start: string;
  identifier: string;
  intervention_type: string;
  jurisdictions?: string[];
  fi_reason: string;
  fi_status: string;
  name: string;
  status: string;
  title: string;
  version: string;
}

/** PlanRecord - base Plan interface for plan objects,  keyed by `id` in state */
export interface PlanRecord {
  id: string;
  plan_date: string;
  plan_effective_period_end: string;
  plan_effective_period_start: string;
  plan_fi_reason: string;
  plan_fi_status: string;
  plan_id: string;
  plan_intervention_type: InterventionType;
  plan_status: PlanStatus;
  plan_title: string;
  plan_version?: string;
  plan_jurisdictions_ids?: string[];
}

// todo - Rename?
/** Plan - interface for plan[-jurisdiction] objects */
export interface Plan extends PlanRecord {
  jurisdiction_depth: number;
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_name_path: string[];
  jurisdiction_parent_id: string;
  jurisdiction_path: string[];
  jurisdiction_root_parent_ids?: string[];
}

/** UseContext - interface for PlanPayload.useContext[] items */
export interface UseContext {
  code: string;
  valueCodableConcept: string;
}

/** PlanPayload - interface for the payload used when creating/updating a plan via OpenSRP plans Endpoint */
export interface PlanPayload {
  action: any[];
  date: string;
  effectivePeriod: {
    start: string;
    end: string;
  };
  goal: any[];
  identifier: string;
  jurisdiction: Array<{
    code: string;
  }>;
  name: string;
  serverVersion: number;
  status: string;
  title: string;
  useContext: UseContext[];
  version: string;
}

/** extractPlanPayloadFromPlanRecord */
export const extractPlanPayloadFromPlanRecord = (planRecord: PlanRecord): PlanPayload | null => {
  const {
    plan_date: date,
    plan_id: identifier,
    plan_effective_period_end: end,
    plan_effective_period_start: start,
    plan_jurisdictions_ids,
    plan_status: status,
    plan_title: title,
    plan_intervention_type: interventionType,
    plan_version,
  } = planRecord;
  if (plan_jurisdictions_ids) {
    const planPayload: PlanPayload = {
      action: [],
      date,
      effectivePeriod: {
        end,
        start,
      },
      goal: [],
      identifier,
      jurisdiction: plan_jurisdictions_ids.map(id => ({ code: id })),
      name: title.trim().replace(/ /g, '-'),
      serverVersion: 0,
      status,
      title,
      useContext: [
        {
          code: 'interventionType',
          valueCodableConcept: interventionType,
        },
      ],
      version: plan_version || '1',
    };

    // build PlanActions and PlanGoals
    let planAction: PlanAction;
    let planGoal: PlanGoal;
    if (interventionType === InterventionType.IRS) {
      const { action, goal } = planActivities[InterventionType.IRS];
      planAction = {
        ...action,
        identifier: uuidv4(),
        timingPeriod: {
          end,
          start,
        },
      };
      planGoal = {
        ...goal,
        target: [
          {
            ...goal.target[0],
            due: end,
          },
        ],
      };
      planPayload.action.push(planAction);
      planPayload.goal.push(planGoal);
    }

    return planPayload;
  }
  return null;
};

/** PlanEventType - enum for Plan Event logging */
export enum PlanEventType {
  CREATE = 'Create Plan',
  UPDATE = 'Update Plan',
}

/** PlanEvent - interface for pload used when logging create/update Plan events */
export interface PlanEventPayload {
  baseEntityId: string;
  dateCreated: string;
  details: FlexObject;
  duration: number;
  entityType: InterventionType;
  eventDate: string;
  eventType: PlanEventType;
  formSubmissionId: string;
  identifiers: FlexObject;
  obs: Array<{
    fieldType: 'concept';
    fieldDataType: string;
    fieldCode: string;
    parentCode: string;
    values: string[];
    set: any[];
    formSubmissionField: string;
    humanReadableValues: string[];
  }>;
  providerId: string;
  type: 'Event';
  version: number;
}

export const extractPlanRecordResponseFromPlanPayload = (
  planPayload: PlanPayload
): PlanRecordResponse | null => {
  const { date, effectivePeriod, identifier, status, title, useContext, version } = planPayload;
  if (useContext && effectivePeriod) {
    const { end, start } = effectivePeriod;
    let planInterventionType = '';
    let planFiReason = '';
    let planFiStatus = '';
    for (const context of useContext) {
      switch (context.code) {
        case 'interventionType': {
          planInterventionType = context.valueCodableConcept;
          break;
        }
        case 'fiReason': {
          planFiReason = context.valueCodableConcept;
          break;
        }
        case 'fiStatus': {
          planFiStatus = context.valueCodableConcept;
          break;
        }
      }
    }
    const planRecordResponse: PlanRecordResponse = {
      date,
      effective_period_end: end,
      effective_period_start: start,
      fi_reason: planFiReason,
      fi_status: planFiStatus,
      identifier,
      intervention_type: planInterventionType,
      name,
      status,
      title,
      version,
    };
    if (planPayload.jurisdiction) {
      planRecordResponse.jurisdictions = planPayload.jurisdiction.map(j => j.code);
    }
    return planRecordResponse;
  }
  return null;
};

/** extractPlanRecordFromPlanPayload - translates PlanPayload to PlanRecord */
export const extractPlanRecordFromPlanPayload = (planPayload: PlanPayload): PlanRecord | null => {
  const {
    date,
    effectivePeriod,
    identifier,
    status,
    title,
    useContext,
    version,
  } = planPayload as PlanPayload;

  if (useContext && effectivePeriod) {
    const { end, start } = effectivePeriod;
    let planInterventionType = '';
    let planFiReason = '';
    let planFiStatus = '';
    for (const context of useContext) {
      switch (context.code) {
        case 'interventionType': {
          planInterventionType = context.valueCodableConcept;
          break;
        }
        case 'fiReason': {
          planFiReason = context.valueCodableConcept;
          break;
        }
        case 'fiStatus': {
          planFiStatus = context.valueCodableConcept;
          break;
        }
      }
    }
    if (planInterventionType.length) {
      const planRecord: PlanRecord = {
        id: identifier,
        plan_date: date,
        plan_effective_period_end: end,
        plan_effective_period_start: start,
        plan_fi_reason: planFiReason,
        plan_fi_status: planFiStatus,
        plan_id: identifier,
        plan_intervention_type: planInterventionType as InterventionType,
        plan_status: status as PlanStatus,
        plan_title: title,
        plan_version: version,
      };
      return planRecord;
    }
  }
  return null;
};
// actions
/** PLANS_FETCHED action type */
export const PLANS_FETCHED = 'reveal/reducer/plans/PLANS_FETCHED';
/** PLAN_RECORDS_FETCHED action type */
export const PLAN_RECORDS_FETCHED = 'reveal/reducer/plans/PLAN_RECORDS_FETCHED';
/** REMOVE_PLANS action_type */
export const REMOVE_PLANS = 'reveal/reducer/plans/REMOVE_PLANS';

/** FetchPlansAction interface for PLANS_FETCHED */
interface FetchPlansAction extends AnyAction {
  plansById: { [key: string]: Plan };
  type: typeof PLANS_FETCHED;
}
/** FetchPlanRecordsAction interface for PLAN_RECORDS_FETCHED */
interface FetchPlanRecordsAction extends AnyAction {
  planRecordsById: { [key: string]: PlanRecord };
  type: typeof PLAN_RECORDS_FETCHED;
}

/** removePlansAction interface for REMOVE_PLANS */
interface RemovePlansAction extends AnyAction {
  type: typeof REMOVE_PLANS;
  plansById: {};
}

/** Create type for Plan reducer actions */
export type PlanActionTypes =
  | FetchPlansAction
  | FetchPlanRecordsAction
  | RemovePlansAction
  | AnyAction;

/** interface for Plan state */
interface PlanState {
  planRecordsById: { [key: string]: PlanRecord };
  plansById: { [key: string]: Plan };
}

/** immutable Plan state */
export type ImmutablePlanState = PlanState & SeamlessImmutable.ImmutableObject<PlanState>;

/** initial Plan state */
const initialState: ImmutablePlanState = SeamlessImmutable({
  planRecordsById: {},
  plansById: {},
});

/** the Plan reducer function */
export default function reducer(state = initialState, action: PlanActionTypes): ImmutablePlanState {
  switch (action.type) {
    case PLANS_FETCHED:
      return SeamlessImmutable({
        ...state,
        plansById: { ...state.plansById, ...action.plansById },
      });
    case PLAN_RECORDS_FETCHED:
      return SeamlessImmutable({
        ...state,
        planRecordsById: action.planRecordsById,
      });
    case REMOVE_PLANS:
      return SeamlessImmutable({
        ...state,
        plansById: action.plansById,
      });
    default:
      return state;
  }
}

// action creators

/** removePlansAction */
export const removePlansAction: RemovePlansAction = {
  plansById: {},
  type: REMOVE_PLANS,
};

/** fetchPlans - action creator setting plansById
 * @param {Plan[]} plansList - array of plan objects
 */
export const fetchPlans = (plansList: Plan[] = []): FetchPlansAction => ({
  plansById: keyBy(
    plansList.map((plan: Plan) => {
      /** ensure jurisdiction_name_path is parsed */
      if (typeof plan.jurisdiction_name_path === 'string') {
        plan.jurisdiction_name_path = JSON.parse(plan.jurisdiction_name_path);
      }
      /** ensure jurisdiction_path is parsed */
      if (typeof plan.jurisdiction_path === 'string') {
        plan.jurisdiction_path = JSON.parse(plan.jurisdiction_path);
      }
      if (typeof plan.jurisdiction_root_parent_ids === 'string') {
        plan.jurisdiction_root_parent_ids = JSON.parse(plan.jurisdiction_root_parent_ids);
      }
      plan = transformValues<Plan>(plan, ['plan_fi_reason', 'plan_fi_status']);
      return plan;
    }),
    plan => plan.id || plan.plan_id
  ),
  type: PLANS_FETCHED,
});

/** fetchPlanRecords - action creator setting planRecordsById
 * @param {PlanRecord[]} planList - an array of plan record obejcts
 */
export const fetchPlanRecords = (planList: PlanRecordResponse[] = []): FetchPlanRecordsAction => ({
  planRecordsById: keyBy(
    planList.map((plan: PlanRecordResponse) => {
      const thePlan: PlanRecord = {
        id: plan.identifier,
        plan_date: plan.date,
        plan_effective_period_end: plan.effective_period_end,
        plan_effective_period_start: plan.effective_period_start,
        plan_fi_reason: plan.fi_reason,
        plan_fi_status: plan.fi_status,
        plan_id: plan.identifier,
        plan_intervention_type: plan.intervention_type as InterventionType,
        plan_status: plan.status as PlanStatus,
        plan_title: plan.title,
        plan_version: plan.version,
      };
      if (plan.jurisdictions) {
        thePlan.plan_jurisdictions_ids = [...plan.jurisdictions];
      }
      return transformValues<PlanRecord>(thePlan, ['plan_fi_reason', 'plan_fi_status']);
    }),
    plan => plan.id
  ),
  type: PLAN_RECORDS_FETCHED,
});

// selectors

/** getPlansById - get plansById by intervention type
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 * @param {string[]} status - the plan status
 * @param {string} reason - the plan reason
 */
export function getPlansById(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: string[] = [PlanStatus.ACTIVE],
  reason: string | null = null
): { [key: string]: Plan } {
  const plansById = (state as any)[reducerName].plansById;
  return pickBy(
    plansById,
    (plan: Plan) =>
      plan.plan_intervention_type === intervention &&
      (status.length ? status.includes(plan.plan_status) : true) &&
      (reason ? plan.plan_fi_reason === reason : true)
  );
}

/** getPlansArray - get an array of Plans by intervention type
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 * @param {string[]} status - the plan status
 * @param {string} reason - the plan reason
 * @param {string} parentJurisdictionId - The jurisdiction_parent_id of the plan
 * @param {string[]} jurisdictions - jurisdiction IDs list to find plan's jurisdiction_id within
 */
export function getPlansArray(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: string[] = [],
  reason: string | null = null,
  jurisdictions: string[] = [],
  parentJurisdictionId: string | null = null
): Plan[] {
  return values((state as any)[reducerName].plansById).filter(
    (plan: Plan) =>
      plan.plan_intervention_type === intervention &&
      (status.length ? status.includes(plan.plan_status) : true) &&
      (reason ? plan.plan_fi_reason === reason : true) &&
      (jurisdictions.length ? jurisdictions.includes(plan.jurisdiction_id) : true) &&
      (parentJurisdictionId ? plan.jurisdiction_path.includes(parentJurisdictionId) : true)
  );
}

/** getPlansIdArray - get an array of Plan ids by intervention type
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 * @param {string[]} status - the plan status
 * @param {string} reason - the plan reason
 */
export function getPlansIdArray(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: string[] = [PlanStatus.ACTIVE],
  reason: string | null = null
): string[] {
  return keys(getPlansById(state, intervention, status, reason));
}

/** getPlanById - get one Plan by id
 * @param {Partial<Store>} state - the redux store
 * @param {string} id - the plan id
 */
export function getPlanById(state: Partial<Store>, id: string): Plan | null {
  return get((state as any)[reducerName].plansById, id) || null;
}

/** getPlanRecordsById - get planRecordsById by intervention type
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 * @param {string[]} status - the plan status
 * @param {string} reason - the plan reason
 */
export function getPlanRecordsById(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: string[] = [PlanStatus.ACTIVE],
  reason: string | null = null
): { [key: string]: PlanRecord } {
  const planRecordsById = (state as any)[reducerName].planRecordsById;
  return pickBy(
    planRecordsById,
    (plan: PlanRecord) =>
      plan.plan_intervention_type === intervention &&
      (status.length ? status.includes(plan.plan_status) : true) &&
      (reason ? plan.plan_fi_reason === reason : true)
  );
}

/** getPlanRecordsArray - get an array of PlanRecords by intervention type
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 * @param {string[]} status - the plan status
 * @param {string} reason - the plan reason
 */
export function getPlanRecordsArray(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: string[] = [PlanStatus.ACTIVE],
  reason: string | null = null
): PlanRecord[] {
  return values((state as any)[reducerName].planRecordsById).filter(
    (plan: PlanRecord) =>
      plan.plan_intervention_type === intervention &&
      (status.length ? status.includes(plan.plan_status) : true) &&
      (reason ? plan.plan_fi_reason === reason : true)
  );
}

/** getPlanRecordsIdArray - get an array of PlanRecord ids
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 * @param {string[]} status - the plan status
 * @param {string} reason - the plan reason
 */
export function getPlanRecordsIdArray(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: string[] = [PlanStatus.ACTIVE],
  reason: string | null = null
): string[] {
  return keys(getPlanRecordsById(state, intervention, status, reason));
}

/** getPlanRecordById - get one PlanRecord by id
 * @param {Partial<Store>} state - the redux store
 * @param {string} id - the plan id
 */
export function getPlanRecordById(state: Partial<Store>, id: string): PlanRecord | null {
  return get((state as any)[reducerName].planRecordsById, id) || null;
}
