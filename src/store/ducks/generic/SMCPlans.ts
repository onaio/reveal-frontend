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
import { GenericPlan } from './plans';

export type SMCPLANType = Omit<GenericPlan, 'plan_fi_reason' | 'plan_fi_statusts'>;

/** the reducer name */
export const reducerName = 'SMCPlans';

/** generic plans Reducer */
const reducer = reducerFactory<SMCPLANType>(reducerName);
export default reducer;

// actions
/** actionCreator returns action to to add Item records to store */
export const fetchSMCPlans = fetchActionCreatorFactory<SMCPLANType>(reducerName, 'plan_id');
/** actionCreator returns action to to remove Item records to store */
export const removeSMCPlans = removeActionCreatorFactory(reducerName);

// selectors
/** get one Plan using its id */
export const getSMCPlanById = getItemByIdFactory<SMCPLANType>(reducerName);

/** get all plans by ids */
export const getSMCPlansArray = getItemsByIdFactory<SMCPLANType>(reducerName);

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of SMC plan filter options/params */
export interface SMCPlanFilters {
  plan_title?: string /** SMC plan title */;
  statusList?: string[] /** array of plan statuses */;
}

/** SMCPlansArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const SMCPlansArrayBaseSelector = (state: Partial<Store>): SMCPLANType[] =>
  values(getSMCPlansArray(state) || {});

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
export const getSMCPlansArrayByTitle = () =>
  createSelector([SMCPlansArrayBaseSelector, getTitle], (plans, title) =>
    title
      ? plans.filter(plan => plan.plan_title.toLowerCase().includes(title.toLowerCase()))
      : plans
  );

/** getSMCPlansArrayByStatus
 * Gets an array of Plan objects filtered by plan status
 * @param {Partial<Store>} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan defintion filters object
 */
export const getSMCPlansArrayByStatus = () =>
  createSelector([SMCPlansArrayBaseSelector, getStatusList], (plans, statusList) =>
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
export const makeSMCPlansArraySelector = () => {
  return createSelector([getSMCPlansArrayByTitle(), getSMCPlansArrayByStatus()], (plan1, plan2) =>
    intersect([plan1, plan2], JSON.stringify)
  );
};
