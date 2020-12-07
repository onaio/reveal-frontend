import {
  fetchActionCreatorFactory,
  getItemsByIdFactory,
  reducerFactory,
  removeActionCreatorFactory,
} from '@opensrp/reducer-factory';
import intersect from 'fast_array_intersect';
import { values } from 'lodash';
import { Store } from 'redux';
import { createSelector } from 'reselect';

/** reducer name for the Item module */
export const reducerName = 'indexCasesDetails';

export interface IndexCasesDetails {
  action_code: string;
  case_classification: string;
  case_number: string;
  date_of_diagnosis: string;
  event_id: string;
  goal_id: string;
  jurisdiction_id: string;
  id: string;
  plan_id: string;
  task_id: string;
}

/** Item Reducer */
const reducer = reducerFactory<IndexCasesDetails>(reducerName);
export default reducer;

// action
/** actionCreator returns action to to add Item records to store */
export const fetchIndexCaseDetails = fetchActionCreatorFactory<IndexCasesDetails>(
  reducerName,
  'id'
);
export const removeIndexCaseDetailsAction = removeActionCreatorFactory(reducerName);

// selectors
export const getAllIndexCaseDetailsByIds = getItemsByIdFactory<IndexCasesDetails>(reducerName);

/** This interface represents the structure of index case details filter options/params */
export interface IndexCaseFilters {
  goal_id?: string /** goal id */;
  jurisdiction_id?: string /** jurisdiction id */;
  plan_id?: string /* plan id */;
  task_id?: string /** task id */;
}

/** get plan id
 * Gets plan id from IndexCaseFilters
 * @param state - the redux store
 * @param props - the index cases filters object
 */
export const getPlanId = (_: Partial<Store>, props: IndexCaseFilters) => props.plan_id;

/** get jurisdiction id
 * Gets jurisdiction id from IndexCaseFilters
 * @param state - the redux store
 * @param props - the index cases filters object
 */
export const getJurisdictionId = (_: Partial<Store>, props: IndexCaseFilters) =>
  props.jurisdiction_id;

/** get goal id
 * Gets goal id from IndexCaseFilters
 * @param state - the redux store
 * @param props - the index cases filters object
 */
export const getGoalId = (_: Partial<Store>, props: IndexCaseFilters) => props.goal_id;

/** get task id
 * Gets task id from IndexCaseFilters
 * @param state - the redux store
 * @param props - the index cases filters object
 */
export const getTaskId = (_: Partial<Store>, props: IndexCaseFilters) => props.task_id;

/** indexCasesArrayBaseSelector select an array of all index cases
 * @param state - the redux store
 */
export const indexCasesArrayBaseSelector = (state: Partial<Store>): IndexCasesDetails[] =>
  values(getAllIndexCaseDetailsByIds(state) || {});

/** getIndexCaseArrayByPlanId
 * Gets an array of index cases objects filtered by plan id
 * @param  state - the redux store
 * @param  props - the index cases filters object
 */
export const getIndexCasesArrayByPlanId = () =>
  createSelector([indexCasesArrayBaseSelector, getPlanId], (indexCases, planId) => {
    return planId ? indexCases.filter(indexCase => indexCase.plan_id === planId) : indexCases;
  });

/** getIndexCaseArrayByJurisdictionId
 * Gets an array of index cases objects filtered by jurisdiction id
 * @param  state - the redux store
 * @param  props - the index cases filters object
 */
export const getIndexCasesArrayByJurisdictionId = () =>
  createSelector([indexCasesArrayBaseSelector, getJurisdictionId], (indexCases, jurisdiction) => {
    return jurisdiction
      ? indexCases.filter(indexCase => indexCase.jurisdiction_id === jurisdiction)
      : indexCases;
  });

/** getIndexCasesArrayByGoalId
 * Gets an array of index cases objects filtered by goal id
 * @param  state - the redux store
 * @param  props - the index cases filters object
 */
export const getIndexCasesArrayByGoalId = () =>
  createSelector([indexCasesArrayBaseSelector, getGoalId], (indexCases, goal) => {
    return goal ? indexCases.filter(indexCase => indexCase.goal_id === goal) : indexCases;
  });

/** getIndexCasesArrayByTaskId
 * Gets an array of index cases objects filtered by task id
 * @param  state - the redux store
 * @param  props - the index cases filters object
 */
export const getIndexCasesArrayByTaskId = () =>
  createSelector([indexCasesArrayBaseSelector, getTaskId], (indexCases, task) => {
    return task ? indexCases.filter(indexCase => indexCase.task_id === task) : indexCases;
  });

/** makeIndexCasesArraySelector
 * Returns a selector that gets an array of index cases objects filtered by one or all
 * of the following:
 *    - plan id
 *    - jurisdiction id
 *    - goal id
 *    - task id
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * To use this selector, do something like:
 *    const indexCasesArraySelector = makeIndexCasesArraySelector();
 *
 * @param  state - the redux store
 * @param {IndexCaseFilters} props - the index cases filters object
 */
export const makeIndexCasesArraySelector = () => {
  return createSelector(
    [
      getIndexCasesArrayByPlanId(),
      getIndexCasesArrayByJurisdictionId(),
      getIndexCasesArrayByGoalId(),
      getIndexCasesArrayByTaskId(),
    ],
    (case1, case2, case3, case4) => intersect([case1, case2, case3, case4], JSON.stringify)
  );
};
