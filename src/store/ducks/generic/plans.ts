import {
  fetchActionCreatorFactory,
  getItemByIdFactory,
  getItemsByIdFactory,
  reducerFactory,
  removeActionCreatorFactory,
} from '@opensrp/reducer-factory';
import intersect from 'fast_array_intersect';
import { values } from 'lodash';
import { Store } from 'redux';
import { createSelector } from 'reselect';
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

/** generic plans Reducer */
const reducer = reducerFactory<GenericPlan>(reducerName);
export default reducer;

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
