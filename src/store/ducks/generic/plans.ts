import intersect from 'fast_array_intersect';
import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';
import { InterventionType, PlanStatus } from '../plans';

/** the reducer name */
export const reducerName = 'IRSPlans';

/** IRSPlan interface */
export interface GenericPlan {
  plan_date: string;
  plan_effective_period_end: string;
  plan_effective_period_start: string;
  plan_fi_reason: string;
  plan_fi_status: string;
  plan_id: string;
  plan_intervention_type: InterventionType;
  plan_name: string;
  plan_status: PlanStatus;
  plan_title: string;
  plan_version: string;
  jurisdiction_root_parent_ids: string[];
}

// actions

/** IRS_PLAN_FETCHED action type */
export const IRS_PLANS_FETCHED = 'reveal/reducer/IRS/IRSPlan/IRS_PLANS_FETCHED';

/** IRS_PLAN_FETCHED action type */
export const REMOVE_IRS_PLANS = 'reveal/reducer/IRS/IRSPlan/REMOVE_IRS_PLANS';

/** IRS_PLAN_FETCHED action type */
export const ADD_IRS_PLAN = 'reveal/reducer/IRS/IRSPlan/ADD_IRS_PLAN';

/** interface for fetch IRSPlans action */
interface FetchIRSPlansAction extends AnyAction {
  IRSPlansById: { [key: string]: GenericPlan };
  type: typeof IRS_PLANS_FETCHED;
}

/** interface for removing IRSPlans action */
interface RemoveIRSPlansAction extends AnyAction {
  IRSPlansById: { [key: string]: GenericPlan };
  type: typeof REMOVE_IRS_PLANS;
}

/** interface for adding a single IRSPlans action */
interface AddIRSPlanAction extends AnyAction {
  IRSPlanObj: GenericPlan;
  type: typeof ADD_IRS_PLAN;
}

/** Create type for IRSPlan reducer actions */
export type IRSPlanActionTypes =
  | FetchIRSPlansAction
  | RemoveIRSPlansAction
  | AddIRSPlanAction
  | AnyAction;

// action creators

/**
 * Fetch Plan Definitions action creator
 * @param {GenericPlan[]} IRSPlanList - list of plan definition objects
 */
export const fetchIRSPlans = (IRSPlanList: GenericPlan[] = []): FetchIRSPlansAction => ({
  IRSPlansById: keyBy(IRSPlanList, 'plan_id'),
  type: IRS_PLANS_FETCHED,
});

/** Reset plan definitions state action creator */
export const removeIRSPlans = () => ({
  IRSPlansById: {},
  type: REMOVE_IRS_PLANS,
});

/**
 * Add one Plan Definition action creator
 * @param {GenericPlan} IRSPlanObj - the plan definition object
 */
export const addIRSPlan = (IRSPlanObj: GenericPlan): AddIRSPlanAction => ({
  IRSPlanObj,
  type: ADD_IRS_PLAN,
});

// the reducer

/** interface for IRSPlan state */
interface IRSPlanState {
  IRSPlansById: { [key: string]: GenericPlan } | {};
}

/** immutable IRSPlan state */
export type ImmutableIRSPlanState = SeamlessImmutable.ImmutableObject<IRSPlanState> & IRSPlanState;

/** initial IRSPlan state */
const initialState: ImmutableIRSPlanState = SeamlessImmutable({
  IRSPlansById: {},
});

/** the IRSPlan reducer function */
export default function reducer(
  state = initialState,
  action: IRSPlanActionTypes
): ImmutableIRSPlanState {
  switch (action.type) {
    case IRS_PLANS_FETCHED:
      if (action.IRSPlansById) {
        return SeamlessImmutable({
          ...state,
          IRSPlansById: { ...state.IRSPlansById, ...action.IRSPlansById },
        });
      }
      return state;
    case ADD_IRS_PLAN:
      if (action.IRSPlanObj as GenericPlan) {
        return SeamlessImmutable({
          ...state,
          IRSPlansById: {
            ...state.IRSPlansById,
            [action.IRSPlanObj.plan_id as string]: action.IRSPlanObj,
          },
        });
      }
      return state;
    case REMOVE_IRS_PLANS:
      return SeamlessImmutable({
        ...state,
        IRSPlansById: action.IRSPlansById,
      });
    default:
      return state;
  }
}

// selectors

/** get IRSPlans by id
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} interventionType - the IRSPlan intervention Type
 * @returns {{ [key: string]: GenericPlan }} IRSPlans by id
 */
export function getIRSPlansById(
  state: Partial<Store>,
  interventionType: InterventionType = InterventionType.IRS
): { [key: string]: GenericPlan } {
  if (interventionType) {
    return keyBy(getIRSPlansArray(state, interventionType), 'plan_id');
  }
  return (state as any)[reducerName].IRSPlansById;
}

/** get one IRSPlan using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the IRSPlan id
 * @returns {GenericPlan|null} a IRSPlan object or null
 */
export function getIRSPlanById(state: Partial<Store>, planId: string): GenericPlan | null {
  return get((state as any)[reducerName].IRSPlansById, planId) || null;
}

/** get an array of IRSPlan objects
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} interventionType - the IRSPlan intervention Type
 * @returns {GenericPlan[]} an array of IRSPlan objects
 */
export function getIRSPlansArray(
  state: Partial<Store>,
  interventionType: InterventionType = InterventionType.IRS
): GenericPlan[] {
  const result = values((state as any)[reducerName].IRSPlansById);
  return result.filter((e: GenericPlan) => e.plan_intervention_type === interventionType);
}

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of IRS plan filter options/params */
export interface IRSPlanFilters {
  plan_title?: string /** IRS plan title */;
}

/** IRSPlansArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const IRSPlansArrayBaseSelector = (planKey?: string) => (
  state: Partial<Store>
): GenericPlan[] => values((state as any)[reducerName][planKey ? planKey : 'IRSPlansById']);

/** getIRSPlansArrayByTitle
 * Gets title from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getTitle = (_: Partial<Store>, props: IRSPlanFilters) => props.plan_title;

/** getPlansArrayByTitle
 * Gets an array of Plan objects filtered by plan title
 * @param {Partial<Store>} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan defintion filters object
 */
export const getIRSPlansArrayByTitle = (planKey?: string) =>
  createSelector([IRSPlansArrayBaseSelector(planKey), getTitle], (plans, title) =>
    title
      ? plans.filter(plan => plan.plan_title.toLowerCase().includes(title.toLowerCase()))
      : plans
  );

/** makeIRSPlansArraySelector
 * Returns a selector that gets an array of IRSPlan objects filtered by one or all
 * of the following:
 *    - plan_title
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * This selector is meant to be a memoized replacement for getIRSPlansArray.
 *
 * To use this selector, do something like:
 *    const IRSPlansArraySelector = makeIRSPlansArraySelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 * @param {string} sortField - sort by field
 */
export const makeIRSPlansArraySelector = (planKey?: string) => {
  return createSelector([getIRSPlansArrayByTitle(planKey)], plans =>
    intersect([plans], JSON.stringify)
  );
};
