import {
  fetchActionCreatorFactory,
  getItemByIdFactory,
  reducerFactory,
  removeActionCreatorFactory,
} from '@opensrp/reducer-factory';
import intersect from 'fast_array_intersect';
import { values } from 'lodash';
import { Store } from 'redux';
import { createSelector } from 'reselect';
import { GenericPlan } from './plans';

/** the reducer name */
export const reducerName = 'DynamicMdaReportPlans';

/** Dynamic MDA Reducer */
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

/** This interface represents the structure of IRS plan filter options/params */
export interface PlanFilters {
  plan_title?: string /** plan title */;
  statusList?: string[] /** array of plan statuses */;
}

/** PlansArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const PlansArrayBaseSelector = (planKey?: string) => (
  state: Partial<Store>
): GenericPlan[] => values((state as any)[reducerName][planKey ? planKey : 'objectsById']);

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

/** getPlansArrayByTitle
 * Gets an array of Plan objects filtered by plan title
 * @param  state - the redux store
 * @param  props - the plan filters object
 */
export const getPlansArrayByTitle = (planKey?: string) =>
  createSelector([PlansArrayBaseSelector(planKey), getTitle], (plans, title) =>
    title
      ? plans.filter(plan => plan.plan_title.toLowerCase().includes(title.toLowerCase()))
      : plans
  );

/** getPlansArrayByStatus
 * Gets an array of Plan objects filtered by plan status
 * @param  state - the redux store
 * @param  props - the plan filters object
 */
export const getPlansArrayByStatus = (planKey?: string) =>
  createSelector([PlansArrayBaseSelector(planKey), getStatusList], (plans, statusList) =>
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
 *    const PlansArraySelector = makePlansArraySelector();
 *
 * @param  state - the redux store
 * @param {PlanFilters} props - the plan filters object
 * @param {string} sortField - sort by field
 */
export const makePlansArraySelector = (planKey?: string) => {
  return createSelector(
    [getPlansArrayByTitle(planKey), getPlansArrayByStatus(planKey)],
    (plan1, plan2) => intersect([plan1, plan2], JSON.stringify)
  );
};
