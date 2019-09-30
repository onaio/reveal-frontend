/** practitioners ducks modules: actions, actionCreators, reducer and selectors */

import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** The reducer name */
export const reducerName = 'practitioners';

/** Interface for practitioner json object */
export interface Practitioner {
  active: true;
  identifier: string;
  name: string;
  userId: string;
  username: string;
}

// actions

/** action type for fetching practitioners */
export const PRACTITIONERS_FETCHED = 'opensrp/reducer/practitioners/PRACTITIONERS_FETCHED';
/** action type for removing practitioners */
export const REMOVE_PRACTITIONERS = 'opensrp/reducer/practitioners/REMOVE_PRACTITIONERS';

/** interface action to add practitioners to store */
export interface FetchPractitionersAction extends AnyAction {
  practitionersById: { [key: string]: Practitioner };
  type: typeof PRACTITIONERS_FETCHED;
}

/** Interface for removePractitionersAction */
interface RemovePractitionersAction extends AnyAction {
  practitionersById: {};
  type: typeof REMOVE_PRACTITIONERS;
}

/** Create type for practitioners reducer actions */
export type PractitionersActionTypes =
  | FetchPractitionersAction
  | RemovePractitionersAction
  | AnyAction;

// action Creators

/** Fetch practitioners action creator
 * @param {Practitioner []} practitionersList - practitioners array to add to store
 * @return {FetchPractitionersAction} - an action to add practitioners to redux store
 */
export const fetchPractitioners = (
  practitionersList: Practitioner[] = []
): FetchPractitionersAction => ({
  practitionersById: keyBy(
    practitionersList,
    (practitioner: Practitioner) => practitioner.identifier
  ),
  type: PRACTITIONERS_FETCHED,
});

// actions

/** removePractitionersAction action */
export const removePractitionersAction = {
  practitionersById: {},
  type: REMOVE_PRACTITIONERS,
};

// The reducer

/** interface for practitioners state in redux store */
interface PractitionerState {
  practitionersById: { [key: string]: Practitioner };
}

/** Create an immutable practitioners state */
export type ImmutablePractitionersState = PractitionerState &
  SeamlessImmutable.ImmutableObject<PractitionerState>;

/** initial practitioners-state state */
export const initialState: ImmutablePractitionersState = SeamlessImmutable({
  practitionersById: {},
});

/** the practitioners reducer function */
export default function reducer(
  state: ImmutablePractitionersState = initialState,
  action: PractitionersActionTypes
): ImmutablePractitionersState {
  switch (action.type) {
    case PRACTITIONERS_FETCHED:
      return SeamlessImmutable({
        ...state,
        practitionersById: { ...state.practitionersById, ...action.practitionersById },
      });
    case REMOVE_PRACTITIONERS:
      return SeamlessImmutable({
        ...state,
        practitionersById: action.practitionersById,
      });
    default:
      return state;
  }
}

// Selectors

/** returns all practitioners in the store as values whose keys are their respective ids
 * @param {Partial<Store>} state - the redux store
 * @return { { [key: string] : Practitioner} } - practitioners object as values, respective ids as keys
 */
export function getPractitionersById(state: Partial<Store>): { [key: string]: Practitioner } {
  return (state as any)[reducerName].practitionersById;
}

/** gets practitioners as an array of practitioners objects
 * @param {Partial<Store>} state - the redux store
 * @return {Practitioner[]} - an array of practitioners objs
 */
export function getPractitionersArray(state: Partial<Store>): Practitioner[] {
  return values(getPractitionersById(state));
}

/** get a specific practitioner by their id
 * @param {Partial<Store>} state - the redux store
 * @return {Practitioner | null} a practitioner obj if the id is found else null
 */
export function getPractitionerById(state: Partial<Store>, id: string): Practitioner | null {
  return get(getPractitionersById(state), id) || null;
}
