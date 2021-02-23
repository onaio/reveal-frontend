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
import { BLUE, DARK_RED, RED, WHITE } from '../../../../colors';
import { TreeNode } from '../hierarchies/types';
import { nodeIsSelected } from '../hierarchies/utils';

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
  currentChildren?: TreeNode[] /** used when getting node of interest whose features need new properties */;
  filterGeom?: boolean /** whether to filter jurisdictions that have geometry field */;
  jurisdictionId?: string /** jurisdiction id */;
  jurisdictionIdsArray?: string[] /** array of jurisdiction ids */;
  matchFeatures?: boolean /** whether to match features with nodes */;
  newFeatureProps?: boolean /** whether to add new fields to feature properties */;
  parentId?: string /** parent id */;
  planId: string /** plan identifier */;
  rootJurisdictionId: string /** root jurisdiction id */;
}

/** retrieve the planId value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getPlanId = (_: Partial<Store>, props: Filters) => props.planId;

/** retrieve the matchFeatures value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getMatchFeatures = (_: Partial<Store>, props: Filters) => props.matchFeatures;

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

/**
 * get newFeatureProps value from filterProps
 * @param _ - the store
 * @param props - filterProps
 */
export const getNewFeatureProps = (_: Partial<Store>, props: Filters) => props.newFeatureProps;

/**
 * get current child jurisdictions from filterProps
 * @param _ - store
 * @param props - filterProps
 */
export const getChildJurisdictions = (_: Partial<Store>, props: Filters) => props.currentChildren;

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
        return result.filter(item => {
          if (!item.properties.parentId) {
            return item.id === parentId;
          }
          return item.properties.parentId === parentId;
        });
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
    [
      getJurisdictionsArray(),
      getNewFeatureProps,
      getChildJurisdictions,
      getFilterGeom,
      getMatchFeatures,
    ],
    (
      jurisdictionsArray,
      newFeatureProps,
      currentChildren,
      filterGeom,
      matchFeatures
    ): FeatureCollection => {
      let activeJurisdictionsArray = jurisdictionsArray;
      if (filterGeom) {
        activeJurisdictionsArray = activeJurisdictionsArray.filter(item => 'geometry' in item);
      }
      let validFeatures = activeJurisdictionsArray.filter(item => 'geometry' in item) as Feature[];
      // ensure node features are present
      if (currentChildren && matchFeatures && validFeatures.length !== currentChildren.length) {
        const childrenIds = currentChildren.map(node => node.model.id || node.parent.model.id);
        validFeatures = validFeatures.filter(feature => childrenIds.includes(feature.id));
      }
      return {
        features: validFeatures.map((feature: Feature) => {
          if (newFeatureProps) {
            const getNode = (currentChildren as TreeNode[]).find(
              (node: any) => node.model.id === feature.id || node.parent.model.id === feature.id
            ) as TreeNode;
            return {
              ...feature,
              id: getNode.model.id, // set true jurisdiction id from node,
              properties: {
                ...feature.properties,
                fillColor: nodeIsSelected(getNode) ? RED : DARK_RED,
                fillOutlineColor: nodeIsSelected(getNode) ? BLUE : WHITE,
                jurisdiction_id: getNode.model.id, // set true jurisdiction id from node
                lineColor: nodeIsSelected(getNode) ? BLUE : WHITE,
              },
            };
          }
          return feature;
        }),
        type: 'FeatureCollection',
      } as FeatureCollection;
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
