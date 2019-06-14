import { get, keyBy, keys, pickBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { transformValues } from '../../helpers/utils';

/** the reducer name */
export const reducerName = 'plans';

/** Enum representing the possible intervention types */
export enum InterventionType {
  FI = 'FI',
  IRS = 'IRS',
}

/** interface for plan Object */
export interface Plan {
  id: string;
  jurisdiction_depth: number;
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_name_path: string[];
  jurisdiction_parent_id: string;
  jurisdiction_path: string[];
  plan_fi_reason: string;
  plan_fi_status: string;
  plan_id: string;
  plan_intervention_type: InterventionType;
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
      return SeamlessImmutable({
        ...state,
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

// selectors

/** get plans by id
 * @param {Partial<Store>} state - the redux store
 */
export function getPlansById(
  state: Partial<Store>,
  intervention: InterventionType = InterventionType.FI
): { [key: string]: Plan } {
  const plansById = (state as any)[reducerName].plansById;
  return pickBy(plansById, (plan: Plan) => plan.plan_intervention_type === intervention);
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
