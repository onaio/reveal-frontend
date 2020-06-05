import intersect from 'fast_array_intersect';
import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';
import { InterventionType, PlanStatus } from '../plans';

/** the reducer name */
export const reducerName = 'MDAPointPlans';

/** MDAPointPlan interface */
export interface MDAPointPlan {
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

/** MDA_POINT_PLAN_FETCHED action type */
export const MDA_POINT_PLANS_FETCHED =
  'reveal/reducer/MDAPoint/MDAPointPlan/MDA_Point_PLANS_FETCHED';

/** MDA_POINT_PLAN_FETCHED action type */
export const REMOVE_MDA_POINT_PLANS = 'reveal/reducer/MDAPoint/MDAPointPlan/REMOVE_MDA_POINT_PLANS';

/** MDA_POINT_PLAN_FETCHED action type */
export const ADD_MDA_POINT_PLAN = 'reveal/reducer/MDAPoint/MDAPointPlan/ADD_MDA_POINT_PLAN';

/** interface for fetch MDAPointPlans action */
interface FetchMDAPointPlansAction extends AnyAction {
  MDAPointPlansById: { [key: string]: MDAPointPlan };
  type: typeof MDA_POINT_PLANS_FETCHED;
}

/** interface for removing MDAPointPlans action */
interface RemoveMDAPointPlansAction extends AnyAction {
  MDAPointPlansById: { [key: string]: MDAPointPlan };
  type: typeof REMOVE_MDA_POINT_PLANS;
}

/** interface for adding a single MDAPointPlans action */
interface AddMDAPointPlanAction extends AnyAction {
  MDAPointPlanObj: MDAPointPlan;
  type: typeof ADD_MDA_POINT_PLAN;
}

/** Create type for MDAPointPlan reducer actions */
export type MDAPointPlanActionTypes =
  | FetchMDAPointPlansAction
  | RemoveMDAPointPlansAction
  | AddMDAPointPlanAction
  | AnyAction;

// action creators

/**
 * Fetch Plan Definitions action creator
 * @param {MDAPointPlan[]} MDAPointPlanList - list of plan definition objects
 */
export const fetchMDAPointPlans = (
  MDAPointPlanList: MDAPointPlan[] = []
): FetchMDAPointPlansAction => ({
  MDAPointPlansById: keyBy(MDAPointPlanList, 'plan_id'),
  type: MDA_POINT_PLANS_FETCHED,
});

/** Reset plan definitions state action creator */
export const removeMDAPointPlans = () => ({
  MDAPointPlansById: {},
  type: REMOVE_MDA_POINT_PLANS,
});

/**
 * Add one Plan Definition action creator
 * @param {MDAPointPlan} MDAPointPlanObj - the plan definition object
 */
export const addMDAPointPlan = (MDAPointPlanObj: MDAPointPlan): AddMDAPointPlanAction => ({
  MDAPointPlanObj,
  type: ADD_MDA_POINT_PLAN,
});

// the reducer

/** interface for MDAPointPlan state */
interface MDAPointPlanState {
  MDAPointPlansById: { [key: string]: MDAPointPlan } | {};
}

/** immutable MDAPointPlan state */
export type ImmutableMDAPointPlanState = SeamlessImmutable.ImmutableObject<MDAPointPlanState> &
  MDAPointPlanState;

/** initial MDAPointPlan state */
const initialState: ImmutableMDAPointPlanState = SeamlessImmutable({
  MDAPointPlansById: {},
});

/** the MDAPointPlan reducer function */
export default function reducer(
  state = initialState,
  action: MDAPointPlanActionTypes
): ImmutableMDAPointPlanState {
  switch (action.type) {
    case MDA_POINT_PLANS_FETCHED:
      if (action.MDAPointPlansById) {
        return SeamlessImmutable({
          ...state,
          MDAPointPlansById: { ...state.MDAPointPlansById, ...action.MDAPointPlansById },
        });
      }
      return state;
    case ADD_MDA_POINT_PLAN:
      if (action.MDAPointPlanObj as MDAPointPlan) {
        return SeamlessImmutable({
          ...state,
          MDAPointPlansById: {
            ...state.MDAPointPlansById,
            [action.MDAPointPlanObj.plan_id as string]: action.MDAPointPlanObj,
          },
        });
      }
      return state;
    case REMOVE_MDA_POINT_PLANS:
      return SeamlessImmutable({
        ...state,
        MDAPointPlansById: action.MDAPointPlansById,
      });
    default:
      return state;
  }
}

// selectors

/** get MDAPointPlans by id
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} interventionType - the MDAPointPlan intervention Type
 * @returns {{ [key: string]: MDAPointPlan }} MDAPointPlans by id
 */
export function getMDAPointPlansById(
  state: Partial<Store>,
  interventionType: InterventionType = InterventionType.MDAPoint
): { [key: string]: MDAPointPlan } {
  if (interventionType) {
    return keyBy(getMDAPointPlansArray(state, interventionType), 'plan_id');
  }
  return (state as any)[reducerName].MDAPointPlansById;
}

/** get one MDAPointPlan using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the MDAPointPlan id
 * @returns {MDAPointPlan|null} a MDAPointPlan object or null
 */
export function getMDAPointPlanById(state: Partial<Store>, planId: string): MDAPointPlan | null {
  return get((state as any)[reducerName].MDAPointPlansById, planId) || null;
}

/** get an array of MDAPointPlan objects
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} interventionType - the MDAPointPlan intervention Type
 * @returns {MDAPointPlan[]} an array of MDAPointPlan objects
 */
export function getMDAPointPlansArray(
  state: Partial<Store>,
  interventionType: InterventionType = InterventionType.MDAPoint
): MDAPointPlan[] {
  const result = values((state as any)[reducerName].MDAPointPlansById);
  return result.filter((e: MDAPointPlan) => e.plan_intervention_type === interventionType);
}

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of MDAPoint plan filter options/params */
export interface MDAPointPlanFilters {
  plan_title?: string /** MDAPoint plan title */;
}

/** MDAPointPlansArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const MDAPointPlansArrayBaseSelector = (planKey?: string) => (
  state: Partial<Store>
): MDAPointPlan[] => values((state as any)[reducerName][planKey ? planKey : 'MDAPointPlansById']);

/** getMDAPointPlansArrayByTitle
 * Gets title from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getTitle = (_: Partial<Store>, props: MDAPointPlanFilters) => props.plan_title;

/** getPlansArrayByTitle
 * Gets an array of Plan objects filtered by plan title
 * @param {Partial<Store>} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan defintion filters object
 */
export const getMDAPointPlansArrayByTitle = (planKey?: string) =>
  createSelector([MDAPointPlansArrayBaseSelector(planKey), getTitle], (plans, title) =>
    title
      ? plans.filter(plan => plan.plan_title.toLowerCase().includes(title.toLowerCase()))
      : plans
  );

/** makeMDAPointPlansArraySelector
 * Returns a selector that gets an array of MDAPointPlan objects filtered by one or all
 * of the following:
 *    - plan_title
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * This selector is meant to be a memoized replacement for getMDAPointPlansArray.
 *
 * To use this selector, do something like:
 *    const MDAPointPlansArraySelector = makeMDAPointPlansArraySelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 * @param {string} sortField - sort by field
 */
export const makeMDAPointPlansArraySelector = (planKey?: string) => {
  return createSelector([getMDAPointPlansArrayByTitle(planKey)], plans =>
    intersect([plans], JSON.stringify)
  );
};
