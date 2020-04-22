/** Organizations redux module */
import { get, keyBy, values } from 'lodash';
import { Store } from 'redux';
import { AnyAction } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** The reducer name */
export const reducerName = 'organizations';

/** interface for Organization coding property */
interface OrganizationCoding {
  code: string;
  display: string;
  system: string;
}

/** interface for the type key in an organization Object */
interface OrganizationType {
  coding: OrganizationCoding[];
}

/** interface for a Organization object */
export interface Organization {
  active: boolean;
  id: number;
  identifier: string;
  name: string;
  partOf?: number;
  type?: OrganizationType;
}

// action interfaces

/** action type for action that adds Organizations to store */
export const ORGANIZATIONS_FETCHED = 'src/store/ducks/organizations/reducer/TEAM_FETCHED';
/** action type for REMOVE_TEAMS action */
export const REMOVE_ORGANIZATIONS = 'src/store/ducks/organizations/reducer/REMOVE_TEAMS';

/** interface for organizations fetched action */
export interface FetchOrganizationsAction extends AnyAction {
  overwrite: boolean;
  organizationsById: { [key: string]: Organization };
  type: typeof ORGANIZATIONS_FETCHED;
}

/** interface for action that removes organizations from store */
export interface RemoveOrganizationsAction extends AnyAction {
  organizationsById: { [key: string]: Organization };
  type: typeof REMOVE_ORGANIZATIONS;
}

/** interface for Organizations state in store */
interface OrgsStoreState {
  organizationsById: { [key: string]: Organization } | {};
}

/** initial state for Organizations records in store */
const initialOrgsStoreState: ImmutableOrgsStoreState = SeamlessImmutable({
  organizationsById: {},
});

/** single type for all action types */
type OrganizationActionTypes = FetchOrganizationsAction | RemoveOrganizationsAction | AnyAction;

// immutable organization state in dux
export type ImmutableOrgsStoreState = OrgsStoreState &
  SeamlessImmutable.ImmutableObject<OrgsStoreState>;

/** the Organization reducer function */
export default function reducer(state = initialOrgsStoreState, action: OrganizationActionTypes) {
  switch (action.type) {
    case ORGANIZATIONS_FETCHED:
      const organizationsToPut = action.overwrite
        ? { ...action.organizationsById } // this repopulates the store with newly fetched data
        : { ...state.organizationsById, ...action.organizationsById }; // this adds fetched data to existing store data

      return SeamlessImmutable({
        ...state,
        organizationsById: organizationsToPut,
      });
    case REMOVE_ORGANIZATIONS:
      return SeamlessImmutable({
        ...state,
        organizationsById: action.organizationsById,
      });
    default:
      return state;
  }
}

// actions

/** action to remove organizations form store */
export const removeOrganizationsAction: RemoveOrganizationsAction = {
  organizationsById: {},
  type: REMOVE_ORGANIZATIONS,
};

// action creators

/** creates action to add fetched organizations to store
 * @param {Organization []} organizationsList - array of organizations to be added to store
 * @param {boolean} overwrite - whether to replace organization records in state
 *
 * @returns {FetchOrganizationsAction} - action with organizations payload that is added to store
 */
export const fetchOrganizations = (
  organizationsList: Organization[],
  overwrite: boolean = false
): FetchOrganizationsAction => {
  return {
    organizationsById: keyBy(organizationsList, organization => organization.identifier),
    overwrite,
    type: ORGANIZATIONS_FETCHED,
  };
};

// selectors

/** get organizations as an object where their ids are the keys and the objects
 * the values
 * @param {Partial<Store>} state - Portion of the store
 *
 * @return {[key: string]: Organization}
 */
export function getOrganizationsById(state: Partial<Store>): { [key: string]: Organization } {
  return (state as any)[reducerName].organizationsById;
}

/** Get single Organization by the given id
 * @param {Partial<Store>} state - Part of the redux store
 * @param {string} organizationId - filters organization data to be returned based on this id
 *
 * @return {Organization | null} - A organization object if found else null
 */
export function getOrganizationById(
  state: Partial<Store>,
  organizationId: string
): Organization | null {
  return get(getOrganizationsById(state), organizationId) || null;
}

/** Get all organizations as an array
 * @param {Partial<Store>} state - Part of the redux store
 *
 * @return {Organization []} - all organizations in store as an array
 */
export function getOrganizationsArray(state: Partial<Store>): Organization[] {
  return values(getOrganizationsById(state));
}
