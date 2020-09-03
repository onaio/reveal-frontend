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
export const reducerName = 'IRSSOByDatePPerformance';

/** SOP by date performance interface */
export interface IRSSOPByDatePerformance extends IRSPerformanceCommonFields {
  data_collector: string;
  district_id: string;
  event_date: string;
  found: number;
  id: string;
  not_sprayed: number;
  other_reason: number;
  plan_id: string;
  refused: number;
  sop: string;
  sprayed: number;
}

/** generic IRS SOP by date Reducer */
const reducer = reducerFactory<IRSSOPByDatePerformance>(reducerName);
export default reducer;

// actions
/** actionCreator returns action to to add Item records to store */
export const FetchIRSSOPByDate = fetchActionCreatorFactory<IRSSOPByDatePerformance>(
  reducerName,
  'id'
);
/** actionCreator returns action to to remove Item records to store */
export const removeIRSSOPByDate = removeActionCreatorFactory(reducerName);

// selectors
/** get all SOPs by ids */
export const getAllIRSSOPDateByIds = getItemsByIdFactory<IRSSOPByDatePerformance>(reducerName);

/** This interface represents the structure of SOPs filter options/params */
export interface SOPDateFilters {
  data_collector?: string /** data collector */;
  district_id?: string /** district id */;
  plan_id?: string /* plan id */;
  sop?: string /** sprayer operator */;
}

/** get plan id
 * Gets plan id from SOPDateFilters
 * @param state - the redux store
 * @param props - the SOP by date filters object
 */
export const getPlanId = (_: Partial<Store>, props: SOPDateFilters) => props.plan_id;

/** get district id
 * Gets district id from SOPDateFilters
 * @param state - the redux store
 * @param props - the SOP by date filters object
 */
export const getDistrictId = (_: Partial<Store>, props: SOPDateFilters) => props.district_id;

/** get data collector
 * Gets data collector id from SOPDateFilters
 * @param state - the redux store
 * @param props - the SOP by date filters object
 */
export const getCollectorId = (_: Partial<Store>, props: SOPDateFilters) => props.data_collector;

/** get SOP
 * Gets SOP id from SOPDateFilters
 * @param state - the redux store
 * @param props - the SOP by date filters object
 */
export const getSOPId = (_: Partial<Store>, props: SOPDateFilters) => props.sop;

/** IRSSOPDatesBaseSelector select an array of all SOPs by date
 * @param state - the redux store
 */
export const IRSSOPDatesBaseSelector = (state: Partial<Store>): IRSSOPByDatePerformance[] =>
  values(getAllIRSSOPDateByIds(state) || {});

/** getIRSSOPDateArrayByPlanId
 * Gets an array of SOP objects filtered by plan id
 * @param  state - the redux store
 * @param  props - the SOP by date filters object
 */
export const getIRSSOPDateArrayByPlanId = () =>
  createSelector([IRSSOPDatesBaseSelector, getPlanId], (sopByDates, planId) => {
    return planId ? sopByDates.filter(sopByDate => sopByDate.plan_id === planId) : sopByDates;
  });

/** getIRSSOPDateArrayByDistrictId
 * Gets an array of SOP objects filtered by district id
 * @param  state - the redux store
 * @param  props - the SOP by date filters object
 */
export const getIRSSOPDateArrayByDistrictId = () =>
  createSelector([IRSSOPDatesBaseSelector, getDistrictId], (sopByDates, districtId) => {
    return districtId
      ? sopByDates.filter(sopByDate => sopByDate.district_id === districtId)
      : sopByDates;
  });

/** getIRSSOPArrayByCollector
 * Gets an array of SOP objects filtered by data collector
 * @param  state - the redux store
 * @param  props - the SOP by date filters object
 */
export const getIRSSOPDateArrayByCollector = () =>
  createSelector([IRSSOPDatesBaseSelector, getCollectorId], (sopByDates, collector) => {
    return collector
      ? sopByDates.filter(sopByDate => sopByDate.data_collector === collector)
      : sopByDates;
  });

/** getIRSSOPDateArrayBySOP
 * Gets an array of SOP objects filtered by SOP
 * @param  state - the redux store
 * @param  props - the SOP by date filters object
 */
export const getIRSSOPDateArrayBySOP = () =>
  createSelector([IRSSOPDatesBaseSelector, getCollectorId], (sopByDates, sop) => {
    return sop ? sopByDates.filter(sopByDate => sopByDate.sop === sop) : sopByDates;
  });

/** makeIRSSOByDatePArraySelector
 * Returns a selector that gets an array of SOP objects filtered by one or all
 * of the following:
 *    - plan id
 *    - district id
 *    - data collector
 *    - sprayer operator
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * To use this selector, do something like:
 *    const SOPByDateArraySelector = makeIRSSOByDatePArraySelector();
 *
 * @param  state - the redux store
 * @param {SOPDateFilters} props - the data collector filters object
 */
export const makeIRSSOByDatePArraySelector = (orderByDate?: boolean) => {
  return createSelector(
    [
      getIRSSOPDateArrayByPlanId(),
      getIRSSOPDateArrayByDistrictId(),
      getIRSSOPDateArrayByCollector(),
      getIRSSOPDateArrayBySOP(),
    ],
    (sopByDate1, sopByDate2, sopByDate3, sopByDate4) => {
      const sopByDate = intersect([sopByDate1, sopByDate2, sopByDate3, sopByDate4], JSON.stringify);
      if (orderByDate) {
        sopByDate.sort((a, b) => Date.parse(b.event_date) - Date.parse(a.event_date));
      }
      return sopByDate;
    }
  );
};
