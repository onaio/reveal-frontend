import reducerRegistry from '@onaio/redux-reducer-registry';
import { cloneDeep, keyBy } from 'lodash';
import { FlushThunks, Reducer, Selector } from 'redux-testkit';
import store from '../../../../index';
import reducer, {
  fetchLocations,
  getLocationNameFromId,
  getLocationNamesByIds,
  getLocationsArray,
  Location,
  reducerName,
  removeLocations,
} from '../index';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

const generateKeyBy = <T>(anArray: T[], key: string) =>
  keyBy(anArray, anItem => (anItem as any)[key]);

describe('src/store/opensrp/Location.integrationTests', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeLocations);
  });

  it('should have initial state', () => {
    expect(getLocationNameFromId(store.getState(), 'someId')).toEqual(null);
    expect(getLocationNamesByIds(store.getState(), ['someId', 'otherId'])).toEqual({
      otherId: null,
      someId: null,
    });
    expect(getLocationsArray(store.getState())).toEqual([]);
  });

  it('should fetch Locations correctly', () => {
    store.dispatch(fetchLocations(fixtures.sampleLocations as Location[]));
    expect(getLocationNameFromId(store.getState(), 'f45b9380-c970-4dd1-8533-9e95ab12f128')).toEqual(
      'Namibia'
    );
    expect(
      getLocationNamesByIds(store.getState(), ['f45b9380-c970-4dd1-8533-9e95ab12f128', '3951'])
    ).toEqual({ 'f45b9380-c970-4dd1-8533-9e95ab12f128': 'Namibia', '3951': 'Akros_1' });
    expect(getLocationsArray(store.getState()).length).toEqual(2);
  });

  it('can remove Locations', () => {
    store.dispatch(removeLocations);
    let LocationCount = getLocationsArray(store.getState()).length;
    expect(LocationCount).toEqual(0);

    store.dispatch(fetchLocations(fixtures.sampleLocations as Location[]));
    LocationCount = getLocationsArray(store.getState()).length;
    expect(LocationCount).toEqual(2);

    store.dispatch(removeLocations);
    LocationCount = getLocationsArray(store.getState()).length;
    expect(LocationCount).toEqual(0);
  });
});

describe('src/store/opensrp/Locations.selectors', () => {
  // selectors work fine on empty state
  it('selectors work correctly on empty state', () => {
    const currentState = {
      [reducerName]: { locationsById: {} },
    };
    Selector(getLocationsArray)
      .expect(currentState)
      .toReturn([]);
    Selector(getLocationNameFromId)
      .expect(currentState, 'someId')
      .toReturn(null);
    Selector(getLocationNamesByIds)
      .expect(currentState, ['someId', 'anotherId'])
      .toReturn({ someId: null, anotherId: null });
  });

  // selectors work fine on non-empty state
  it('selectors work correctly on non-empty state', () => {
    const currentState = {
      [reducerName]: {
        locationsById: generateKeyBy<Location>(
          fixtures.sampleLocations as Location[],
          'identifier'
        ),
      },
    };

    Selector(getLocationNameFromId)
      .expect(currentState, 'someId')
      .toReturn(null);
    Selector(getLocationNamesByIds)
      .expect(currentState, ['someId', 'anotherId'])
      .toReturn({ someId: null, anotherId: null });

    Selector(getLocationsArray)
      .expect(currentState)
      .toReturn([fixtures.location2, fixtures.location1]);
    Selector(getLocationNameFromId)
      .expect(currentState, '3951')
      .toReturn('Akros_1');
    Selector(getLocationNamesByIds)
      .expect(currentState, ['3951', 'f45b9380-c970-4dd1-8533-9e95ab12f128'])
      .toReturn({ 3951: 'Akros_1', 'f45b9380-c970-4dd1-8533-9e95ab12f128': 'Namibia' });
  });
});

describe('src/store/opensrp/Locations.reducer.edgeCases', () => {
  // should return correct state for unknown action types
  it('reducer returns a valid state for unknown action types', () => {
    const currentState = {
      locationsById: {},
    };

    const action = {
      locationsById: generateKeyBy<Location>(fixtures.sampleLocations as Location[], 'identifier'),
      type: 'SOMETHING_OUT_OF_A_MOVIE',
    };
    const expectedState = cloneDeep(currentState);
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });
});

describe('src/store/opensrp/Locations.reducer.fetchGeometryLessLocations', () => {
  // should handle dispatch on initialState
  // should handle dispatch on existing state
  it('fetchGeometryLessLocations works correctly on initial state', () => {
    const currentState = {
      locationsById: {},
    };
    const action = fetchLocations(fixtures.sampleLocations as Location[]);
    const expectedState = {
      locationsById: generateKeyBy<Location>(fixtures.sampleLocations as Location[], 'identifier'),
    };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });

  it('fetchGeometryLessLocations works correctly on current state', () => {
    const currentState = {
      locationsById: generateKeyBy<Location>([fixtures.location1] as Location[], 'identifier'),
    };
    const action = fetchLocations([fixtures.location2] as Location[]);
    const expectedState = {
      locationsById: generateKeyBy<Location>(fixtures.sampleLocations as Location[], 'identifier'),
    };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });
});

describe('src/store/opensrp/Locations.reducer.removeGeometryLessLocations', () => {
  // should handle dispatch on initialState
  // should handle dispatch on existing state
  it('fetchGeometryLessLocations works correctly on initial state', () => {
    const currentState = {
      locationsById: {},
    };
    const action = removeLocations;
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(currentState);
  });

  it('fetchGeometryLessLocations works correctly on current state', () => {
    const currentState = {
      locationsById: generateKeyBy<Location>([fixtures.location1] as Location[], 'identifier'),
    };
    const action = removeLocations;
    const expectedState = {
      locationsById: {},
    };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });
});
