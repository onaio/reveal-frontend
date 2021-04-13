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
import { MDALiteGenderInterface } from './cdd';

/** the reducer name */
export const reducerName = 'MDALiteWards';

export interface MDALiteWards extends MDALiteGenderInterface {
  base_entity_id: string;
  id: string;
  parent_id: string;
  plan_id: string;
  ward_name: string;
}

/** MDA-Lite Ward Reducer */
const reducer = reducerFactory<MDALiteWards>(reducerName);
export default reducer;

// actions
/** actionCreator returns action to to add Item records to store */
export const fetchMDALiteWards = fetchActionCreatorFactory<MDALiteWards>(reducerName, 'id');
/** actionCreator returns action to to remove Item records to store */
export const removeMDALiteWards = removeActionCreatorFactory(reducerName);

// selectors
/** get one Ward using their id */
export const getMDALiteWardById = getItemByIdFactory<MDALiteWards>(reducerName);

/** get all Wards by ids */
export const getMDALiteWardsArray = getItemsByIdFactory<MDALiteWards>(reducerName);

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of MDA Lite wards filter options/params */
export interface MDALiteWardsFilters {
  base_entity_id?: string /** ward id */;
  parent_id?: string /** parent id */;
  ward_name?: string /** ward name */;
  plan_id?: string /** plan id */;
}

/** MDALiteWardsArrayBaseSelector select an array of all wards
 * @param state - the redux store
 */
export const MDALiteWardsArrayBaseSelector = (state: Partial<Store>): MDALiteWards[] =>
  values(getMDALiteWardsArray(state) || {});

/**
 * Gets plan id from filters
 * @param state - the redux store
 * @param props - the wards filters object
 */
export const getPlanId = (_: Partial<Store>, props: MDALiteWardsFilters) => props.plan_id;

/**
 * Gets parent id from filters
 * @param state - the redux store
 * @param props - the wards filters object
 */
export const getParentId = (_: Partial<Store>, props: MDALiteWardsFilters) => props.parent_id;

/**
 * Gets ward name from filters
 * @param state - the redux store
 * @param props - the wards filters object
 */
export const getWardName = (_: Partial<Store>, props: MDALiteWardsFilters) => props.ward_name;

/**
 * Gets ward id from filters
 * @param state - the redux store
 * @param props - the wards filters object
 */
export const getWardId = (_: Partial<Store>, props: MDALiteWardsFilters) => props.base_entity_id;

/**
 * Gets an array of wards filtered by ward name
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteWardsFilters} props - the  wards filters object
 */
export const getMDALiteWardsArrayByName = () =>
  createSelector([MDALiteWardsArrayBaseSelector, getWardName], (wards, wardName) =>
    wardName
      ? wards.filter(ward => ward.ward_name.toLowerCase().includes(wardName.toLowerCase()))
      : wards
  );

/**
 * Gets an array of wards objects filtered by parent id
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteWardsFilters} props - the wards filters object
 */
export const getMDALiteWardsArrayByParentId = () =>
  createSelector([MDALiteWardsArrayBaseSelector, getParentId], (wards, parentId) =>
    parentId ? wards.filter(ward => parentId === ward.parent_id) : wards
  );

/**
 * Gets an array of wards objects filtered by plan id
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteWardsFilters} props - the wards filters object
 */
export const getMDALiteWardsArrayByPlanId = () =>
  createSelector([MDALiteWardsArrayBaseSelector, getPlanId], (wards, planId) =>
    planId ? wards.filter(ward => planId === ward.plan_id) : wards
  );

/**
 * Gets an array of wards objects filtered by ward id
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteWardsFilters} props - the wards filters object
 */
export const getMDALiteWardsArrayByWardId = () =>
  createSelector([MDALiteWardsArrayBaseSelector, getWardId], (wards, wardId) =>
    wardId ? wards.filter(ward => wardId === ward.base_entity_id) : wards
  );

/**
 * Returns a selector that gets an array of wards objects filtered by one or all
 * of the following:
 *    - ward_name
 *    - parent_id
 *    - plan_id
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * To use this selector, do something like:
 *    const makeMDALiteWardsSelector = makeMDALiteWardsArraySelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteWardsFilters} props - the wards filters object
 */
export const makeMDALiteWardsArraySelector = () => {
  return createSelector(
    [
      getMDALiteWardsArrayByPlanId(),
      getMDALiteWardsArrayByParentId(),
      getMDALiteWardsArrayByName(),
      getMDALiteWardsArrayByWardId(),
    ],
    (ward1, ward2, ward3, ward4) => intersect([ward1, ward2, ward3, ward4], JSON.stringify)
  );
};
