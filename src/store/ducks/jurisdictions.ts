import { get, keyBy, keys, pickBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { FlexObject, GeoJSON, Geometry } from '../../helpers/utils';
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

/** Interface descriing a list of all child ids of a given jurisdiction id */
export interface ChildrenByParentId {
  [key: string]: string[];
}

/** Interface descriing a list of all jurisdictions ids of a plan id */
export interface JurisdictionIdsByPlanId {
  [key: string]: string[];
}

// action types
export const FETCH_JURISDICTION = 'reveal/reducer/jurisdiction/FETCH_JURISDICTION';
export const FETCH_ALL_JURISDICTION_IDS = 'reveal/reducer/jurisdiction/FETCH_ALL_JURISDICTION_IDS';
export const FETCH_CHILDREN_BY_PARENT_ID =
  'reveal/reducer/jurisdiction/FETCH_CHILDREN_BY_PARENT_ID';
export const FETCH_JURISIDCTIONS_BY_PLAN_ID =
  'reveal/reducer/jurisdiction/FETCH_JURISIDCTIONS_BY_PLAN_ID';
export const REMOVE_JURISDICTIONS = 'reveal/reducer/jurisdiction/REMOVE_JURISDICTIONS';
export const REMOVE_ALL_JURISDICTION_IDS = 'reveal/reducer/jurisdiction/REMOVE_ALL_JURISDICTIONIDS';
export const REMOVE_CHILDREN_BY_PARENT_ID =
  'reveal/reducer/jurisdiction/REMOVE_CHILDREN_BY_PARENT_ID';
export const REMOVE_JURISIDCTIONS_BY_PLAN_ID =
  'reveal/reducer/jurisdiction/REMOVE_JURISIDCTIONS_BY_PLAN_ID';

/** fetch jurisdiction action */
interface FetchJurisdictionAction extends AnyAction {
  allJurisdictionIds?: AllJurisdictionIds;
  jurisdictionsById: { [key: string]: Jurisdiction };
  type: typeof FETCH_JURISDICTION;
}

/** fetch allJurisdictionIds action */
interface FetchAllJurisdictionIdsAction extends AnyAction {
  allJurisdictionIds: AllJurisdictionIds;
  type: typeof FETCH_ALL_JURISDICTION_IDS;
}

/** fetch childrenByParentId action */
interface FetchChildrenByParentIdAction extends AnyAction {
  childrenByParentId: ChildrenByParentId;
  type: typeof FETCH_CHILDREN_BY_PARENT_ID;
}

/** fetch jurisdictionIdsByPlanId action */
interface FetchJurisdictionIdsByPlanId extends AnyAction {
  jurisdictionIdsByPlanId: JurisdictionIdsByPlanId;
  type: typeof FETCH_JURISIDCTIONS_BY_PLAN_ID;
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

/** Remove childrenByParentId action interface */
interface RemoveChildrenByParentIdAction extends AnyAction {
  childrenByParentId: {};
  type: typeof REMOVE_CHILDREN_BY_PARENT_ID;
}

/** Remove jurisdictionIdsByPlanId action interface */
interface RemoveJurisdictionIdsByPlanId extends AnyAction {
  jurisdictionIdsByPlanId: {};
  type: typeof REMOVE_JURISIDCTIONS_BY_PLAN_ID;
}

/** jurisdiction action types */
export type JurisdictionActionTypes =
  | FetchJurisdictionAction
  | FetchAllJurisdictionIdsAction
  | FetchChildrenByParentIdAction
  | FetchJurisdictionIdsByPlanId
  | RemoveJurisdictionsAction
  | RemoveAllJurisdictionIdsAction
  | RemoveChildrenByParentIdAction
  | RemoveJurisdictionIdsByPlanId
  | AnyAction;

/** interface to describe jurisdiction state */
interface JurisdictionState {
  allJurisdictionIds: AllJurisdictionIds;
  childrenByParentId: ChildrenByParentId;
  jurisdictionIdsByPlanId: JurisdictionIdsByPlanId;
  jurisdictionsById: { [key: string]: Jurisdiction };
}

/** immutable Jurisdiction state */
export type ImmutableJurisdictionState = JurisdictionState &
  SeamlessImmutable.ImmutableObject<JurisdictionState>;

/** initial state */
const initialState: ImmutableJurisdictionState = SeamlessImmutable({
  allJurisdictionIds: {} as AllJurisdictionIds,
  childrenByParentId: {},
  jurisdictionIdsByPlanId: {},
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
    case FETCH_CHILDREN_BY_PARENT_ID:
      return SeamlessImmutable({
        ...state,
        childrenByParentId: {
          ...state.childrenByParentId,
          ...action.childrenByParentId,
        },
      });
    case FETCH_JURISIDCTIONS_BY_PLAN_ID:
      return SeamlessImmutable({
        ...state,
        jurisdictionIdsByPlanId: {
          ...state.jurisdictionIdsByPlanId,
          ...action.jurisdictionIdsByPlanId,
        },
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
    case REMOVE_CHILDREN_BY_PARENT_ID:
      return SeamlessImmutable({
        ...state,
        childrenByParentId: action.childrenByParentId,
      });
    case REMOVE_JURISIDCTIONS_BY_PLAN_ID:
      return SeamlessImmutable({
        ...state,
        jurisdictionIdsByPlanId: action.jurisdictionIdsByPlanId,
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

/** fetch childrenByParentId creator
 * @param {ChildrenByParentId} childrenByParentId
 */
export const fetchChildrenByParentId = (childrenByParentId: ChildrenByParentId) => {
  return {
    childrenByParentId,
    type: FETCH_CHILDREN_BY_PARENT_ID,
  };
};

/** fetch JurisdictionIdsByPlanId creator
 * @param {JurisdictionIdsByPlanId} childrenByParentId
 */
export const fetchJurisdictionIdsByPlanId = (jurisdictionIdsByPlanId: JurisdictionIdsByPlanId) => {
  return {
    jurisdictionIdsByPlanId,
    type: FETCH_JURISIDCTIONS_BY_PLAN_ID,
  };
};

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

/** remove childrenByParentId Action */
export const removeChildrenByParentIdAction: RemoveChildrenByParentIdAction = {
  childrenByParentId: {},
  type: REMOVE_CHILDREN_BY_PARENT_ID,
};

/** remove childrenByParentId Action */
export const removeJurisdictionIdsByPlanId: RemoveJurisdictionIdsByPlanId = {
  jurisdictionIdsByPlanId: {},
  type: REMOVE_JURISIDCTIONS_BY_PLAN_ID,
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
    pickBy((state as any)[reducerName].allJurisdictionIds, (j: FlexObject) =>
      isLoaded ? j.isLoaded : !j.isLoaded
    )
  );
}

/** get the full childrenByParentId object
 * @param {Partial<Store>} state - the redux store
 * @returns {ChildrenByParentId} an object keyed by parentId contain ids of all descendant jurisdictions
 */
export function getChildrenByParentId(state: Partial<Store>): ChildrenByParentId {
  return (state as any)[reducerName].childrenByParentId;
}

/** get the full jurisdictionIdsByPlanId object
 * @param {Partial<Store>} state - the redux store
 * @returns {JurisdictionIdsByPlanId} an object keyed by planId containing ids of all relevant jurisdictions
 */
export function getJurisdictionIdsByPlanId(state: Partial<Store>): JurisdictionIdsByPlanId {
  return (state as any)[reducerName].jurisdictionIdsByPlanId;
}
