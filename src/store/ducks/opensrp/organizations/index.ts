/** Organizations redux module */
import { Dictionary } from '@onaio/utils';
import intersect from 'fast_array_intersect';
import { keyBy, values } from 'lodash';
import { Store } from 'redux';
import { AnyAction } from 'redux';
import { createSelector } from 'reselect';
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
interface FetchOrganizationsAction extends AnyAction {
  overwrite: boolean;
  organizationsByIdentifier: { [key: string]: Organization };
  type: typeof ORGANIZATIONS_FETCHED;
}

/** interface for action that removes organizations from store */
interface RemoveOrganizationsAction extends AnyAction {
  organizationsByIdentifier: { [key: string]: Organization };
  type: typeof REMOVE_ORGANIZATIONS;
}

/** interface for Organizations state in store */
interface OrgsStoreState {
  organizationsByIdentifier: { [key: string]: Organization } | {};
}

/** initial state for Organizations records in store */
const initialOrgsStoreState: ImmutableOrgsStoreState = SeamlessImmutable({
  organizationsByIdentifier: {},
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
        ? { ...action.organizationsByIdentifier } // this repopulates the store with newly fetched data
        : { ...state.organizationsByIdentifier, ...action.organizationsByIdentifier }; // this adds fetched data to existing store data

      return SeamlessImmutable({
        ...state,
        organizationsByIdentifier: organizationsToPut,
      });
    case REMOVE_ORGANIZATIONS:
      return SeamlessImmutable({
        ...state,
        organizationsByIdentifier: action.organizationsByIdentifier,
      });
    default:
      return state;
  }
}

// actions

/** action to remove organizations form store */
export const removeOrganizationsAction: RemoveOrganizationsAction = {
  organizationsByIdentifier: {},
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
    organizationsByIdentifier: keyBy(organizationsList, organization => organization.identifier),
    overwrite,
    type: ORGANIZATIONS_FETCHED,
  };
};

// selectors

/** filter params for organization selectors */
interface OrganizationFilters {
  identifiers?: string[] /** array of UUID to get their corresponding organizations */;
  name?: string /** filter out organization that do not include name in their names */;
}

/**
 * Gets identifiers from OrganizationFilters
 * @param state - the redux store
 * @param props - the organization filters object
 */
export const getIdentifiers = (_: Partial<Store>, props: OrganizationFilters) => props.identifiers;

/**
 * Gets name from OrganizationFilters
 * @param state - the redux store
 * @param props - the organization filters object
 */
export const getName = (_: Partial<Store>, props: OrganizationFilters) => props.name;

/** get organizations as an object where their ids are the keys and the objects
 * the values
 * @param {Partial<Store>} state - Portion of the store
 *
 * @return Dictionary<Organization>
 */
export function getOrganizationsById(state: Partial<Store>): Dictionary<Organization> {
  return (state as any)[reducerName].organizationsByIdentifier;
}

/** Get all organizations as an array
 * @param {Partial<Store>} state - Part of the redux store
 *
 * @return {Organization []} - all organizations in store as an array
 */
export function getOrganizationsArray(state: Partial<Store>): Organization[] {
  return values(getOrganizationsById(state));
}

// MEMOIZED SELECTORS

/**
 * Gets all organizations whose identifiers appear in identifiers filter prop value
 * @param state - the redux store
 * @param props - the organization filters object
 */
export const getOrganizationsByIds = () =>
  createSelector(
    getOrganizationsById,
    getIdentifiers,
    getOrganizationsArray,
    (orgsById, identifiers, orgsArray) => {
      if (identifiers === undefined) {
        return orgsArray;
      }
      if (identifiers.length > 0) {
        return identifiers.map(id => orgsById[id]);
      }
      return [];
    }
  );

/**
 * Gets all organizations whose name includes phrase given in name filter prop
 * @param state - the redux store
 * @param props - the organization filters object
 */
export const getOrganizationsByName = () =>
  createSelector(getOrganizationsArray, getName, (orgsArray, name) =>
    name ? orgsArray.filter(org => org.name.toLowerCase().includes(name.toLowerCase())) : orgsArray
  );

/** organization array selector factory
 * aggregates response from all applied filters and returns results
 * @param state - the redux store
 * @param props - the organization filters object
 */
export const makeOrgsArraySelector = () =>
  createSelector(getOrganizationsByIds(), getOrganizationsByName(), (orgs1, orgs2) => {
    return intersect([orgs1, orgs2], JSON.stringify);
  });
