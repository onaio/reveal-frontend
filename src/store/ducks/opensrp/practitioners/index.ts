/** practitioners ducks modules: actions, actionCreators, reducer and selectors */
import { Dictionary } from '@onaio/utils/dist/types/types';
import intersect from 'fast_array_intersect';
import { keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
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

// actions

/** action type for fetching practitioners */
export const PRACTITIONERS_FETCHED = 'opensrp/reducer/practitioners/PRACTITIONERS_FETCHED';
/** action type for removing practitioners */
export const REMOVE_PRACTITIONERS = 'opensrp/reducer/practitioners/REMOVE_PRACTITIONERS';

/** interface action to add practitioners to store */
export interface FetchPractitionersAction extends AnyAction {
  overwrite: boolean;
  practitionersById: Dictionary<Practitioner>;
  practitionerRoles: Dictionary<string[]>;
  type: typeof PRACTITIONERS_FETCHED;
}

/** Interface for removePractitionersAction */
export interface RemovePractitionersAction extends AnyAction {
  practitionersById: {};
  practitionerRoles: {};
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
 * @param {boolean} overwrite - whether to replace the records in store for practitioners
 * @return {FetchPractitionersAction} - an action to add practitioners to redux store
 */
export const fetchPractitioners = (
  practitionersList: Practitioner[] = [],
  overwrite: boolean = false,
  organizationId?: string
): FetchPractitionersAction => {
  let practitionerIds = [];
  let practitionerRoles = {};
  if (organizationId) {
    practitionerIds = practitionersList.map(practitioner => practitioner.identifier);
    practitionerRoles = { [organizationId]: practitionerIds };
  }
  return {
    overwrite,
    practitionerRoles,
    practitionersById: keyBy(
      practitionersList,
      (practitioner: Practitioner) => practitioner.identifier
    ),
    type: PRACTITIONERS_FETCHED,
  };
};

// actions

/** removePractitionersAction action */
export const removePractitionersAction = {
  practitionerRoles: {},
  practitionersById: {},
  type: REMOVE_PRACTITIONERS,
};

// The reducer

/** interface for practitioners state in redux store */
export interface PractitionerState {
  practitionersById: Dictionary<Practitioner> | {};
  practitionerRoles: Dictionary<string[]> | {};
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
      const practitionersToPut = action.overwrite
        ? { ...action.practitionersById }
        : { ...state.practitionersById, ...action.practitionersById };
      const practitionerRolesToPut = action.overwrite
        ? { ...action.practitionerRoles }
        : { ...state.practitionerRoles, ...action.practitionerRoles };
      return SeamlessImmutable({
        ...state,
        practitionerRoles: practitionerRolesToPut,
        practitionersById: practitionersToPut,
      });
    case REMOVE_PRACTITIONERS:
      return SeamlessImmutable({
        ...state,
        practitionerRoles: action.practitionerRoles,
        practitionersById: action.practitionersById,
      });

    default:
      return state;
  }
}

// Selectors

export interface PractitionerFilters {
  identifiers?: string[] /** get all practitioners whose ids appear in this array */;
  name?: string /** get practitioner whose name includes text in name */;
  organizationId?: string /** get practitioners assigned to this organization */;
}

// NON MEMOIZED SELECTORS

/**
 * Gets identifiers from PractitionerFilters
 * @param {Partial<Store>} state - the redux store
 * @param {PractitionerFilters} props - the practitioner filters object
 */
export const getIdentifiers = (_: Partial<Store>, props: PractitionerFilters) => props.identifiers;
/**
 * Gets name from PractitionerFilters
 * @param {Partial<Store>} state - the redux store
 * @param {PractitionerFilters} props - the practitioner filters object
 */
export const getName = (_: Partial<Store>, props: PractitionerFilters) => props.name;
/**
 * Gets organizationId from PractitionerFilters
 * @param {Partial<Store>} state - the redux store
 * @param {PractitionerFilters} props - the practitioner filters object
 */
export const getOrganizationId = (_: Partial<Store>, props: PractitionerFilters) =>
  props.organizationId;

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

/** practitionerRoles slice of state
 * @param {partial<Store>} state -  the redux store
 */
export const getPractitionerRoles = (state: Partial<Store>): Dictionary<string[]> => {
  return (state as any)[reducerName].practitionerRoles;
};

// MEMOIZED SELECTORS

/**
 * Gets all practitioners whose identifiers appear in ids filter prop value
 * @param {Partial<Store>} state - the redux store
 * @param {PractitionerFilters} props - the practitioners filters object
 */
export const getPractitionersByIds = () =>
  createSelector(
    getPractitionersById,
    getIdentifiers,
    getPractitionersArray,
    (practitionersById, identifiers, practitionersArray) => {
      if (identifiers === undefined) {
        return practitionersArray;
      }
      if (identifiers.length > 0) {
        return identifiers.map(id => practitionersById[id]);
      }
      return [];
    }
  );

/**
 * Gets all practitioners whose name includes phrase given in name filter prop
 * @param {Partial<Store>} state - the redux store
 * @param {PractitionerFilters} props - the practitioners filters object
 */
export const getPractitionersByName = () =>
  createSelector(getPractitionersArray, getName, (practitionersArray, name) =>
    name
      ? practitionersArray.filter(org => org.name.toLowerCase().includes(name.toLowerCase()))
      : practitionersArray
  );

/** get all practitioners that belong to organization with given id
 * @param {Partial<Store>} state - the redux store
 * @param {PractitionerFilters} props - the practitioners filters object
 */
export const getPractitionersByOrgId = () =>
  createSelector(
    getPractitionerRoles,
    getOrganizationId,
    getPractitionersById,
    getPractitionersArray,
    (practitionerRole, organizationId, practitionersById, practitionersArray) => {
      if (organizationId) {
        const practitionerIds: string[] | undefined = practitionerRole[organizationId];
        if (practitionerIds) {
          const practitioners = practitionerIds.map(id => practitionersById[id]);
          return practitioners;
        } else {
          return [];
        }
      }
      return practitionersArray;
    }
  );

/** practitioner array selector factory
 * aggregates response from all applied filters and returns results
 * @param {Partial<Store>} state - the redux store
 * @param {PractitionerFilters} props - the practitioners filters object
 */
export const makePractitionersSelector = () =>
  createSelector(
    getPractitionersByIds(),
    getPractitionersByName(),
    getPractitionersByOrgId(),
    (arr1, arr2, arr3) => {
      return intersect([arr1, arr2, arr3], JSON.stringify);
    }
  );
