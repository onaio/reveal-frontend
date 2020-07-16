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
    color?: string;
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
  filterGeom?: boolean /** whether to filter jurisdictions that have geometry field */;
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

/** retrieve the filterGeom value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getFilterGeom = (_: Partial<Store>, props: Filters) => props.filterGeom;

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
  createSelector(
    [getJurisdictionsById, getFilterGeom],
    (jurisdictionsById, filterGeom): string[] => {
      if (filterGeom === undefined) {
        return Object.keys(jurisdictionsById);
      }
      return values(jurisdictionsById)
        .filter(item => {
          return 'geometry' in item === filterGeom;
        })
        .map(item => item.id);
    }
  );

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

/** Get Missing Jurisdiction Ids
 *
 * This is a convenient selector that takes an array of jurisdiction ids and then
 * returns the ones that are not already existing in the Redux store.
 *
 * Passing filterGeom === true will additionally return ids of jurisdictions that have
 * no geometry field.
 *
 * The initial use-case of this is to provide the ability to figure out which jurisdiction
 * ids are missing from a known list of ids; and which are both missing and have no
 * geometry.
 *
 * ^^ Might be useful when we are trying to figure out which jurisdictions to fetch from
 * OpenSRP API when we need geometries.
 *
 * @param state - the store
 * @param props -  the filterProps
 */
export const getMissingJurisdictionIds = () =>
  createSelector(
    [getJurisdictionIds(), getJurisdictionIdsArray],
    (jurisdictionIds, inputJurisdictionIdsArray): string[] => {
      if (!inputJurisdictionIdsArray) {
        return jurisdictionIds;
      }
      return inputJurisdictionIdsArray.filter(id => !jurisdictionIds.includes(id));
    }
  );
