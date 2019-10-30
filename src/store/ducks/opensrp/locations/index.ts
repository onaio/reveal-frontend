import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { FlexObject } from '../../../../helpers/utils';

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

/** interface for fetchLocations action creator */
interface FetchLocations extends AnyAction {
  type: typeof FETCH_LOCATIONS;
  locationsById: { [key: string]: Location };
}

/** interface for remove Locations action */
interface RemoveLocations extends AnyAction {
  type: typeof REMOVE_LOCATIONS;
  locationsById: {};
}

/** location action types */
export type LocationsActionTypes = FetchLocations | RemoveLocations | AnyAction;

/** interface to describe location state */
interface LocationsState {
  locationsById: { [key: string]: Location };
}

/** immutable Location state */
export type ImmutableLocationsState = LocationsState &
  SeamlessImmutable.ImmutableObject<LocationsState>;

/** initial state */
const initialState: ImmutableLocationsState = SeamlessImmutable({
  locationsById: {},
});

// reducer

/** Locations reducer function */
export default function reducer(
  state = initialState,
  action: LocationsActionTypes
): ImmutableLocationsState {
  switch (action.type) {
    case FETCH_LOCATIONS:
      return SeamlessImmutable({
        ...state,
        locationsById: {
          ...state.locationsById,
          ...action.locationsById,
        },
      });
    case REMOVE_LOCATIONS:
      return SeamlessImmutable({
        ...state,
        locationsById: action.locationsById,
      });
    default:
      return state;
  }
}

// action creators

/** creates actions that add fetched locations to store
 */
export const fetchLocations = (locations: Location[]): FetchLocations => {
  return {
    locationsById: keyBy<Location>(locations, location => location.identifier),
    type: FETCH_LOCATIONS,
  };
};

// actions

/** interface for remove Locations action */
export const removeLocations = {
  locationsById: {},
  type: REMOVE_LOCATIONS,
};

// selectors

/**
 * searches the store for a human friendly name for the location
 * whose id matches the argument locationId
 *
 * @param {Partial<Store>} state - the redux store
 * @param {string} locationId - a location id
 *
 * @return {string | null} -  Human friendly location name ;
 *  returns null if the associated name was not found
 */
export function getLocationNameFromId(state: Partial<Store>, locationId: string): string | null {
  const location: Location | undefined = get(
    (state as any)[reducerName].locationsById,
    locationId,
    undefined
  );
  const locationName = location ? location.name : null;
  return locationName;
}

/** takes  a list of location ids and returns an object
 * where the location id is the key and the human friendly name
 * of the respective location is the value
 *
 * @param {Partial<Store>} state - the redux store
 * @param {string []} locationIds - an array of locations
 *
 */
export function getLocationNamesByIds(
  state: Partial<Store>,
  locationIds: string[]
): FlexObject<string | null> {
  const lookup: FlexObject<string | null> = {};
  locationIds.forEach(id => (lookup[id] = getLocationNameFromId(state, id)));
  return lookup;
}

/** Returns an array of all locations objects
 *
 * @param {Partial<Store>} - the store
 *
 * @return {Location []}
 */
export function getLocationsArray(state: Partial<Store>): Location[] {
  return values((state as any)[reducerName].locationsById);
}
