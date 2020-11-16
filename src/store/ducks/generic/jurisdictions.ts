import { Dictionary } from '@onaio/utils';
import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** the reducer name */
export const reducerName = 'GenericJurisdictions';

/** GenericJurisdiction interface */
export interface GenericJurisdiction {
  id: string;
  is_leaf_node: boolean;
  is_virtual_jurisdiction?: boolean;
  jurisdiction_depth: number;
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_name_path: string[];
  jurisdiction_parent_id: string;
  jurisdiction_path: string[];
  plan_id: string;
}

export interface NamibiaJurisdiction extends GenericJurisdiction {
  jurisdiction_target: number;
  lockedfirst: number;
  lockedmopup: number;
  refusalsfirst: number;
  refusalsmopup: number;
  sprayeffectiveness: number;
  structuresfound: number;
  structuressprayed: number;
  targetcoverage: number;
}

export interface ZambiaJurisdiction extends GenericJurisdiction {
  totstruct: number;
  rooms_eligible: number;
  rooms_sprayed: number;
  sprayed_rooms_eligible: number;
  sprayed_rooms_sprayed: number;
  foundstruct: number;
  sprayedstruct: number;
  totareas: number;
  targareas: number;
  targstruct: number;
  perctvisareaseffect: number;
  spraycovtarg: number;
  roomcov: number;
}

export interface ZambiaIRSFocusArea extends GenericJurisdiction {
  totstruct: number;
  rooms_eligible: number;
  rooms_sprayed: number;
  sprayed_rooms_eligible: number;
  sprayed_rooms_sprayed: number;
  foundstruct: number;
  sprayedstruct: number;
  spraycov: number;
  spraytarg: number;
  spraysuccess: number;
  roomcov: number;
  notsprayed_reasons: string[];
  notsprayed_reasons_counts: Dictionary<number>;
}

// actions

/** GENERIC_JURISDICTION_FETCHED action type */
export const GENERIC_JURISDICTIONS_FETCHED =
  'reveal/reducer/IRS/GenericJurisdiction/GENERIC_JURISDICTIONS_FETCHED';

/** GENERIC_JURISDICTION_FETCHED action type */
export const REMOVE_GENERIC_JURISDICTIONS =
  'reveal/reducer/IRS/GenericJurisdiction/REMOVE_GENERIC_JURISDICTIONS';

/** GENERIC_JURISDICTION_FETCHED action type */
export const ADD_GENERIC_JURISDICTION =
  'reveal/reducer/IRS/GenericJurisdiction/ADD_GENERIC_JURISDICTION';

/** interface for fetch GenericJurisdictions action */
interface FetchGenericJurisdictionsAction extends AnyAction {
  objects: { [key: string]: GenericJurisdiction };
  reducerKey: string;
  type: typeof GENERIC_JURISDICTIONS_FETCHED;
}

/** interface for removing GenericJurisdictions action */
interface RemoveGenericJurisdictionsAction extends AnyAction {
  objects: { [key: string]: GenericJurisdiction };
  reducerKey: string;
  type: typeof REMOVE_GENERIC_JURISDICTIONS;
}

/** interface for adding a single GenericJurisdictions action */
interface AddGenericJurisdictionAction extends AnyAction {
  obj: GenericJurisdiction;
  reducerKey: string;
  type: typeof ADD_GENERIC_JURISDICTION;
}

/** Create type for GenericJurisdiction reducer actions */
export type GenericJurisdictionActionTypes =
  | FetchGenericJurisdictionsAction
  | RemoveGenericJurisdictionsAction
  | AddGenericJurisdictionAction
  | AnyAction;

// action creators

/**
 * Fetch Plan Definitions action creator
 * @param {string} reducerKey - they reducer key
 * @param {GenericJurisdiction[]} objList - list of plan definition objects
 */
export const fetchGenericJurisdictions = (
  reducerKey: string = 'GenericJurisdictionsById',
  objList: GenericJurisdiction[] = []
): FetchGenericJurisdictionsAction => ({
  objects: keyBy(
    objList
      .filter(jur => jur.jurisdiction_id && jur.jurisdiction_name_path && jur.jurisdiction_path)
      .map(
        (obj: GenericJurisdiction): GenericJurisdiction => {
          /** ensure geojson is parsed */
          if ((obj as any).geojson && typeof (obj as any).geojson === 'string') {
            (obj as any).geojson = JSON.parse((obj as any).geojson);
          }
          /** ensure geometry is parsed */
          if (
            (obj as any).geojson &&
            (obj as any).geojson.geometry &&
            typeof (obj as any).geojson.geometry === 'string'
          ) {
            (obj as any).geojson.geometry = JSON.parse((obj as any).geojson.geometry);
          }
          /** ensure jurisdiction_name_path is parsed */
          if (typeof obj.jurisdiction_name_path === 'string') {
            obj.jurisdiction_name_path = JSON.parse(obj.jurisdiction_name_path);
          }
          /** ensure jurisdiction_path is parsed */
          if (typeof obj.jurisdiction_path === 'string') {
            obj.jurisdiction_path = JSON.parse(obj.jurisdiction_path);
          }
          return obj;
        }
      ),
    'id'
  ),
  reducerKey,
  type: GENERIC_JURISDICTIONS_FETCHED,
});

