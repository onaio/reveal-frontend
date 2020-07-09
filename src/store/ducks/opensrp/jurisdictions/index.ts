import { Dictionary } from '@onaio/utils/dist/types/types';
import {
  fetchActionCreatorFactory,
  // getItemsByIdFactory,
  // getItemByIdFactory,
  // getItemsArrayFactory,
  reducerFactory,
  removeActionCreatorFactory,
} from '@opensrp/reducer-factory';
import { get, values } from 'lodash';
import { Store } from 'redux';
import { createSelector } from 'reselect';
import { Geometry } from '../../../../helpers/utils';

/** The shape of a jurisdiction received from the OpenSRP API */
export interface Jurisdiction {
  id: string;
  properties: {
    code?: string;
    geometry?: Geometry;
    geographicLevel: number;
    name: string;
    parentId?: string;
    status: string;
    version: string | number;
  };
  serverVersion: number;
  type: Readonly<'Feature'>;
}

/** the reducer name */
export const reducerName = 'Jurisdiction';

/** Jurisdiction Reducer */
export const reducer = reducerFactory<Jurisdiction>(reducerName);

// actions
/** actionCreator returns action to to add Item records to store */
export const fetchJurisdictions = fetchActionCreatorFactory<Jurisdiction>(reducerName, 'id');
export const removeJurisdictions = removeActionCreatorFactory(reducerName);

// selectors
// export const getJurisdictionById = getItemByIdFactory<Jurisdiction>(reducerName);
// export const getJurisdictionsById = getItemsByIdFactory<Jurisdiction>(reducerName);
// export const getJurisdictionsArray = getItemsArrayFactory<Jurisdiction>(reducerName);

/** prop filters to customize selector queries */
export interface Filters {
  jurisdictionId?: string /** jurisdiction id */;
  parentId?: string /** parent id */;
}

/** retrieve the jurisdictionId value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getJurisdictionId = (_: Partial<Store>, props: Filters) => props.jurisdictionId;

/** retrieve the parentId value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getParentId = (_: Partial<Store>, props: Filters) => props.parentId;

/** gets all jurisdictions keyed by id
 * @param state - the store
 * @param _ -  the filterProps
 */
export const getJurisdictionsById = (state: Partial<Store>, _: Filters): Dictionary<Jurisdiction> =>
  (state as any)[reducerName].objectsById;

/** retrieve the Jurisdiction using an id
 * @param state - the store
 * @param props -  the filterProps
 */
export const getJurisdictionById = () =>
  createSelector(
    [getJurisdictionsById, getJurisdictionId],
    (jurisdictionsById, jurisdictionId): Jurisdiction | null => {
      if (!jurisdictionId) {
        return null;
      }
      return get(jurisdictionsById, jurisdictionId, null);
    }
  );

/**
 * retrieve jurisdictions as an array
 * @param state - the store
 * @param props -  the filterProps
 */
export const getJurisdictionsArray = () =>
  createSelector([getJurisdictionsById], (jurisdictionsById): Jurisdiction[] => {
    return values(jurisdictionsById);
  });
