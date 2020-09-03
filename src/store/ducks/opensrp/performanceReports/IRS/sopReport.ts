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
import { IRSPerformanceCommonFields } from './districtReport';

/** the reducer name */
export const reducerName = 'IRSSOPPerformance';

/** SOP performance interface */
export interface IRSSOPPerformance extends IRSPerformanceCommonFields {
  avg_found: number;
  avg_refused: number;
  avg_sprayed: number;
  days_worked: number;
  data_collector: string;
  district_id: string;
  found: number;
  id: string;
  not_sprayed: number;
  other_reason: number;
  plan_id: string;
  refused: number;
  sop: string;
  sprayed: number;
}

/** generic IRS SOP Reducer */
const reducer = reducerFactory<IRSSOPPerformance>(reducerName);
export default reducer;

// actions
/** actionCreator returns action to to add Item records to store */
export const FetchIRSSOPs = fetchActionCreatorFactory<IRSSOPPerformance>(reducerName, 'id');
/** actionCreator returns action to to remove Item records to store */
export const genericIRSSOPs = removeActionCreatorFactory(reducerName);

// selectors
/** get all SOPs by ids */
export const getAllIRSSOPsByIds = getItemsByIdFactory<IRSSOPPerformance>(reducerName);

/** This interface represents the structure of SOPs filter options/params */
export interface SOPFilters {
  data_collector?: string /** data collector */;
  district_id?: string /** district id */;
  plan_id?: string /* plan id */;
}

/** get plan id
 * Gets plan id from SOPFilters
 * @param state - the redux store
 * @param props - the SOP filters object
 */
export const getPlanId = (_: Partial<Store>, props: SOPFilters) => props.plan_id;

/** get district id
 * Gets district id from SOPFilters
 * @param state - the redux store
 * @param props - the SOP filters object
 */
export const getDistrictId = (_: Partial<Store>, props: SOPFilters) => props.district_id;

/** get data collector
 * Gets data collector id from SOPFilters
 * @param state - the redux store
 * @param props - the SOP filters object
 */
export const getCollectorId = (_: Partial<Store>, props: SOPFilters) => props.data_collector;

/** IRSSOPsArrayBaseSelector select an array of all SOPs
 * @param state - the redux store
 */
export const IRSSOPsArrayBaseSelector = (state: Partial<Store>): IRSSOPPerformance[] =>
  values(getAllIRSSOPsByIds(state) || {});

/** getIRSSOPArrayByPlanId
 * Gets an array of SOP objects filtered by plan id
 * @param  state - the redux store
 * @param  props - the SOP filters object
 */
export const getIRSSOPArrayByPlanId = () =>
  createSelector([IRSSOPsArrayBaseSelector, getPlanId], (sops, planId) => {
    return planId ? sops.filter(sop => sop.plan_id === planId) : sops;
  });

/** getIRSSOPArrayByDistrictId
 * Gets an array of SOP objects filtered by district id
 * @param  state - the redux store
 * @param  props - the SOP filters object
 */
export const getIRSSOPArrayByDistrictId = () =>
  createSelector([IRSSOPsArrayBaseSelector, getDistrictId], (sops, districtId) => {
    return districtId ? sops.filter(sop => sop.district_id === districtId) : sops;
  });

/** getIRSSOPArrayByCollector
 * Gets an array of SOP objects filtered by data collector
 * @param  state - the redux store
 * @param  props - the SOP filters object
 */
export const getIRSSOPArrayByCollector = () =>
  createSelector([IRSSOPsArrayBaseSelector, getCollectorId], (sops, collector) => {
    return collector ? sops.filter(sop => sop.data_collector === collector) : sops;
  });

/** makeIRSSOPArraySelector
 * Returns a selector that gets an array of SOP objects filtered by one or all
 * of the following:
 *    - plan id
 *    - district id
 *    - data collector
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * To use this selector, do something like:
 *    const SOPArraySelector = makeIRSSOPArraySelector();
 *
 * @param  state - the redux store
 * @param {SOPFilters} props - the data collector filters object
 */
export const makeIRSSOPArraySelector = () => {
  return createSelector(
    [getIRSSOPArrayByPlanId(), getIRSSOPArrayByDistrictId(), getIRSSOPArrayByCollector()],
    (sop1, sop2, sop3) => intersect([sop1, sop2, sop3], JSON.stringify)
  );
};
