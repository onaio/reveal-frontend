import {
  fetchActionCreatorFactory,
  getItemByIdFactory,
  getItemsByIdFactory,
  reducerFactory,
  removeActionCreatorFactory,
} from '@opensrp/reducer-factory';
import intersect from 'fast_array_intersect';
import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';
import { InterventionType, PlanStatus } from '../plans';

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

/** the reducer name */
export const reducerName = 'AllGenericPlans';
export const SMCreducerName = 'SMCPlans';

/** generic plans Reducer */
const reducer = reducerFactory<GenericPlan>(reducerName);
export default reducer;

/** SMC_PLAN_FETCHED action type */
export const SMC_PLANS_FETCHED = 'reveal/reducer/SMC/SMCPlan/SMC_PLANS_FETCHED';

/** SMC_PLAN_FETCHED action type */
export const REMOVE_SMC_PLANS = 'reveal/reducer/SMC/SMCPlan/REMOVE_SMC_PLANS';

/** SMC_PLAN_FETCHED action type */
export const ADD_SMC_PLAN = 'reveal/reducer/SMC/SMCPlan/ADD_SMC_PLAN';
/** interface for fetch SMCPlans action */
interface FetchSMCPlansAction extends AnyAction {
  SMCPlansById: { [key: string]: GenericPlan };
  type: typeof SMC_PLANS_FETCHED;
}

/** interface for removing SMCPlans action */
interface RemoveSMCPlansAction extends AnyAction {
  SMCPlansById: { [key: string]: GenericPlan };
  type: typeof REMOVE_SMC_PLANS;
}

/** interface for adding a single smcplans action */
interface AddSMCPlanAction extends AnyAction {
  SMCPlanObj: GenericPlan;
  type: typeof ADD_SMC_PLAN;
}

/** Create type for SMCPlan reducer actions */
export type SMCPlanActionTypes =
  | FetchSMCPlansAction
  | RemoveSMCPlansAction
  | AddSMCPlanAction
  | AnyAction;

/**
 * Fetch Plan Definitions action creator
 * @param {GenericPlan[]} SMCPlanList - list of plan definition objects
 */
