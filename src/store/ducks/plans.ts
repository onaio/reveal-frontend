import { get, keyBy, keys, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** the reducer name */
export const reducerName = 'plans';

/** interface for plan Object */
export interface Plan {
  jurisdiction_depth: number;
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_name_path: string[];
  jurisdiction_parent_id: string;
  jurisdiction_path: string[];
  plan_fi_reason: string;
  plan_fi_status: string;
  plan_id: string;
  plan_status: string;
  plan_title: string;
}

// actions
/** PLANS_FETCHED action type */
export const PLANS_FETCHED = 'reveal/reducer/plans/PLANS_FETCHED';

/** interface for authorize action */
interface FetchPlansAction extends AnyAction {
  plansById: { [key: string]: Plan };
  type: typeof PLANS_FETCHED;
}

/** Create type for Plan reducer actions */
export type PlanActionTypes = FetchPlansAction | AnyAction;

/** interface for Plan state */
interface PlanState {
  plansById: { [key: string]: Plan };
}

/** immutable Plan state */
export type ImmutablePlanState = PlanState & SeamlessImmutable.ImmutableObject<PlanState>;

/** initial Plan state */
const initialState: ImmutablePlanState = SeamlessImmutable({
  plansById: {},
});

/** the Plan reducer function */
export default function reducer(state = initialState, action: PlanActionTypes): ImmutablePlanState {
  switch (action.type) {
    case PLANS_FETCHED:
      return (state as any).merge({
        /** DIRTY HACK TO BE FIXED */
        plansById: action.plansById,
      });
    default:
      return state;
  }
}

// action creators

/** fetch Plans creator
 * @param {Plan[]} plansList - array of plan objects
 */
export const fetchPlans = (plansList: Plan[]): FetchPlansAction => ({
  plansById: keyBy(plansList, plan => plan.plan_id),
  type: PLANS_FETCHED,
});

// selectors

/** get plans by id
 * @param {Partial<Store>} state - the redux store
 */
export function getPlansById(state: Partial<Store>): { [key: string]: Plan } {
  return (state as any)[reducerName].plansById;
}

/** get an array of plan objects
 * @param {Partial<Store>} state - the redux store
 */
export function getPlansArray(state: Partial<Store>): Plan[] {
  return values((state as any)[reducerName].plansById);
}

/** get an array of plan ids
 * @param {Partial<Store>} state - the redux store
 */
export function getPlansIdArray(state: Partial<Store>): string[] {
  return keys((state as any)[reducerName].plansById);
}

/** get one plan using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} id - the plan id
 */
export function getPlanById(state: Partial<Store>, id: string): Plan | null {
  return get((state as any)[reducerName].plansById, id) || null;
}
