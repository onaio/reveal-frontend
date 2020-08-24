import {
  fetchActionCreatorFactory,
  getItemByIdFactory,
  reducerFactory,
  removeActionCreatorFactory,
} from '@opensrp/reducer-factory';
import intersect from 'fast_array_intersect';
import { keyBy, values } from 'lodash';
import { Store } from 'redux';
import { createSelector } from 'reselect';
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

/** IRS plans Reducer */
const reducer = reducerFactory<GenericPlan>(reducerName);
export default reducer;

// actions

/** actionCreator returns action to to add Item records to store */
export const fetchIRSPlans = fetchActionCreatorFactory<GenericPlan>(reducerName, 'plan_id');

/** Reset plan definitions state action creator */
export const removeIRSPlans = removeActionCreatorFactory(reducerName);

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
  return (state as any)[reducerName].objectsById;
}

/** get one IRSPlan using its id */
export const getIRSPlanById = getItemByIdFactory<GenericPlan>(reducerName);

/** get an array of IRSPlan objects
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} interventionType - the IRSPlan intervention Type
 * @returns {GenericPlan[]} an array of IRSPlan objects
 */
export function getIRSPlansArray(
  state: Partial<Store>,
  interventionType: InterventionType = InterventionType.IRS
): GenericPlan[] {
  const result = values((state as any)[reducerName].objectsById);
  return result.filter((e: GenericPlan) => e.plan_intervention_type === interventionType);
}

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of IRS plan filter options/params */
export interface IRSPlanFilters {
  plan_title?: string /** IRS plan title */;
  statusList?: string[] /** array of plan statuses */;
}

/** IRSPlansArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const IRSPlansArrayBaseSelector = () => (state: Partial<Store>): GenericPlan[] =>
  values((state as any)[reducerName].objectsById);

/** getIRSPlansArrayByTitle
 * Gets title from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getTitle = (_: Partial<Store>, props: IRSPlanFilters) => props.plan_title;

/** getStatusList
 * Gets statusList from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getStatusList = (_: Partial<Store>, props: IRSPlanFilters) => props.statusList;

/** getPlansArrayByTitle
 * Gets an array of Plan objects filtered by plan title
 * @param {Partial<Store>} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan defintion filters object
 */
export const getIRSPlansArrayByTitle = () =>
  createSelector([IRSPlansArrayBaseSelector(), getTitle], (plans, title) =>
    title
      ? plans.filter(plan => plan.plan_title.toLowerCase().includes(title.toLowerCase()))
      : plans
  );

/** getIRSPlansArrayByStatus
 * Gets an array of Plan objects filtered by plan status
 * @param {Partial<Store>} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan defintion filters object
 */
export const getIRSPlansArrayByStatus = () =>
  createSelector([IRSPlansArrayBaseSelector(), getStatusList], (plans, statusList) =>
    statusList
      ? plans.filter(plan => (statusList.length ? statusList.includes(plan.plan_status) : true))
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
export const makeIRSPlansArraySelector = () => {
  return createSelector([getIRSPlansArrayByTitle(), getIRSPlansArrayByStatus()], (plan1, plan2) =>
    intersect([plan1, plan2], JSON.stringify)
  );
};
