import { Dictionary } from '@onaio/utils';
import { get } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

export const reducerName = 'Locations';

/** interface for fetched locations i.e. the uuid of the location and the
 * human readable name
 */
export interface Location {
  identifier: string;
  name: string;
}

// action types
export const FETCH_LOCATIONS = 'reveal/reducer/opensrp/location/FETCH_LOCATIONS';
export const REMOVE_LOCATIONS = 'reveal/reducer/opensrp/location/REMOVE_LOCATIONS';
export const REMOVE_ALL_PLANS_LOCATIONS =
  'reveal/reducer/opensrp/location/REMOVE_ALL_PLANS_LOCATIONS';

/** interface for fetchLocations action creator */
interface FetchLocationsAction extends AnyAction {
  type: typeof FETCH_LOCATIONS;
  locationsByPlanId: { [key: string]: Location[] };
  planId: string;
}

/** interface for remove Locations action ; removes locations
 * assigned to specific plan
 */
interface RemoveLocationsAction extends AnyAction {
  type: typeof REMOVE_LOCATIONS;
  locationsByPlanId: { [key: string]: [] };
  planId: string;
}

/** describes an action that would remove all locations from the store
 * irregardless of the plan
 */
interface RemoveAllPlansLocations extends AnyAction {
  type: typeof REMOVE_ALL_PLANS_LOCATIONS;
  locationsByPlanId: {};
}

/** location action types */
export type LocationsActionTypes = FetchLocationsAction | RemoveLocationsAction | AnyAction;

/** interface to describe location state */
export interface LocationsState {
  locationsByPlanId: Dictionary<Location[]> | {};
}

/** immutable Location state */
export type ImmutableLocationsState = LocationsState &
  SeamlessImmutable.ImmutableObject<LocationsState>;

/** initial state */
const initialState: ImmutableLocationsState = SeamlessImmutable({
  locationsByPlanId: {},
});

// reducer

/** Locations reducer function */
export default function reducer(
  state = initialState,
  action: LocationsActionTypes
): ImmutableLocationsState {
  switch (action.type) {
    case FETCH_LOCATIONS:
      const fetchLocationsState: LocationsState = {
        ...state,
        locationsByPlanId: {
          ...state.locationsByPlanId,
          [action.planId]: [...action.locationsByPlanId[action.planId]],
        },
      };
      return SeamlessImmutable(fetchLocationsState);
    case REMOVE_LOCATIONS:
      const removeLocationsState: LocationsState = {
        ...state,
        locationsByPlanId: {
          ...state.locationsByPlanId,
          [action.planId]: [...action.locationsByPlanId[action.planId]],
        },
      };
      return SeamlessImmutable(removeLocationsState);
    case REMOVE_ALL_PLANS_LOCATIONS:
      const removeAllPlansLocationsState: LocationsState = {
        ...state,
        locationsByPlanId: action.locationsByPlanId,
      };
      return SeamlessImmutable(removeAllPlansLocationsState);
    default:
      return state;
  }
}

// action creators

/** creates actions that add fetched locations to store
 * @param {Location []} - fetched locations
 * @param {string} planId -  id of plans with the above assigned locations
 */
export const fetchLocations = (locations: Location[], planId: string): FetchLocationsAction => {
  return {
    locationsByPlanId: { [planId]: locations },
    planId,
    type: FETCH_LOCATIONS,
  };
};

/** creates actions that remove locations assigned to a plan from store
 * @param {string} planId -  id of plans with the above assigned locations
 */
export const removeLocations = (planId: string): RemoveLocationsAction => {
  return {
    locationsByPlanId: { [planId]: [] },
    planId,
    type: REMOVE_LOCATIONS,
  };
};

// actions

/** Action to remove all plans regardless of plan */
export const removeAllPlansLocations: RemoveAllPlansLocations = {
  locationsByPlanId: {},
  type: REMOVE_ALL_PLANS_LOCATIONS,
};

// selectors

/** Returns an array of location names given the plan identifier
 *
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the plan's identifier
 *
 * @return {Location[]} - locations that are assigned to plan with identifier planId
 */
export function getLocationsByPlanId(state: Partial<Store>, planId: string): Location[] {
  let locations = get((state as any)[reducerName].locationsByPlanId, planId, undefined);
  locations = locations ? locations : [];
  return locations;
}
