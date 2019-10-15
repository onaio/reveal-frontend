/** practitioners ducks modules: actions, actionCreators, reducer and selectors */
import { get, keyBy, keys, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** The reducer name */
export const reducerName = 'practitioner';

/** Interface for practitioner json object */
export interface Practitioner {
  active: boolean;
  identifier: string;
  name: string;
  userId: string;
  username: string;
}

/** interface of practitionerRole - relation: practitioners belonging to which organization */
export interface PractitionerRole {
  [organizationId: string]: { [practitionerId: string]: Practitioner };
}

// actions

/** action type for fetching practitioners */
export const PRACTITIONERS_FETCHED = 'opensrp/reducer/practitioners/PRACTITIONERS_FETCHED';
/** action type for removing practitioners */
export const REMOVE_PRACTITIONERS = 'opensrp/reducer/practitioners/REMOVE_PRACTITIONERS';
/** action type for fetching practitionerRoles - information as to what organization a practitioner belongs to */
export const PRACTITIONER_ROLES_FETCHED =
  'opensrp/reducer/practitioners/PRACTITIONER_ROLES_FETCHED';
/** action type for removing practitionerRoles */
export const REMOVE_PRACTITIONER_ROLES = 'opensrp/reducer/practitioners/REMOVE_PRACTITIONER_ROLES';

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

/** interface for actions that add practitionerRoles */
interface FetchPractitionerRolesAction extends AnyAction {
  practitionerRoles: PractitionerRole;
  practitionersById: { [key: string]: Practitioner };
  type: typeof PRACTITIONER_ROLES_FETCHED;
}

/** interface for actions that remove PractitionerRoles */
interface RemovePractitionerRolesAction extends AnyAction {
  practitionerRoles: {};
  type: typeof REMOVE_PRACTITIONER_ROLES;
}

/** Create type for practitioners reducer actions */
export type PractitionersActionTypes =
  | FetchPractitionersAction
  | RemovePractitionersAction
  | FetchPractitionerRolesAction
  | RemovePractitionerRolesAction
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

/** action creator for adding info on organization to practitioners
 * this will modify both the practitionersById as well as the practitionerRoles
 * Use this action creator when pulling data for practitioners belonging to
 * an organization only, otherwise see fetchPractitioners
 *
 * @param {Practitioner []} practitioners - an array of practitioners
 * @param {string}  organizationId - id of organization that the practitioners belong to
 */
export const fetchPractitionerRoles = (
  practitioners: Practitioner[],
  organizationId: string
): FetchPractitionerRolesAction => {
  const practitionersById = keyBy(
    practitioners,
    (practitioner: Practitioner) => practitioner.identifier
  );

  return {
    practitionerRoles: { [organizationId]: practitionersById },
    practitionersById,
    type: PRACTITIONER_ROLES_FETCHED,
  };
};

/** Action to remove all PractitionerRoles from store */
export const removePractitionerRolesAction: RemovePractitionerRolesAction = {
  practitionerRoles: {},
  type: REMOVE_PRACTITIONER_ROLES,
};

// The reducer

/** interface for practitioners state in redux store */
interface PractitionerState {
  practitionersById: { [key: string]: Practitioner };
  practitionerRoles: PractitionerRole;
}

/** Create an immutable practitioners state */
export type ImmutablePractitionersState = PractitionerState &
  SeamlessImmutable.ImmutableObject<PractitionerState>;

/** initial practitioners-state state */
export const initialState: ImmutablePractitionersState = SeamlessImmutable({
  practitionerRoles: {},
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
    case PRACTITIONER_ROLES_FETCHED:
      const organizationId = keys(action.practitionerRoles)[0];
      return SeamlessImmutable({
        ...state,
        practitionerRoles: {
          ...state.practitionerRoles,
          [organizationId]: {
            ...state.practitionerRoles[organizationId],
            ...action.practitionerRoles[organizationId],
          },
        } as PractitionerRole & SeamlessImmutable.ImmutableObject<PractitionerRole>,
        practitionersById: { ...state.practitionersById, ...action.practitionersById },
      });
    case REMOVE_PRACTITIONER_ROLES:
      return SeamlessImmutable({
        ...state,
        practitionerRoles: action.practitionerRoles,
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

/** get practitioners that belong to a certain organization
 * @param {Partial<Store>} state -  the redux store
 * @param {string} organizationId - get practitioners that belong to organization with this id
 *
 * @return {Practitioner[]} - returns a list of practitioners that belong to organization with given id
 */
export function getPractitionersByOrgId(
  state: Partial<Store>,
  organizationId: string
): Practitioner[] {
  let practitionersById = (state as any)[reducerName].practitionerRoles[organizationId];
  practitionersById = practitionersById !== undefined ? practitionersById : {};
  return values(practitionersById);
}
