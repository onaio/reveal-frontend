import { Dictionary } from '@onaio/utils/dist/types/types';
import {
  fetchActionCreatorFactory,
  reducerFactory,
  removeActionCreatorFactory,
} from '@opensrp/reducer-factory';
import { Feature, FeatureCollection, Geometry } from '@turf/turf';
import { get, values } from 'lodash';
import { Store } from 'redux';
import { createSelector } from 'reselect';

/** The shape of a jurisdiction received from the OpenSRP API */
export interface Jurisdiction {
  id: string;
  geometry?: Geometry;
  properties: {
    code?: string;
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
const reducer = reducerFactory<Jurisdiction>(reducerName);
export default reducer;

// actions
/** actionCreator returns action to to add Item records to store */
export const fetchJurisdictions = fetchActionCreatorFactory<Jurisdiction>(reducerName, 'id');
export const removeJurisdictions = removeActionCreatorFactory(reducerName);

// selectors
/** prop filters to customize selector queries */
export interface Filters {
  jurisdictionId?: string /** jurisdiction id */;
  jurisdictionIdsArray?: string[] /** array of jurisdiction ids */;
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

/** retrieve the jurisdictionIdsArray value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getJurisdictionIdsArray = (_: Partial<Store>, props: Filters) =>
  props.jurisdictionIdsArray;

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
 * Get jurisdiction ids
 * @param state - the store
 * @param props -  the filterProps
 */
export const getJurisdictionIds = () =>
  createSelector([getJurisdictionsById], (jurisdictionsById): string[] => {
    return Object.keys(jurisdictionsById);
  });

/**
 * retrieve jurisdictions as an array
 * @param state - the store
 * @param props -  the filterProps
 */
export const getJurisdictionsArray = () =>
  createSelector(
    [getJurisdictionsById, getParentId, getJurisdictionIdsArray],
    (jurisdictionsById, parentId, jurisdictionIdsArray): Jurisdiction[] => {
      const result = values(jurisdictionsById);
      if (parentId) {
        return result.filter(item => item.properties.parentId === parentId);
      }
      if (jurisdictionIdsArray) {
        return result.filter(item => jurisdictionIdsArray.includes(item.id));
      }
      return result;
    }
  );

/**
 * retrieve jurisdictions as a geojson feature collection
 * @param state - the store
 * @param props -  the filterProps
 */
export const getJurisdictionsFC = () =>
  createSelector(
    [getJurisdictionsArray()],
    (jurisdictionsArray): FeatureCollection => {
      return {
        features: jurisdictionsArray.filter(item => 'geometry' in item) as Feature[],
        type: 'FeatureCollection',
      };
    }
  );
