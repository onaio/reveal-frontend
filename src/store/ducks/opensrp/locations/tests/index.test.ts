import reducerRegistry from '@onaio/redux-reducer-registry';
import { LocationState } from 'history';
import { cloneDeep } from 'lodash';
import { FlushThunks, Reducer, Selector } from 'redux-testkit';
import store from '../../../../index';
import reducer, {
  fetchLocations,
  getLocationsByPlanId,
  Location,
  LocationsState,
  reducerName,
  removeAllPlansLocations,
  removeLocations,
} from '../index';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('src/store/opensrp/Location.integrationTests', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeAllPlansLocations);
  });

  it('should have initial state', () => {
    expect(getLocationsByPlanId(store.getState(), 'someId')).toEqual([]);
  });

  it('should fetch Locations correctly', () => {
    store.dispatch(fetchLocations(fixtures.sampleLocations as Location[], 'planId'));
    expect(getLocationsByPlanId(store.getState(), 'planId')).toEqual(fixtures.sampleLocations);
  });

  it('can remove Locations', () => {
    store.dispatch(removeLocations('planId'));
    let LocationCount = getLocationsByPlanId(store.getState(), 'planId').length;
    expect(LocationCount).toEqual(0);

    store.dispatch(fetchLocations(fixtures.sampleLocations as Location[], 'planId'));
    LocationCount = getLocationsByPlanId(store.getState(), 'planId').length;
    expect(LocationCount).toEqual(2);

    store.dispatch(removeLocations('planId'));
    LocationCount = getLocationsByPlanId(store.getState(), 'planId').length;
    expect(LocationCount).toEqual(0);
  });
});

describe('src/store/opensrp/Locations.selectors', () => {
  // selectors work fine on empty state
  it('selectors work correctly on empty state', () => {
    const currentState = {
      [reducerName]: { locationsById: {} },
    };
    Selector(getLocationsByPlanId)
      .expect(currentState)
      .toReturn([]);
  });

  // selectors work fine on non-empty state
  it('selectors work correctly on non-empty state', () => {
    const currentState = {
      [reducerName]: {
        locationsByPlanId: {
          planId: fixtures.sampleLocations,
        },
      },
    };

    Selector(getLocationsByPlanId)
      .expect(currentState, 'planId')
      .toReturn(fixtures.sampleLocations);
  });
});

describe('src/store/opensrp/Locations.reducer.edgeCases', () => {
  // should return correct state for unknown action types
  it('reducer returns a valid state for unknown action types', () => {
    const currentState: LocationsState = {
      locationsByPlanId: {},
    };

    const action = {
      locationsByPlanId: {
        planId: fixtures.sampleLocations,
      },
      planId: `planId`,
      type: 'SOMETHING_OUT_OF_A_MOVIE',
    };
    const expectedState = cloneDeep(currentState);
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });
});

describe('src/store/opensrp/Locations.reducer.fetchLocationsAction', () => {
  // should handle dispatch on initialState
  // should handle dispatch on existing state
  it('fetchLocations works correctly on initial state', () => {
    const currentState: LocationsState = {
      locationsByPlanId: {},
    };
    const action = fetchLocations(fixtures.sampleLocations as Location[], 'planId');
    const expectedState = {
      locationsByPlanId: {
        planId: fixtures.sampleLocations,
      },
    };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });

  it('fetchLocations works correctly on current state', () => {
    const currentState = {
      locationsByPlanId: {
        planId: fixtures.sampleLocations,
      },
    };
    const action = fetchLocations([fixtures.location2] as Location[], 'otherPlanId');
    const expectedState = {
      locationsByPlanId: {
        otherPlanId: [fixtures.location2],
        planId: fixtures.sampleLocations,
      },
    };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });

  it('fetchLocations works correctly for the same planId', () => {
    // will overwrite existing location for any given plan.
    const currentState = {
      locationsByPlanId: {
        planId: fixtures.sampleLocations,
      },
    };
    const action = fetchLocations([fixtures.location2] as Location[], 'planId');
    const expectedState = {
      locationsByPlanId: {
        planId: [fixtures.location2],
      },
    };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });
  // fetchLocations for the same planId
});

describe('src/store/opensrp/Locations.reducer.removeLocations', () => {
  // should handle dispatch on initialState
  // should handle dispatch on existing state
  it('removeLocations works correctly on initial state', () => {
    const currentState: LocationState = {
      locationsByPlanId: {},
    };
    const action = removeLocations('planId');
    const expectedState: LocationsState = {
      locationsByPlanId: {
        planId: [],
      },
    };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });

  it('fetchGeometryLessLocations works correctly on current state', () => {
    const currentState = {
      locationsByPlanId: {
        planId: fixtures.sampleLocations,
      },
    };
    const action = removeLocations('planId');
    const expectedState = {
      locationsByPlanId: {
        planId: [],
      },
    };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });

  it('fetchGeometryLessLocations works correctly on current state', () => {
    const currentState = {
      locationsByPlanId: {
        otherPlanId: fixtures.allLocations,
        planId: fixtures.sampleLocations,
      },
    };
    const action = removeAllPlansLocations;
    const expectedState = {
      locationsByPlanId: {},
    };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });
});
