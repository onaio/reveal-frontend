import intersect from 'fast_array_intersect';
import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';
import { InterventionType, PlanStatus } from '../plans';

/** the reducer name */
export const reducerName = 'SMCPlans';

/** SMCPointPlan interface */
export interface SMCPlan {
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

/** SMC_POINT_PLAN_FETCHED action type */
export const SMC_PLANS_FETCHED = 'reveal/reducer/SMC/SMCPlan/SMC_PLANS_FETCHED';

/** SMC_PLAN_FETCHED action type */
export const REMOVE_SMC_PLANS = 'reveal/reducer/SMC/SMCPlan/REMOVE_SMC_PLANS';

/** SMC_POINT_PLAN_FETCHED action type */
export const ADD_SMC_PLAN = 'reveal/reducer/SMC/SMCPlan/ADD_SMC_PLAN';

/** interface for fetch SMCPlans action */
interface FetchSMCPlansAction extends AnyAction {
  SMCPlansById: { [key: string]: SMCPlan };
  type: typeof SMC_PLANS_FETCHED;
}

/** interface for removing SMCPlans action */
interface RemoveSMCPlansAction extends AnyAction {
  SMCPlansById: { [key: string]: SMCPlan };
  type: typeof REMOVE_SMC_PLANS;
}

/** interface for adding a single SMCPlans action */
interface AddSMCPlanAction extends AnyAction {
  SMCPlanObj: SMCPlan;
  type: typeof ADD_SMC_PLAN;
}

/** Create type for SMCPlan reducer actions */
export type SMCPlanActionTypes =
  | FetchSMCPlansAction
  | RemoveSMCPlansAction
  | AddSMCPlanAction
  | AnyAction;

// action creators

/**
 * Fetch Plan Definitions action creator
 * @param {SMCPlan[]} SMCPlanList - list of plan definition objects
 */
export const fetchSMCPlans = (SMCPlanList: SMCPlan[] = []): FetchSMCPlansAction => ({
  SMCPlansById: keyBy(SMCPlanList, 'plan_id'),
  type: SMC_PLANS_FETCHED,
});

/** Reset plan definitions state action creator */
export const removeSMCPlans = () => ({
  SMCPlansById: {},
  type: REMOVE_SMC_PLANS,
});

/**
 * Add one Plan Definition action creator
 * @param {SMCPlan} SMCPlanObj - the plan definition object
 */
export const addSMCPlan = (SMCPlanObj: SMCPlan): AddSMCPlanAction => ({
  SMCPlanObj,
  type: ADD_SMC_PLAN,
});

// the reducer

/** interface for SMCPlan state */
interface SMCPlanState {
  SMCPlansById: { [key: string]: SMCPlan } | {};
}

/** immutable SMCPlan state */
export type ImmutableSMCPlanState = SeamlessImmutable.ImmutableObject<SMCPlanState> & SMCPlanState;

/** initial MDAPointPlan state */
const initialState: ImmutableSMCPlanState = SeamlessImmutable({
  SMCPlansById: {},
});

/** the SMCPlan reducer function */
export default function reducer(
  state = initialState,
  action: SMCPlanActionTypes
): ImmutableSMCPlanState {
  switch (action.type) {
    case SMC_PLANS_FETCHED:
      if (action.SMCPlansById) {
        return SeamlessImmutable({
          ...state,
          SMCPlansById: { ...state.SMCPlansById, ...action.SMCPlansById },
        });
      }
      return state;
    case ADD_SMC_PLAN:
      if (action.SMCPlanObj as SMCPlan) {
        return SeamlessImmutable({
          ...state,
          SMCPlansById: {
            ...state.SMCPlansById,
            [action.SMCPlanObj.plan_id as string]: action.SMCPlanObj,
          },
        });
      }
      return state;
    case REMOVE_SMC_PLANS:
      return SeamlessImmutable({
        ...state,
        SMCPlansById: action.SMCPlansById,
      });
    default:
      return state;
  }
}

// selectors

/** get SMCPlans by id
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} interventionType - the SMCPlan intervention Type
 * @returns {{ [key: string]: SMCPlan }} SMCPlans by id
 */
export function getSMCPlansById(
  state: Partial<Store>,
  interventionType: InterventionType = InterventionType.SMC
): { [key: string]: SMCPlan } {
  if (interventionType) {
    return keyBy(getSMCPlansArray(state, interventionType), 'plan_id');
  }
  return (state as any)[reducerName].SMCPlansById;
}

/** get one SMCPlan using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the SMCPlan id
 * @returns {SMCPlan|null} a SMCPointPlan object or null
 */
export function getSMCPlanById(state: Partial<Store>, planId: string): SMCPlan | null {
  return get((state as any)[reducerName].SMCPlansById, planId) || null;
}

/** get an array of SMCPlan objects
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} interventionType - the SMCPlan intervention Type
 * @returns {SMCPlan[]} an array of SMCPlan objects
 */
export function getSMCPlansArray(
  state: Partial<Store>,
  interventionType: InterventionType = InterventionType.SMC
): SMCPlan[] {
  const result = values((state as any)[reducerName].SMCPlansById);
  return result.filter((e: SMCPlan) => e.plan_intervention_type === interventionType);
}

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of SMC plan filter options/params */
export interface SMCPlanFilters {
  plan_title?: string /** SMC plan title */;
  statusList?: string[] /** array of plan statuses */;
}

/** SMCPlansArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const SMCPlansArrayBaseSelector = (planKey?: string) => (state: Partial<Store>): SMCPlan[] =>
  values((state as any)[reducerName][planKey ? planKey : 'SMCPlansById']);

/** getSMCPlansArrayByTitle
 * Gets title from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getTitle = (_: Partial<Store>, props: SMCPlanFilters) => props.plan_title;

/** getStatusList
 * Gets statusList from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getStatusList = (_: Partial<Store>, props: SMCPlanFilters) => props.statusList;

/** getPlansArrayByTitle
 * Gets an array of Plan objects filtered by plan title
 * @param {Partial<Store>} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan defintion filters object
 */
export const getSMCPlansArrayByTitle = (planKey?: string) =>
  createSelector([SMCPlansArrayBaseSelector(planKey), getTitle], (plans, title) =>
    title
      ? plans.filter(plan => plan.plan_title.toLowerCase().includes(title.toLowerCase()))
      : plans
  );

/** getSMCPlansArrayByStatus
 * Gets an array of Plan objects filtered by plan status
 * @param {Partial<Store>} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan defintion filters object
 */
export const getSMCPlansArrayByStatus = (planKey?: string) =>
  createSelector([SMCPlansArrayBaseSelector(planKey), getStatusList], (plans, statusList) =>
    statusList
      ? plans.filter(plan => (statusList.length ? statusList.includes(plan.plan_status) : true))
      : plans
  );

/** makeSMCPlansArraySelector
 * Returns a selector that gets an array of SMCPlan objects filtered by one or all
 * of the following:
 *    - plan_title
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * This selector is meant to be a memoized replacement for getSMCPlansArray.
 *
 * To use this selector, do something like:
 *    const SMCPlansArraySelector = makeSMCPlansArraySelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 * @param {string} sortField - sort by field
 */
export const makeSMCPlansArraySelector = (planKey?: string) => {
  return createSelector(
    [getSMCPlansArrayByTitle(planKey), getSMCPlansArrayByStatus(planKey)],
    (plan1, plan2) => intersect([plan1, plan2], JSON.stringify)
  );
};
