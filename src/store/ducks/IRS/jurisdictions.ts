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
  IRSJurisdictionsById: { [key: string]: NamibiaIRSJurisdiction };
  type: typeof IRS_JURISDICTIONS_FETCHED;
}

/** interface for removing IRSJurisdictions action */
interface RemoveIRSJurisdictionsAction extends AnyAction {
  IRSJurisdictionsById: { [key: string]: NamibiaIRSJurisdiction };
  type: typeof REMOVE_IRS_JURISDICTIONS;
}

/** interface for adding a single IRSJurisdictions action */
interface AddIRSJurisdictionAction extends AnyAction {
  obj: NamibiaIRSJurisdiction;
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
 * @param {IRSJurisdiction[]} objList - list of plan definition objects
 */
export const fetchIRSJurisdictions = (
  objList: NamibiaIRSJurisdiction[] = []
): FetchIRSJurisdictionsAction => ({
  IRSJurisdictionsById: keyBy(objList, 'id'),
  type: IRS_JURISDICTIONS_FETCHED,
});

/** Reset plan definitions state action creator */
export const removeIRSJurisdictions = () => ({
  IRSJurisdictionsById: {},
  type: REMOVE_IRS_JURISDICTIONS,
});

/**
 * Add one Plan Definition action creator
 * @param {IRSJurisdiction} obj - the plan definition object
 */
export const addIRSJurisdiction = (obj: NamibiaIRSJurisdiction): AddIRSJurisdictionAction => ({
  obj,
  type: ADD_IRS_JURISDICTION,
});

// the reducer

/** interface for IRSJurisdiction state */
interface IRSJurisdictionState {
  IRSJurisdictionsById: { [key: string]: NamibiaIRSJurisdiction };
}

/** immutable IRSJurisdiction state */
export type ImmutableIRSJurisdictionState = IRSJurisdictionState &
  SeamlessImmutable.ImmutableObject<IRSJurisdictionState>;

/** initial IRSJurisdiction state */
const initialState: ImmutableIRSJurisdictionState = SeamlessImmutable({
  IRSJurisdictionsById: {},
});

/** the IRSJurisdiction reducer function */
export default function reducer(
  state = initialState,
  action: IRSJurisdictionActionTypes
): ImmutableIRSJurisdictionState {
  switch (action.type) {
    case IRS_JURISDICTIONS_FETCHED:
      if (action.IRSJurisdictionsById) {
        return SeamlessImmutable({
          ...state,
          IRSJurisdictionsById: { ...state.IRSJurisdictionsById, ...action.IRSJurisdictionsById },
        });
      }
      return state;
    case ADD_IRS_JURISDICTION:
      if (action.obj as IRSJurisdiction) {
        return SeamlessImmutable({
          ...state,
          IRSJurisdictionsById: {
            ...state.IRSJurisdictionsById,
            [action.obj.id as string]: action.obj,
          },
        });
      }
      return state;
    case REMOVE_IRS_JURISDICTIONS:
      return SeamlessImmutable({
        ...state,
        IRSJurisdictionsById: action.IRSJurisdictionsById,
      });
    default:
      return state;
  }
}

// selectors

/** get IRSJurisdictions by id
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 * @param {string} parentId - the parent id
 * @returns {{ [key: string]: IRSJurisdiction }} IRSJurisdictions by id
 */
export function getIRSJurisdictionsById(
  state: Partial<Store>,
  planId: string | null = null,
  parentId: string | null = null
): { [key: string]: IRSJurisdiction } {
  return keyBy(getIRSJurisdictionsArray(state, planId, parentId), 'id');
}

/** get one IRSJurisdiction using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} id - the IRSJurisdiction id
 * @returns {IRSJurisdiction|null} a IRSJurisdiction object or null
 */
export function getIRSJurisdictionById(
  state: Partial<Store>,
  id: string
): NamibiaIRSJurisdiction | null {
  return get((state as any)[reducerName].IRSJurisdictionsById, id) || null;
}

/** get an array of IRSJurisdiction objects
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 * @param {string} parentId - the parent id
 * @returns {IRSJurisdiction[]} an array of IRSJurisdiction objects
 */
export function getIRSJurisdictionsArray(
  state: Partial<Store>,
  planId: string | null = null,
  parentId: string | null = null
): IRSJurisdiction[] {
  let result = values((state as any)[reducerName].IRSJurisdictionsById);
  if (planId) {
    result = result.filter((e: IRSJurisdiction) => e.plan_id === planId);
  }
  if (parentId) {
    return result.filter((e: IRSJurisdiction) => e.jurisdiction_parent_id === parentId);
  }
  return result;
}
