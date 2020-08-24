import {
  fetchActionCreatorFactory,
  reducerFactory,
  removeActionCreatorFactory,
} from '@opensrp/reducer-factory';
import intersect from 'fast_array_intersect';
import { get, keyBy, values } from 'lodash';
import { Store } from 'redux';
import { createSelector } from 'reselect';
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

/** Dynamic MDA Reducer */
const reducer = reducerFactory<MDAPointPlan>(reducerName);
export default reducer;

// actions
/** actionCreator returns action to to add Item records to store */
export const fetchMDAPointPlans = fetchActionCreatorFactory<MDAPointPlan>(reducerName, 'plan_id');

/** Reset plan definitions state action creator */
export const removeMDAPointPlans = removeActionCreatorFactory(reducerName);

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
  return (state as any)[reducerName].objectsById;
}

/** get one MDAPointPlan using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the MDAPointPlan id
 * @returns {MDAPointPlan|null} a MDAPointPlan object or null
 */
export function getMDAPointPlanById(state: Partial<Store>, planId: string): MDAPointPlan | null {
  return get((state as any)[reducerName].objectsById, planId) || null;
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
  const result = values((state as any)[reducerName].objectsById);
  return result.filter((e: MDAPointPlan) => e.plan_intervention_type === interventionType);
}

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of MDAPoint plan filter options/params */
export interface MDAPointPlanFilters {
  plan_title?: string /** MDAPoint plan title */;
  statusList?: string[] /** array of plan statuses */;
}

/** MDAPointPlansArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const MDAPointPlansArrayBaseSelector = () => (state: Partial<Store>): MDAPointPlan[] =>
  values((state as any)[reducerName].objectsById);

/** getMDAPointPlansArrayByTitle
 * Gets title from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getTitle = (_: Partial<Store>, props: MDAPointPlanFilters) => props.plan_title;

/** getStatusList
 * Gets statusList from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getStatusList = (_: Partial<Store>, props: MDAPointPlanFilters) => props.statusList;

/** getPlansArrayByTitle
 * Gets an array of Plan objects filtered by plan title
 * @param {Partial<Store>} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan defintion filters object
 */
export const getMDAPointPlansArrayByTitle = () =>
  createSelector([MDAPointPlansArrayBaseSelector(), getTitle], (plans, title) =>
    title
      ? plans.filter(plan => plan.plan_title.toLowerCase().includes(title.toLowerCase()))
      : plans
  );

/** getMDAPointPlansArrayByStatus
 * Gets an array of Plan objects filtered by plan status
 * @param {Partial<Store>} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan defintion filters object
 */
export const getMDAPointPlansArrayByStatus = () =>
  createSelector([MDAPointPlansArrayBaseSelector(), getStatusList], (plans, statusList) =>
    statusList
      ? plans.filter(plan => (statusList.length ? statusList.includes(plan.plan_status) : true))
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
export const makeMDAPointPlansArraySelector = () => {
  return createSelector(
    [getMDAPointPlansArrayByTitle(), getMDAPointPlansArrayByStatus()],
    (plan1, plan2) => intersect([plan1, plan2], JSON.stringify)
  );
};
