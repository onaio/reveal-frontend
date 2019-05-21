import reducerRegistry from '@onaio/redux-reducer-registry';

import { keyBy, values } from 'lodash';

import { FlushThunks } from 'redux-testkit';

import store from '../../index';
import reducer, { fetchGeoJSON, GeoJSON, getGeoJSONs, reducerName } from '../geojson';
reducerRegistry.register(reducerName, reducer);
import * as fixtures from './fixtures';

describe('reducers/superset', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getGeoJSONs(store.getState(), '10f9e9fa-ce34-4b27-a961-72fab5206ab6')).toEqual(null);
  });

  it('should fetch geojsons', () => {
    store.dispatch(fetchGeoJSON(fixtures.geojson));
    expect(getGeoJSONs(store.getState(), '10f9e9fa-ce34-4b27-a961-72fab5206ab6')).toEqual(
      fixtures.singleGeoJSON
    );
  });
});
