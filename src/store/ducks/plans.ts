import { get, keyBy, keys, pickBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { transformValues } from '../../helpers/utils';

/** the reducer name */
export const reducerName = 'plans';

// todo: add '*' as any?
/** Enum representing the possible intervention types */
export enum InterventionType {
  FI = 'FI',
  IRS = 'IRS',
}

/** Enum representing the possible intervention types */
export enum PlanStatus {
  ACTIVE = 'active',
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
}

// actions
/** PLANS_FETCHED action type */
export const PLANS_FETCHED = 'reveal/reducer/plans/PLANS_FETCHED';
/** PLAN_RECORDS_FETCHED action type */
export const PLAN_RECORDS_FETCHED = 'reveal/reducer/plans/PLAN_RECORDS_FETCHED';

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

/** Create type for Plan reducer actions */
export type PlanActionTypes = FetchPlansAction | FetchPlanRecordsAction | AnyAction;

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
        plansById: action.plansById,
      });
    case PLAN_RECORDS_FETCHED:
      return SeamlessImmutable({
        ...state,
        planRecordsById: action.planRecordsById,
      });
    default:
      return state;
  }
}

// action creators

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
      plan = transformValues<Plan>(plan, ['plan_fi_reason', 'plan_fi_status']);
      return plan;
    }),
    plan => plan.id
  ),
  type: PLANS_FETCHED,
});

/** fetchPlanRecords - action creator setting planRecordsById
 * @param {PlanRecord[]} planList - an array of plan record obejcts
 */
export const fetchPlanRecords = (planList: PlanRecordResponse[] = []): FetchPlanRecordsAction => ({
  planRecordsById: keyBy(
    planList.map((plan: PlanRecordResponse) => {
      const thePlan = {
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
 */
export function getPlansById(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: PlanStatus = PlanStatus.ACTIVE
): { [key: string]: Plan } {
  const plansById = (state as any)[reducerName].plansById;
  return pickBy(
    plansById,
    (plan: Plan) => plan.plan_intervention_type === intervention && plan.plan_status === status
  );
}

/** getPlansArray - get an array of Plans by intervention type
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 */
export function getPlansArray(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: PlanStatus = PlanStatus.ACTIVE
): Plan[] {
  return values((state as any)[reducerName].plansById).filter(
    (plan: Plan) => plan.plan_intervention_type === intervention && plan.plan_status === status
  );
}

/** getPlansIdArray - get an array of Plan ids by intervention type
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 */
export function getPlansIdArray(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: PlanStatus = PlanStatus.ACTIVE
): string[] {
  return keys(getPlansById(state, intervention, status));
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
 */
export function getPlanRecordsById(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: PlanStatus = PlanStatus.ACTIVE
): { [key: string]: PlanRecord } {
  const planRecordsById = (state as any)[reducerName].planRecordsById;
  return pickBy(
    planRecordsById,
    (plan: PlanRecord) =>
      plan.plan_intervention_type === intervention && plan.plan_status === status
  );
}

/** getPlanRecordsArray - get an array of PlanRecords by intervention type
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 */
export function getPlanRecordsArray(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: PlanStatus = PlanStatus.ACTIVE
): PlanRecord[] {
  return values((state as any)[reducerName].planRecordsById).filter(
    (plan: PlanRecord) =>
      plan.plan_intervention_type === intervention && plan.plan_status === status
  );
}

/** getPlanRecordsIdArray - get an array of PlanRecord ids
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 */
export function getPlanRecordsIdArray(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI,
  status: PlanStatus = PlanStatus.ACTIVE
): string[] {
  return keys(getPlanRecordsById(state, intervention, status));
}

/** getPlanRecordById - get one PlanRecord by id
 * @param {Partial<Store>} state - the redux store
 * @param {string} id - the plan id
 */
export function getPlanRecordById(state: Partial<Store>, id: string): PlanRecord | null {
  return get((state as any)[reducerName].planRecordsById, id) || null;
}
