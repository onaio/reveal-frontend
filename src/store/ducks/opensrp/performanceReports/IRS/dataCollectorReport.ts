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
export const reducerName = 'IRSCollectorPerformance';

/** data collector performance interface */
export interface IRSCollectorPerformance extends IRSPerformanceCommonFields {
  avg_found: number;
  avg_refused: number;
  avg_sprayed: number;
  data_collector: string;
  days_worked: number;
  district_id: string;
  found: number;
  id: string;
  other_reason: number;
  plan_id: string;
  refused: number;
  sprayed: number;
  usage_rate: number;
}

/** generic IRS data collector Reducer */
const reducer = reducerFactory<IRSCollectorPerformance>(reducerName);
export default reducer;

// actions
/** actionCreator returns action to add Item records to store */
export const FetchIRSDataCollectors = fetchActionCreatorFactory<IRSCollectorPerformance>(
  reducerName,
  'id'
);
/** actionCreator returns action to remove Item records to store */
export const removeIRSDataCollectors = removeActionCreatorFactory(reducerName);

// selectors
/** get all data collectors by ids */
export const getAllIRSCollectorsByIds = getItemsByIdFactory<IRSCollectorPerformance>(reducerName);

/** This interface represents the structure of data collectors filter options/params */
export interface DataCollectorFilters {
  data_collector?: string /** data collector */;
  district_id?: string /** district id */;
  plan_id?: string /* plan id */;
}

/** get plan id
 * Gets plan id from DataCollectorFilters
 * @param state - the redux store
 * @param props - the data collector filters object
 */
export const getPlanId = (_: Partial<Store>, props: DataCollectorFilters) => props.plan_id;

/** get data collector
 * Gets data collector from DataCollectorFilters
 * @param state - the redux store
 * @param props - the data collector filters object
 */
export const getDataCollector = (_: Partial<Store>, props: DataCollectorFilters) =>
  props.data_collector;

/** get district id
 * Gets district id from DataCollectorFilters
 * @param state - the redux store
 * @param props - the data collector filters object
 */
export const getDistrictId = (_: Partial<Store>, props: DataCollectorFilters) => props.district_id;

/** IRSCollectorsArrayBaseSelector select an array of all data collectors
 * @param state - the redux store
 */
export const IRSCollectorsArrayBaseSelector = (state: Partial<Store>): IRSCollectorPerformance[] =>
  values(getAllIRSCollectorsByIds(state) || {});

/** getIRSCollectorArrayByPlanId
 * Gets an array of data collector objects filtered by plan id
 * @param  state - the redux store
 * @param  props - the data collector filters object
 */
export const getIRSCollectorArrayByPlanId = () =>
  createSelector([IRSCollectorsArrayBaseSelector, getPlanId], (collectors, planId) => {
    return planId ? collectors.filter(collector => collector.plan_id === planId) : collectors;
  });

/** getIRSCollectorArrayByName
 * Gets an array of data collector objects filtered by data collector
 * @param  state - the redux store
 * @param  props - the data collector filters object
 */
export const getIRSCollectorArrayByName = () =>
  createSelector([IRSCollectorsArrayBaseSelector, getDataCollector], (collectors, title) => {
    return title
      ? collectors.filter(collector =>
          collector.data_collector.toLocaleLowerCase().includes(title.toLocaleLowerCase())
        )
      : collectors;
  });

/** getIRSCollectorArrayByDistrictId
 * Gets an array of data collector objects filtered by district id
 * @param  state - the redux store
 * @param  props - the data collector filters object
 */
export const getIRSCollectorArrayByDistrictId = () =>
  createSelector([IRSCollectorsArrayBaseSelector, getDistrictId], (collectors, districtId) => {
    return districtId
      ? collectors.filter(collector => collector.district_id === districtId)
      : collectors;
  });

/** makeIRSCollectorArraySelector
 * Returns a selector that gets an array of data collector objects filtered by one or all
 * of the following:
 *    - plan id
 *    - district id
 *    - data_collector
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * To use this selector, do something like:
 *    const dataCollectorArraySelector = makeIRSCollectorArraySelector();
 *
 * @param  state - the redux store
 * @param {DataCollectorFilters} props - the data collector filters object
 */
export const makeIRSCollectorArraySelector = () => {
  return createSelector(
    [
      getIRSCollectorArrayByPlanId(),
      getIRSCollectorArrayByDistrictId(),
      getIRSCollectorArrayByName(),
    ],
    (collector1, collector2, collector3) =>
      intersect([collector1, collector2, collector3], JSON.stringify)
  );
};
