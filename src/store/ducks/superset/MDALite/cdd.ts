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

/** the reducer name */
export const reducerName = 'MDALiteCdds';

/** MDA-Lite gender report interface */
export interface MDALiteGenderInterface {
  treated_female_above_15: number;
  treated_female_1_4: number;
  treated_female_5_14: number;
  treated_male_above_15: number;
  treated_male_1_4: number;
  treated_male_5_14: number;
  total_all_genders: number;
  total_females: number;
  total_males: number;
}

/** MDA-Lite Drugs report interface */
export interface MDALiteDrugsReportInterface {
  adminstered: number;
  adverse: number;
  damaged: number;
  received_number: number;
  remaining_with_cdd: number;
  returned_to_supervisor: number;
  supervisor_distributed: number;
}

/** MDALiteCdds interface */
export interface MDALiteCDDData extends MDALiteGenderInterface, MDALiteDrugsReportInterface {
  average_per_day: number;
  base_entity_id: string;
  cdd_name: string;
  days_worked: number;
  id: string;
  plan_id: string;
  supervisor_id: string;
  supervisor_name: string;
}

/** MDA-Lite CDD Reducer */
const reducer = reducerFactory<MDALiteCDDData>(reducerName);
export default reducer;

// actions
/** actionCreator returns action to to add Item records to store */
export const fetchMDALiteCDDs = fetchActionCreatorFactory<MDALiteCDDData>(reducerName, 'id');
/** actionCreator returns action to to remove Item records to store */
export const removeMDALiteCDDs = removeActionCreatorFactory(reducerName);

// selectors
/** get one CDD using their id */
export const getMDALiteCDDById = getItemByIdFactory<MDALiteCDDData>(reducerName);

/** get all CDDS by ids */
export const getMDALiteCDDsArray = getItemsByIdFactory<MDALiteCDDData>(reducerName);

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of MDA Lite CDD filter options/params */
export interface MDALiteCDDFilters {
  cdd_name?: string /** CDD name */;
  supervisor_id?: string /** supervisor id */;
  base_entity_id?: string /** ward id */;
  plan_id?: string /** plan id */;
  supervisor_name?: string /** supervisor name */;
}

/** MDALiteCDDsArrayBaseSelector select an array of all CDDs
 * @param state - the redux store
 */
export const MDALiteCDDsArrayBaseSelector = (state: Partial<Store>): MDALiteCDDData[] =>
  values(getMDALiteCDDsArray(state) || {});

/**
 * Gets CDD name from Filters
 * @param state - the redux store
 * @param props - the cdd filters object
 */
export const getName = (_: Partial<Store>, props: MDALiteCDDFilters) => props.cdd_name;

/**
 * Gets supervisor id from filters
 * @param state - the redux store
 * @param props - the cdd filters object
 */
export const getSupervisorId = (_: Partial<Store>, props: MDALiteCDDFilters) => props.supervisor_id;

/**
 * Gets supervisor name from filters
 * @param state - the redux store
 * @param props - the cdd filters object
 */
export const getSupervisorName = (_: Partial<Store>, props: MDALiteCDDFilters) =>
  props.supervisor_name;

/**
 * Gets plan id from filters
 * @param state - the redux store
 * @param props - the cdd filters object
 */
export const getPlanId = (_: Partial<Store>, props: MDALiteCDDFilters) => props.plan_id;

/**
 * Gets ward id from filters
 * @param state - the redux store
 * @param props - the cdd filters object
 */
export const getWardId = (_: Partial<Store>, props: MDALiteCDDFilters) => props.base_entity_id;

/**
 * Gets an array of CDDs filtered by name
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteCDDFilters} props - the  CDDs filters object
 */
export const getMDALiteCDDsArrayByName = () =>
  createSelector([MDALiteCDDsArrayBaseSelector, getName], (cdds, cddName) =>
    cddName ? cdds.filter(cdd => cdd.cdd_name.toLowerCase().includes(cddName.toLowerCase())) : cdds
  );

/**
 * Gets an array of CDDs filtered by supervisor name
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteCDDFilters} props - the  CDDs filters object
 */
export const getMDALiteCDDsArrayBySupervisorName = () =>
  createSelector([MDALiteCDDsArrayBaseSelector, getSupervisorName], (cdds, supervisorName) =>
    supervisorName
      ? cdds.filter(cdd => cdd.supervisor_name.toLowerCase().includes(supervisorName.toLowerCase()))
      : cdds
  );

/**
 * Gets an array of CDDs objects filtered by supervisor id
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteCDDFilters} props - the CDDs filters object
 */
export const getMDALiteCDDsArrayBySupervisorId = () =>
  createSelector([MDALiteCDDsArrayBaseSelector, getSupervisorId], (cdds, supervisorId) =>
    supervisorId ? cdds.filter(cdd => supervisorId === cdd.supervisor_id) : cdds
  );

/**
 * Gets an array of CDDs objects filtered by supervisor id
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteCDDFilters} props - the CDDs filters object
 */
export const getMDALiteCDDsArrayByPlanId = () =>
  createSelector([MDALiteCDDsArrayBaseSelector, getPlanId], (cdds, planId) =>
    planId ? cdds.filter(cdd => planId === cdd.plan_id) : cdds
  );

/**
 * Gets an array of CDDs objects filtered by ward id
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteCDDFilters} props - the CDDs filters object
 */
export const getMDALiteCDDsArrayByWardId = () =>
  createSelector([MDALiteCDDsArrayBaseSelector, getWardId], (cdds, wardId) =>
    wardId ? cdds.filter(cdd => wardId === cdd.base_entity_id) : cdds
  );

/**
 * Returns a selector that gets an array of CDDs objects filtered by one or all
 * of the following:
 *    - cdd_name
 *    - supervisor_id
 *    - base_entity_id
 *    - plan_id
 *    - suprevisor_name
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * This selector is meant to be a memoized replacement for getMDALiteCDDsArray.
 *
 * To use this selector, do something like:
 *    const MDALiteCDDsArraySelector = makeMDALiteCDDsArraySelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {CDDsFilters} props - the CDD filters object
 */
export const makeMDALiteCDDsArraySelector = () => {
  return createSelector(
    [
      getMDALiteCDDsArrayByName(),
      getMDALiteCDDsArrayBySupervisorId(),
      getMDALiteCDDsArrayByWardId(),
      getMDALiteCDDsArrayByPlanId(),
      getMDALiteCDDsArrayBySupervisorName(),
    ],
    (cdd1, cdd2, cdd3, cdd4, cdd5) => intersect([cdd1, cdd2, cdd3, cdd4, cdd5], JSON.stringify)
  );
};
