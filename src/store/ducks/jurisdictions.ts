import { get, keyBy, keys, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { FlexObject } from '../../helpers/utils';

export const reducerName = 'jurisdictions';

/** interface to describe Jurisdiction */
export interface Jurisdiction {
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_parent_id: string;
  geometry: FlexObject;
}

// actions
export const FETCH_JURISDICTION = 'reveal/reducer/jurisdiction/FETCH_JURISDICTION';

/** fetch jurisdiction action */
interface FetchJurisdictionAction extends AnyAction {
  jurisdictionsById: { [key: string]: Jurisdiction };
  type: typeof FETCH_JURISDICTION;
}

/** jurisdiction action types */
export type JurisdictionActionTypes = FetchJurisdictionAction | AnyAction;

/** interface to describe jurisdiction state */
interface JurisdictionState {
  jurisdictionsById: { [key: string]: Jurisdiction };
}

/** initial state */
const initialState: JurisdictionState = {
  jurisdictionsById: {},
};

// reducer
/** jurisdiction reducer function */
export default function reducer(
  state = initialState,
  action: JurisdictionActionTypes
): JurisdictionState {
  switch (action.type) {
    case FETCH_JURISDICTION:
      if (action.jurisdictionsById) {
        return {
          ...state,
          jurisdictionsById: action.jurisdictionsById,
        };
      }
      return state;
    default:
      return state;
  }
}

// action creators
/** fetch Jurisdiction creator
 * @param {Jurisdiction[]} jurisdictionList - array of jurisdiction objects
 * @returns {FetchJurisdictionAction} FetchJurisdictionAction
 */
export const fetchJurisdictions = (jurisdictionList: Jurisdiction[]) => {
  return {
    jurisdictionsById: keyBy(jurisdictionList, jurisdiction => jurisdiction.jurisdiction_id),
    type: FETCH_JURISDICTION,
  };
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
