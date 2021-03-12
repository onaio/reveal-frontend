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
export interface MDALiteCDDInterface extends MDALiteGenderInterface, MDALiteDrugsReportInterface {
  average_per_day: number;
  cdd_name: string;
  days_worked: number;
  id: string;
  supervisor_id: string;
  supervisor_name: string;
}

/** MDA-Lite CDD Reducer */
const reducer = reducerFactory<MDALiteCDDInterface>(reducerName);
export default reducer;

// actions
/** actionCreator returns action to to add Item records to store */
export const fetchMDALiteCDDs = fetchActionCreatorFactory<MDALiteCDDInterface>(reducerName, 'id');
/** actionCreator returns action to to remove Item records to store */
export const removeMDALiteCDDs = removeActionCreatorFactory(reducerName);

// selectors
/** get one CDD using their id */
export const getMDALiteCDDById = getItemByIdFactory<MDALiteCDDInterface>(reducerName);

/** get all CDDS by ids */
export const getMDALiteCDDsArray = getItemsByIdFactory<MDALiteCDDInterface>(reducerName);

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of MDA Lite CDD filter options/params */
export interface MDALiteCDDFilters {
  cdd_name?: string /** CDD name */;
  supervisor_id?: string /** supervisor id */;
}

/** MDALiteCDDsArrayBaseSelector select an array of all CDDs
 * @param state - the redux store
 */
export const MDALiteCDDsArrayBaseSelector = (state: Partial<Store>): MDALiteCDDInterface[] =>
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
 * Gets an array of CDDs filtered by name
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteCDDFilters} props - the  CDDs filters object
 */
export const getMDALiteCDDsArrayByTitle = () =>
  createSelector([MDALiteCDDsArrayBaseSelector, getName], (cdds, cddName) =>
    cddName ? cdds.filter(cdd => cdd.cdd_name.toLowerCase().includes(cddName.toLowerCase())) : cdds
  );

/**
 * Gets an array of CDDs objects filtered by supervisor id
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteCDDFilters} props - the CDDs filters object
 */
export const getMDALiteCDDsArrayByStatus = () =>
  createSelector([MDALiteCDDsArrayBaseSelector, getSupervisorId], (cdds, supervisorId) =>
    supervisorId ? cdds.filter(cdd => supervisorId === cdd.supervisor_id) : cdds
  );

/**
 * Returns a selector that gets an array of CDDs objects filtered by one or all
 * of the following:
 *    - cdd_name
 *    - supervisor_id
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
    [getMDALiteCDDsArrayByTitle(), getMDALiteCDDsArrayByStatus()],
    (cdd1, cdd2) => intersect([cdd1, cdd2], JSON.stringify)
  );
};
