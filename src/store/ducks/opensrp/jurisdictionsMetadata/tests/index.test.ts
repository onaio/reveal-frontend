import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import reducer, { fetchJurisdictionsMetadata, getJurisdictionsMetadata, reducerName } from '..';

import store from '../../../../index';
import * as fixtures from '../../../tests/fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/jurisdictionsMetadata', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getJurisdictionsMetadata(store.getState())).toEqual([]);
  });

  it('should fetch jurisdictions metadata settings', () => {
    store.dispatch(fetchJurisdictionsMetadata(fixtures.jurisdictionsMetadataArray));
    const metadata = getJurisdictionsMetadata(store.getState());
    expect(metadata.length).toBe(2);
    expect(getJurisdictionsMetadata(store.getState())).toEqual(fixtures.jurisdictionsMetadataArray);
  });
});