export const fetchSMCPlans = (SMCPlanList: GenericPlan[] = []): FetchSMCPlansAction => ({
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
 * @param {GenericPlan} SMCPlanObj - the plan definition object
 */
export const addSMCPlan = (SMCPlanObj: GenericPlan): AddSMCPlanAction => ({
  SMCPlanObj,
  type: ADD_SMC_PLAN,
});

// actions
/** actionCreator returns action to to add Item records to store */
export const genericFetchPlans = fetchActionCreatorFactory<GenericPlan>(reducerName, 'plan_id');
/** actionCreator returns action to to remove Item records to store */
export const genericRemovePlans = removeActionCreatorFactory(reducerName);

// selectors
/** get one Plan using its id */
export const getPlanByIdSelector = getItemByIdFactory<GenericPlan>(reducerName);

/** get all plans by ids */
export const getAllPlansByIds = getItemsByIdFactory<GenericPlan>(reducerName);

/** This interface represents the structure of plans filter options/params */
export interface PlanFilters {
  plan_title?: string /** plan title */;
  statusList?: string[] /** array of plan statuses */;
  interventionTypes?: InterventionType[] /** intervention types */;
}

// TODO - memoize this
/** PlansArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const PlansArrayBaseSelector = (state: Partial<Store>): GenericPlan[] =>
  values(getAllPlansByIds(state) || {});

/** getTitle
 * Gets title from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getTitle = (_: Partial<Store>, props: PlanFilters) => props.plan_title;

/** getStatusList
 * Gets statusList from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getStatusList = (_: Partial<Store>, props: PlanFilters) => props.statusList;

/** getIntervention types
 * @param state - the redux store
 * @param props - the plan filter object
 */
export const getInterventionTypes = (_: Partial<Store>, props: PlanFilters) =>
  props.interventionTypes;

/**
 * Gets an array of Plan objects filtered by plan title
 * @param  state - the redux store
 * @param  props - the plan filters object
 */
export const plansByIntervention = () =>
  createSelector(PlansArrayBaseSelector, getInterventionTypes, (plans, interventionTypes) =>
    interventionTypes
      ? plans.filter(plan => interventionTypes.includes(plan.plan_intervention_type))
      : plans
  );

/** getPlansArrayByTitle
 * Gets an array of Plan objects filtered by plan title
 * @param  state - the redux store
 * @param  props - the plan filters object
 */
export const getPlansArrayByTitle = () =>
  createSelector([plansByIntervention(), getTitle], (plans, title) => {
    return title
      ? plans.filter(
          plan => plan.plan_title && plan.plan_title.toLowerCase().includes(title.toLowerCase())
        )
      : plans;
  });

/** getPlansArrayByStatus
 * Gets an array of Plan objects filtered by plan status
 * @param  state - the redux store
 * @param  props - the plan filters object
 */
export const getPlansArrayByStatus = () =>
  createSelector([plansByIntervention(), getStatusList], (plans, statusList) =>
    statusList
      ? plans.filter(plan => (statusList.length ? statusList.includes(plan.plan_status) : true))
      : plans
  );

/** makePlansArraySelector
 * Returns a selector that gets an array of Plan objects filtered by one or all
 * of the following:
 *    - plan_title
 *    - plan status
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * To use this selector, do something like:
 *    const PlansArraySelector = makePlansArraySelector(<plan intervention type>);
 *
 * @param  state - the redux store
 * @param {PlanFilters} props - the plan filters object
 * @param {string} sortField - sort by field
 */
export const makeGenericPlansArraySelector = () => {
  return createSelector([getPlansArrayByTitle(), getPlansArrayByStatus()], (plan1, plan2) =>
    intersect([plan1, plan2], JSON.stringify)
  );
};

// the reducer SMC
//

/** interface for SMCPlan state */
interface SMCPlanState {
  SMCPlansById: { [key: string]: GenericPlan } | {};
}

/** immutable SMCPlan state */
export type ImmutableSMCPlanState = SeamlessImmutable.ImmutableObject<SMCPlanState> & SMCPlanState;

/** initial SMCPlan state */
const initialStateSMC: ImmutableSMCPlanState = SeamlessImmutable({
  SMCPlansById: {},
});

/** the SMCPlan reducer function */
export function reducerSMC(
  state = initialStateSMC,
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
      if (action.SMCPlanObj as GenericPlan) {
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
 * @returns {{ [key: string]: GenericPlan }} SMCPlans by id
 */
export function getSMCPlansById(
  state: Partial<Store>,
  interventionType: InterventionType = InterventionType.MDA
): { [key: string]: GenericPlan } {
  if (interventionType) {
    return keyBy(getSMCPlansArray(state, interventionType), 'plan_id');
  }
  return (state as any)[reducerName].SMCPlansById;
}

/** get one SMCPlan using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the SMCPlan id
 * @returns {GenericPlan|null} a SMCPlan object or null
 */
export function getSMCPlanById(state: Partial<Store>, planId: string): GenericPlan | null {
  return get((state as any)[reducerName].SMCPlansById, planId) || null;
}

/** get an array of SMCPlan objects
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} interventionType - the SMCPlan intervention Type
 * @returns {GenericPlan[]} an array of SMCPlan objects
 */
export function getSMCPlansArray(
  state: Partial<Store>,
  interventionType: InterventionType = InterventionType.MDA
): GenericPlan[] {
  const result = values((state as any)[reducerName].SMCPlansById);
  return result.filter((e: GenericPlan) => e.plan_intervention_type === interventionType);
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
export const SMCPlansArrayBaseSelector = (planKey?: string) => (
  state: Partial<Store>
): GenericPlan[] => values((state as any)[reducerName][planKey ? planKey : 'SMCPlansById']);

/** getSMCPlansArrayByTitle
 * Gets title from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getTitleSMC = (_: Partial<Store>, props: SMCPlanFilters) => props.plan_title;

/** getStatusList
 * Gets statusList from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getStatusListSMC = (_: Partial<Store>, props: SMCPlanFilters) => props.statusList;

/** getPlansArrayByTitle
 * Gets an array of Plan objects filtered by plan title
 * @param {Partial<Store>} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan defintion filters object
 */
export const getSMCPlansArrayByTitle = (planKey?: string) =>
  createSelector([SMCPlansArrayBaseSelector(planKey), getTitleSMC], (plans, title) =>
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
  createSelector([SMCPlansArrayBaseSelector(planKey), getStatusListSMC], (plans, statusList) =>
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