/** Reset plan definitions state action creator
 * @param {string} reducerKey - they reducer key
 */
export const removeGenericJurisdictions = (reducerKey: string = 'GenericJurisdictionsById') => ({
  objects: {},
  reducerKey,
  type: REMOVE_GENERIC_JURISDICTIONS,
});

/**
 * Add one Plan Definition action creator
 * @param {GenericJurisdiction} obj - the plan definition object
 * @param {string} reducerKey - they reducer key
 */
export const addGenericJurisdiction = (
  reducerKey: string = 'GenericJurisdictionsById',
  obj: GenericJurisdiction
): AddGenericJurisdictionAction => ({
  obj,
  reducerKey,
  type: ADD_GENERIC_JURISDICTION,
});

// the reducer

/** interface for GenericJurisdiction state */
interface GenericJurisdictionState {
  [key: string]: {
    [key: string]: NamibiaJurisdiction | ZambiaJurisdiction | ZambiaIRSFocusArea;
  };
}

type FullGenericJurisdictionState = GenericJurisdictionState | {};

/** immutable GenericJurisdiction state */
export type ImmutableGenericJurisdictionState = FullGenericJurisdictionState &
  SeamlessImmutable.ImmutableObject<FullGenericJurisdictionState>;

/** initial GenericJurisdiction state */
const initialState: ImmutableGenericJurisdictionState = SeamlessImmutable({});

/** the GenericJurisdiction reducer function */
export default function reducer(
  state: any = initialState,
  action: GenericJurisdictionActionTypes
): ImmutableGenericJurisdictionState {
  switch (action.type) {
    case GENERIC_JURISDICTIONS_FETCHED:
      if (action.objects) {
        return SeamlessImmutable({
          ...state,
          [action.reducerKey]: { ...state[action.reducerKey], ...action.objects },
        });
      }
      return state;
    case ADD_GENERIC_JURISDICTION:
      if (action.obj as GenericJurisdiction) {
        return SeamlessImmutable({
          ...state,
          [action.reducerKey]: {
            ...state[action.reducerKey],
            [action.obj.id as string]: action.obj,
          },
        });
      }
      return state;
    case REMOVE_GENERIC_JURISDICTIONS:
      return SeamlessImmutable({
        ...state,
        [action.reducerKey]: action.objects,
      });
    default:
      return state;
  }
}

// selectors

/** get GenericJurisdictions by id
 * @param {Partial<Store>} state - the redux store
 * @param {string} reducerKey - they reducer key
 * @param {string} planId - the plan id
 * @param {string} parentId - the parent id
 * @returns {{ [key: string]: GenericJurisdiction }} GenericJurisdictions by id
 */
export function getGenericJurisdictionsById(
  state: Partial<Store>,
  reducerKey: string = 'GenericJurisdictionsById',
  planId: string | null = null,
  parentId: string | null = null
): { [key: string]: GenericJurisdiction } {
  return keyBy(getGenericJurisdictionsArray(state, reducerKey, planId, parentId), 'id');
}

/** get one GenericJurisdiction using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} reducerKey - they reducer key
 * @param {string} id - the GenericJurisdiction id
 * @returns {GenericJurisdiction|null} a GenericJurisdiction object or null
 */
export function getGenericJurisdictionById(
  state: Partial<Store>,
  reducerKey: string = 'GenericJurisdictionsById',
  id: string
): GenericJurisdiction | null {
  return get((state as any)[reducerName][reducerKey], id) || null;
}

/** get one GenericJurisdiction using its jurisdiction_id
 * @param {Partial<Store>} state - the redux store
 * @param {string} reducerKey - they reducer key
 * @param {string} jurisdictionId - the GenericJurisdiction id
 * @returns {GenericJurisdiction|null} a GenericJurisdiction object or null
 */
export function getGenericJurisdictionByJurisdictionId(
  state: Partial<Store>,
  reducerKey: string = 'GenericJurisdictionsById',
  jurisdictionId: string
): GenericJurisdiction | null {
  return values((state as any)[reducerName][reducerKey]).filter(
    (e: GenericJurisdiction) => e.jurisdiction_id === jurisdictionId
  )[0];
}

/** get an array of GenericJurisdiction objects
 * @param {Partial<Store>} state - the redux store
 * @param {string} reducerKey - they reducer key
 * @param {string} planId - the plan id
 * @param {string} parentId - the parent id
 * @returns {GenericJurisdiction[]} an array of GenericJurisdiction objects
 */
export function getGenericJurisdictionsArray(
  state: Partial<Store>,
  reducerKey: string = 'GenericJurisdictionsById',
  planId: string | null = null,
  parentId: string | null = null
): GenericJurisdiction[] {
  let result = values((state as any)[reducerName][reducerKey]);
  if (planId) {
    result = result.filter((e: GenericJurisdiction) => e.plan_id === planId);
  }
  if (parentId) {
    return result.filter((e: GenericJurisdiction) => e.jurisdiction_parent_id === parentId);
  }
  return result;
}
