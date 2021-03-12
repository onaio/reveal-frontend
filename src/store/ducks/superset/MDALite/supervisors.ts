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
import { MDALiteDrugsReportInterface } from './cdd';

/** the reducer name */
export const reducerName = 'MDALiteSupervisors';

/** MDALiteSupervisors interface */
export interface MDALiteSupervisor extends MDALiteDrugsReportInterface {
  id: string;
  name: string;
  ward_id: string;
}

/** MDA-Lite supervisor Reducer */
const reducer = reducerFactory<MDALiteSupervisor>(reducerName);
export default reducer;

// actions
/** actionCreator returns action to to add Item records to store */
export const fetchMDALiteSupervisors = fetchActionCreatorFactory<MDALiteSupervisor>(
  reducerName,
  'id'
);
/** actionCreator returns action to to remove Item records to store */
export const removeMDALiteSupervisors = removeActionCreatorFactory(reducerName);

// selectors
/** get one supervisor using their id */
export const getMDALiteSupervisorById = getItemByIdFactory<MDALiteSupervisor>(reducerName);

/** get all Supervisors by ids */
export const getMDALiteSupervisorsArray = getItemsByIdFactory<MDALiteSupervisor>(reducerName);

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of MDA Lite Supervisors filter options/params */
export interface MDALiteSupervisorFilters {
  name?: string /** Supervisor name */;
  ward_id?: string /** ward id */;
}

/** MDALiteSupervisorsArrayBaseSelector select an array of all Supervisors
 * @param state - the redux store
 */
export const MDALiteSupervisorsArrayBaseSelector = (state: Partial<Store>): MDALiteSupervisor[] =>
  values(getMDALiteSupervisorsArray(state) || {});

/**
 * Gets supervisor name from Filters
 * @param state - the redux store
 * @param props - the supervisor filters object
 */
export const getName = (_: Partial<Store>, props: MDALiteSupervisorFilters) => props.name;

/**
 * Gets ward id from filters
 * @param state - the redux store
 * @param props - the supervisor filters object
 */
export const getWardId = (_: Partial<Store>, props: MDALiteSupervisorFilters) => props.ward_id;

/**
 * Gets an array of Supervisors filtered by name
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteSupervisorFilters} props - the  Supervisors filters object
 */
export const getMDALiteSupervisorsArrayByName = () =>
  createSelector([MDALiteSupervisorsArrayBaseSelector, getName], (Supervisors, supervisorName) =>
    supervisorName
      ? Supervisors.filter(supervisor =>
          supervisor.name.toLowerCase().includes(supervisorName.toLowerCase())
        )
      : Supervisors
  );

/**
 * Gets an array of Supervisors objects filtered by ward id
 * @param {Partial<Store>} state - the redux store
 * @param {MDALiteSupervisorFilters} props - the Supervisors filters object
 */
export const getMDALiteSupervisorsArrayByWardId = () =>
  createSelector([MDALiteSupervisorsArrayBaseSelector, getWardId], (Supervisors, wardId) =>
    wardId ? Supervisors.filter(supervisor => wardId === supervisor.ward_id) : Supervisors
  );

/**
 * Returns a selector that gets an array of Supervisors objects filtered by one or all
 * of the following:
 *    - name
 *    - ward_id
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * This selector is meant to be a memoized replacement for getMDALiteSupervisorsArray.
 *
 * To use this selector, do something like:
 *    const MDALiteSupervisorsArraySelector = makeMDALiteSupervisorsArraySelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {SupervisorsFilters} props - the supervisor filters object
 */
export const makeMDALiteSupervisorsArraySelector = () => {
  return createSelector(
    [getMDALiteSupervisorsArrayByName(), getMDALiteSupervisorsArrayByWardId()],
    (supervisor1, supervisor2) => intersect([supervisor1, supervisor2], JSON.stringify)
  );
};
