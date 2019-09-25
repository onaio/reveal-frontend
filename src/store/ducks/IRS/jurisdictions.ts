import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** the reducer name */
export const reducerName = 'IRSJurisdictions';

/** IRSJurisdiction interface */
export interface IRSJurisdiction {
  id: string;
  jurisdiction_depth: number;
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_name_path: string[];
  jurisdiction_parent_id: string;
  jurisdiction_path: string[];
  plan_id: string;
}

export interface NamibiaIRSJurisdiction extends IRSJurisdiction {
  lockedfirst: number;
  lockedmopup: number;
  refusalsfirst: number;
  refusalsmopup: number;
  sprayeffectiveness: number;
  structuresfound: number;
  structuressprayed: number;
  targetcoverage: number;
  target_2019: number;
}

export interface ZambiaIRSJurisdiction extends IRSJurisdiction {
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

export interface ZambiaIRSFocusArea extends IRSJurisdiction {
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
}

// actions

/** IRS_JURISDICTION_FETCHED action type */
export const IRS_JURISDICTIONS_FETCHED =
  'reveal/reducer/IRS/IRSJurisdiction/IRS_JURISDICTIONS_FETCHED';

/** IRS_JURISDICTION_FETCHED action type */
export const REMOVE_IRS_JURISDICTIONS =
  'reveal/reducer/IRS/IRSJurisdiction/REMOVE_IRS_JURISDICTIONS';

/** IRS_JURISDICTION_FETCHED action type */
export const ADD_IRS_JURISDICTION = 'reveal/reducer/IRS/IRSJurisdiction/ADD_IRS_JURISDICTION';

/** interface for fetch IRSJurisdictions action */
interface FetchIRSJurisdictionsAction extends AnyAction {
  objects: { [key: string]: IRSJurisdiction };
  reducerKey: string;
  type: typeof IRS_JURISDICTIONS_FETCHED;
}

/** interface for removing IRSJurisdictions action */
interface RemoveIRSJurisdictionsAction extends AnyAction {
  objects: { [key: string]: IRSJurisdiction };
  reducerKey: string;
  type: typeof REMOVE_IRS_JURISDICTIONS;
}

/** interface for adding a single IRSJurisdictions action */
interface AddIRSJurisdictionAction extends AnyAction {
  obj: IRSJurisdiction;
  reducerKey: string;
  type: typeof ADD_IRS_JURISDICTION;
}

/** Create type for IRSJurisdiction reducer actions */
export type IRSJurisdictionActionTypes =
  | FetchIRSJurisdictionsAction
  | RemoveIRSJurisdictionsAction
  | AddIRSJurisdictionAction
  | AnyAction;

// action creators

/**
 * Fetch Plan Definitions action creator
 * @param {string} reducerKey - they reducer key
 * @param {IRSJurisdiction[]} objList - list of plan definition objects
 */
export const fetchIRSJurisdictions = (
  reducerKey: string = 'IRSJurisdictionsById',
  objList: IRSJurisdiction[] = []
): FetchIRSJurisdictionsAction => ({
  objects: keyBy(objList, 'id'),
  reducerKey,
  type: IRS_JURISDICTIONS_FETCHED,
});

/** Reset plan definitions state action creator
 * @param {string} reducerKey - they reducer key
 */
export const removeIRSJurisdictions = (reducerKey: string = 'IRSJurisdictionsById') => ({
  objects: {},
  reducerKey,
  type: REMOVE_IRS_JURISDICTIONS,
});

/**
 * Add one Plan Definition action creator
 * @param {IRSJurisdiction} obj - the plan definition object
 * @param {string} reducerKey - they reducer key
 */
export const addIRSJurisdiction = (
  reducerKey: string = 'IRSJurisdictionsById',
  obj: IRSJurisdiction
): AddIRSJurisdictionAction => ({
  obj,
  reducerKey,
  type: ADD_IRS_JURISDICTION,
});

// the reducer

/** interface for IRSJurisdiction state */
interface IRSJurisdictionState {
  [key: string]: {
    [key: string]: NamibiaIRSJurisdiction | ZambiaIRSJurisdiction | ZambiaIRSJurisdiction;
  };
}

/** immutable IRSJurisdiction state */
export type ImmutableIRSJurisdictionState = IRSJurisdictionState &
  SeamlessImmutable.ImmutableObject<IRSJurisdictionState>;

/** initial IRSJurisdiction state */
const initialState: ImmutableIRSJurisdictionState = SeamlessImmutable({});

/** the IRSJurisdiction reducer function */
export default function reducer(
  state: any = initialState,
  action: IRSJurisdictionActionTypes
): ImmutableIRSJurisdictionState {
  switch (action.type) {
    case IRS_JURISDICTIONS_FETCHED:
      if (action.objects) {
        return SeamlessImmutable({
          ...state,
          [action.reducerKey]: { ...state[action.reducerKey], ...action.objects },
        });
      }
      return state;
    case ADD_IRS_JURISDICTION:
      if (action.obj as IRSJurisdiction) {
        return SeamlessImmutable({
          ...state,
          [action.reducerKey]: {
            ...state[action.reducerKey],
            [action.obj.id as string]: action.obj,
          },
        });
      }
      return state;
    case REMOVE_IRS_JURISDICTIONS:
      return SeamlessImmutable({
        ...state,
        [action.reducerKey]: action.objects,
      });
    default:
      return state;
  }
}

// selectors

/** get IRSJurisdictions by id
 * @param {Partial<Store>} state - the redux store
 * @param {string} reducerKey - they reducer key
 * @param {string} planId - the plan id
 * @param {string} parentId - the parent id
 * @returns {{ [key: string]: IRSJurisdiction }} IRSJurisdictions by id
 */
export function getIRSJurisdictionsById(
  state: Partial<Store>,
  reducerKey: string = 'IRSJurisdictionsById',
  planId: string | null = null,
  parentId: string | null = null
): { [key: string]: IRSJurisdiction } {
  return keyBy(getIRSJurisdictionsArray(state, reducerKey, planId, parentId), 'id');
}

/** get one IRSJurisdiction using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} reducerKey - they reducer key
 * @param {string} id - the IRSJurisdiction id
 * @returns {IRSJurisdiction|null} a IRSJurisdiction object or null
 */
export function getIRSJurisdictionById(
  state: Partial<Store>,
  reducerKey: string = 'IRSJurisdictionsById',
  id: string
): NamibiaIRSJurisdiction | null {
  return get((state as any)[reducerName][reducerKey], id) || null;
}

/** get an array of IRSJurisdiction objects
 * @param {Partial<Store>} state - the redux store
 * @param {string} reducerKey - they reducer key
 * @param {string} planId - the plan id
 * @param {string} parentId - the parent id
 * @returns {IRSJurisdiction[]} an array of IRSJurisdiction objects
 */
export function getIRSJurisdictionsArray(
  state: Partial<Store>,
  reducerKey: string = 'IRSJurisdictionsById',
  planId: string | null = null,
  parentId: string | null = null
): IRSJurisdiction[] {
  let result = values((state as any)[reducerName][reducerKey]);
  if (planId) {
    result = result.filter((e: IRSJurisdiction) => e.plan_id === planId);
  }
  if (parentId) {
    return result.filter((e: IRSJurisdiction) => e.jurisdiction_parent_id === parentId);
  }
  return result;
}
