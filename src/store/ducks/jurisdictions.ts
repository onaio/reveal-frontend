import { Registry } from '@onaio/redux-reducer-registry';
import { Dictionary } from '@onaio/utils';
import { get, keyBy, keys, pickBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';
import { GeoJSON, Geometry } from '../../helpers/utils';
import store from '../../store';

export const reducerName = 'jurisdictions';

/** interface for jurisdiction GeoJSON */
export interface JurisdictionGeoJSON extends GeoJSON {
  geometry: Geometry;
  properties: {
    jurisdiction_name: string;
    jurisdiction_parent_id: string;
  };
}

// todo - distinguish non-geo Jurisdiction, inheritted by new JurisdictionGeo type
/** interface to describe Jurisdiction */
export interface Jurisdiction {
  geographic_level?: number;
  geojson?: JurisdictionGeoJSON;
  jurisdiction_id: string;
  name?: string | null;
  parent_id?: string | null;
}

/** Interface describing a list of loaded Jurisdictions */
export interface AllJurisdictionIds {
  [key: string]: {
    id: string;
    isLoaded: boolean;
  };
}

// action types
export const FETCH_JURISDICTION = 'reveal/reducer/jurisdiction/FETCH_JURISDICTION';
export const FETCH_ALL_JURISDICTION_IDS = 'reveal/reducer/jurisdiction/FETCH_ALL_JURISDICTION_IDS';
export const REMOVE_JURISDICTIONS = 'reveal/reducer/jurisdiction/REMOVE_JURISDICTIONS';
export const REMOVE_ALL_JURISDICTION_IDS = 'reveal/reducer/jurisdiction/REMOVE_ALL_JURISDICTIONIDS';

/** fetch jurisdiction action */
export interface FetchJurisdictionAction extends AnyAction {
  allJurisdictionIds?: AllJurisdictionIds;
  jurisdictionsById: { [key: string]: Jurisdiction };
  type: typeof FETCH_JURISDICTION;
}

/** fetch allJurisdictionIds action */
interface FetchAllJurisdictionIdsAction extends AnyAction {
  allJurisdictionIds: AllJurisdictionIds;
  type: typeof FETCH_ALL_JURISDICTION_IDS;
}

/** Remove jurisdictions action interface */
interface RemoveJurisdictionsAction extends AnyAction {
  jurisdictionsById: {};
  type: typeof REMOVE_JURISDICTIONS;
}

/** Interface for remove all jurisdictions ids action */
interface RemoveAllJurisdictionIdsAction extends AnyAction {
  type: typeof REMOVE_ALL_JURISDICTION_IDS;
  allJurisdictionIds: {};
}

/** jurisdiction action types */
export type JurisdictionActionTypes =
  | FetchJurisdictionAction
  | FetchAllJurisdictionIdsAction
  | RemoveJurisdictionsAction
  | RemoveAllJurisdictionIdsAction
  | AnyAction;

/** interface to describe jurisdiction state */
interface JurisdictionState {
  allJurisdictionIds: AllJurisdictionIds | {};
  jurisdictionsById: { [key: string]: Jurisdiction } | {};
}

/** immutable Jurisdiction state */
export type ImmutableJurisdictionState = JurisdictionState &
  SeamlessImmutable.ImmutableObject<JurisdictionState>;

/** initial state */
const initialState: ImmutableJurisdictionState = SeamlessImmutable({
  allJurisdictionIds: {} as AllJurisdictionIds,
  jurisdictionsById: {},
});

// reducer
/** jurisdiction reducer function */
export default function reducer(
  state = initialState,
  action: JurisdictionActionTypes
): ImmutableJurisdictionState {
  switch (action.type) {
    case FETCH_JURISDICTION:
      if (action.jurisdictionsById) {
        return SeamlessImmutable({
          ...state,
          allJurisdictionIds: { ...state.allJurisdictionIds, ...action.allJurisdictionIds },
          jurisdictionsById: {
            ...state.jurisdictionsById,
            ...action.jurisdictionsById,
          },
        });
      }
      return state;
    case FETCH_ALL_JURISDICTION_IDS:
      return SeamlessImmutable({
        ...state,
        allJurisdictionIds: { ...state.allJurisdictionIds, ...action.allJurisdictionIds },
      });
    case REMOVE_JURISDICTIONS:
      return SeamlessImmutable({
        ...state,
        jurisdictionsById: action.jurisdictionsById,
      });
    case REMOVE_ALL_JURISDICTION_IDS:
      return SeamlessImmutable({
        ...state,
        allJurisdictionIds: action.allJurisdictionIds,
      });
    default:
      return state;
  }
}

// action creators
/** fetch Jurisdiction creator
 * @param {Jurisdiction[]} jurisdictionList - array of jurisdiction objects
 * @returns {FetchJurisdictionAction} FetchJurisdictionAction
 */
export const fetchJurisdictions = (jurisdictionList: Jurisdiction[] = []) => {
  return {
    allJurisdictionIds: keyBy(
      jurisdictionList.map((j: Jurisdiction) => ({
        id: j.jurisdiction_id,
        isLoaded: typeof j.geojson !== 'undefined',
      })),
      j => j.id
    ),
    jurisdictionsById: keyBy(
      jurisdictionList.map((item: Jurisdiction) => {
        const previousItem = getJurisdictionById(store.getState(), item.jurisdiction_id);
        /** ensure geojson is parsed */
        if (typeof item.geojson === 'string') {
          item.geojson = JSON.parse(item.geojson);
        }
        /** ensure geometry is parsed */
        if (item.geojson && typeof item.geojson.geometry === 'string') {
          item.geojson.geometry = JSON.parse(item.geojson.geometry);
        }
        if (previousItem) {
          return {
            ...previousItem,
            ...item,
          };
        }
        return item;
      }),
      jurisdiction => jurisdiction.jurisdiction_id
    ),
    type: FETCH_JURISDICTION,
  };
};

/** fetch all Jurisdiction Ids creator */
export const fetchAllJurisdictionIds = (jurisdictionIds: string[]) => ({
  allJurisdictionIds: keyBy(
    jurisdictionIds.map((id: string) => ({
      id,
      isLoaded: !!(
        getJurisdictionById(store.getState(), id) &&
        (getJurisdictionById(store.getState(), id) as Jurisdiction).geojson
      ),
    })),
    j => j.id
  ),
  type: FETCH_ALL_JURISDICTION_IDS,
});

// actions
/** removeJurisdictions Action */
export const removeJurisdictionsAction = {
  jurisdictionsById: {},
  type: REMOVE_JURISDICTIONS,
};

/** remove all jurisdiction ids Actoin */
export const removeAllJurisdictionIdsAction: RemoveAllJurisdictionIdsAction = {
  allJurisdictionIds: {},
  type: REMOVE_ALL_JURISDICTION_IDS,
};

// selectors
/** get jurisdictions by id
 * @param {Partial<Store>} state - the redux store
 */
export function getJurisdictionsById(state: Partial<Store>): { [key: string]: Jurisdiction } {
  return (state as any)[reducerName].jurisdictionsById;
}

/** get one jurisdiction using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} id - the jurisdiction id
 * @returns {Jurisdiction|null} a jurisdiction or null
 */
export function getJurisdictionById(state: Partial<Store>, id: string): Jurisdiction | null {
  return get((state as any)[reducerName].jurisdictionsById, id) || null;
}

/** get an array of jurisdiction objects
 * @param {Partial<Store>} state - the redux store
 * @returns {Jurisdiction[]} an array of jurisdictions
 */
export function getJurisdictionsArray(state: Partial<Store>): Jurisdiction[] {
  return values((state as any)[reducerName].jurisdictionsById);
}

/** get an array of jurisdiction ids
 * @param {Partial<Store>} state - the redux store
 * @returns {string[]} an array of jurisdictions ids
 */
export function getJurisdictionsIdArray(state: Partial<Store>): string[] {
  return keys((state as any)[reducerName].jurisdictionsById);
}

/** get all JurisdictionIds in the system */
export function getAllJurisdictionsIds(state: Partial<Store>): string[] {
  return (state as any)[reducerName].allJurisdictionIds;
}

/** get an array of all jurisdiction ids
 * @param {Partial<Store>} state - the redux store
 * @param {boolean|undefined} isLoaded optional - filter by isLoaded
 * @returns an array of all jurisdictions available from the server
 */
export function getAllJurisdictionsIdArray(
  state: Partial<Store>,
  isLoaded?: boolean | undefined
): string[] {
  if (typeof isLoaded === 'undefined') {
    return keys((state as any)[reducerName].allJurisdictionIds);
  }
  return keys(
    pickBy((state as any)[reducerName].allJurisdictionIds, (j: Dictionary) =>
      isLoaded ? j.isLoaded : !j.isLoaded
    )
  );
}

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of jurisdiction filter options/params */
export interface JurisdictionFilters {
  jurisdictionId?: string /** the jurisdiction id */;
}

/** getJurisdictionId
 * Gets interventionType from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getJurisdictionId = (_: Registry, props: JurisdictionFilters) => props.jurisdictionId;

/** makeJurisdictionByIdSelector
 * Returns a selector that gets one jurisdiction by its id
 *
 * This selector is meant to be a memoized replacement for getJurisdictionById.
 *
 * To use this selector, do something like:
 *    const jurisdictionByIdSelector = makeJurisdictionByIdSelector();
 *
 * @param {Registry} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 */
export const makeJurisdictionByIdSelector = () => {
  return createSelector(
    [getJurisdictionsById, getJurisdictionId],
    (jurisdictionsById, jurisdictionId) =>
      jurisdictionId ? get(jurisdictionsById, jurisdictionId) || null : null
  );
};
