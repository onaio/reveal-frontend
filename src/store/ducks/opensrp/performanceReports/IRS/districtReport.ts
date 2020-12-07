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

/** the reducer name */
export const reducerName = 'IRSDistrictPerformance';

export interface IRSPerformanceCommonFields {
  bottles_empty: number;
  daily_found: number;
  daily_sprayed: number;
  data_quality_check: boolean;
  end_time: string;
  field_duration: string;
  found_diff: number;
  sprayed_diff: number;
  start_time: string;
}

/** district performance interface */
export interface IRSDistrictPerformance extends IRSPerformanceCommonFields {
  avg_found: number;
  avg_refused: number;
  avg_sprayed: number;
  days_worked: number;
  district_id: string;
  district_name: string;
  found: number;
  id: string;
  other_reason: number;
  plan_id: string;
  refused: number;
  sprayed: number;
  usage_rate: number;
}

/** generic IRS district Reducer */
const reducer = reducerFactory<IRSDistrictPerformance>(reducerName);
export default reducer;

// actions
/** actionCreator returns action to add Item records to store */
export const FetchIRSDistricts = fetchActionCreatorFactory<IRSDistrictPerformance>(
  reducerName,
  'id'
);
/** actionCreator returns action to remove Item records to store */
export const removeIRSDistricts = removeActionCreatorFactory(reducerName);

// selectors
/** get all districts by ids */
export const getAllIRSDistrictsByIds = getItemsByIdFactory<IRSDistrictPerformance>(reducerName);

/** This interface represents the structure of districts filter options/params */
export interface DistrictFilters {
  district_id?: string /** district id */;
  district_name?: string /** district name */;
  plan_id?: string /* plan id */;
}

/** get plan id
 * Gets plan id from DistrictFilters
 * @param state - the redux store
 * @param props - the district filters object
 */
export const getPlanId = (_: Partial<Store>, props: DistrictFilters) => props.plan_id;

/** get district name
 * Gets district name from DistrictFilters
 * @param state - the redux store
 * @param props - the district filters object
 */
export const getDistrictName = (_: Partial<Store>, props: DistrictFilters) => props.district_name;

/** get district id
 * Gets district id from DistrictFilters
 * @param state - the redux store
 * @param props - the district filters object
 */
export const getDistrictId = (_: Partial<Store>, props: DistrictFilters) => props.district_id;

/** IRSDistrictsArrayBaseSelector select an array of all districts
 * @param state - the redux store
 */
export const IRSDistrictsArrayBaseSelector = (state: Partial<Store>): IRSDistrictPerformance[] =>
  values(getAllIRSDistrictsByIds(state) || {});

/** getIRSDistrictArrayByPlanId
 * Gets an array of districts objects filtered by plan id
 * @param  state - the redux store
 * @param  props - the districts filters object
 */
export const getIRSDistrictArrayByPlanId = () =>
  createSelector([IRSDistrictsArrayBaseSelector, getPlanId], (districts, planId) => {
    return planId ? districts.filter(district => district.plan_id === planId) : districts;
  });

/** getIRSDistrictArrayByPlanId
 * Gets an array of districts objects filtered by district name
 * @param  state - the redux store
 * @param  props - the districts filters object
 */
export const getIRSDistrictArrayByDistrictName = () =>
  createSelector([IRSDistrictsArrayBaseSelector, getDistrictName], (districts, name) => {
    return name
      ? districts.filter(district =>
          district.district_name.toLocaleLowerCase().includes(name.toLocaleLowerCase())
        )
      : districts;
  });

/** getIRSDistrictArrayByPlanId
 * Gets an array of districts objects filtered by district id
 * @param  state - the redux store
 * @param  props - the districts filters object
 */
export const getIRSDistrictArrayByDistrictId = () =>
  createSelector([IRSDistrictsArrayBaseSelector, getDistrictId], (districts, districtId) => {
    return districtId
      ? districts.filter(district => district.district_id === districtId)
      : districts;
  });

/** makeIRSDistrictArraySelector
 * Returns a selector that gets an array of district objects filtered by one or all
 * of the following:
 *    - plan id
 *    - district id
 *    - district_name
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * To use this selector, do something like:
 *    const IRSDistrictsArraySelector = makeIRSDistrictArraySelector();
 *
 * @param  state - the redux store
 * @param {DistrictFilters} props - the district filters object
 */
export const makeIRSDistrictArraySelector = () => {
  return createSelector(
    [
      getIRSDistrictArrayByPlanId(),
      getIRSDistrictArrayByDistrictId(),
      getIRSDistrictArrayByDistrictName(),
    ],
    (district1, district2, district3) =>
      intersect([district1, district2, district3], JSON.stringify)
  );
};
