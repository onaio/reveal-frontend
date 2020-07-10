import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  fetchJurisdictions,
  getJurisdictionById,
  getJurisdictionsArray,
  getJurisdictionsFC,
  reducerName,
  removeJurisdictions,
} from '..';
import {
  raKashikishiHAHC,
  raKsh2,
  raKsh3,
} from '../../../../../components/TreeWalker/tests/fixtures';
import store from '../../../../index';

reducerRegistry.register(reducerName, reducer);

const arraySelector = getJurisdictionsArray();
const jurisdictionSelector = getJurisdictionById();
const fcSelector = getJurisdictionsFC();
const data = [raKashikishiHAHC, raKsh2, raKsh3];

describe('reducers/opensrp/hierarchies', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeJurisdictions());
  });

  it('should have initial state', () => {
    expect(arraySelector(store.getState(), {})).toEqual([]);
  });

  it('should be able to store and retrieve jurisdictions', () => {
    store.dispatch(fetchJurisdictions(data));
    expect(arraySelector(store.getState(), {})).toEqual(data);
    expect(jurisdictionSelector(store.getState(), { jurisdictionId: raKsh2.id })).toEqual(raKsh2);
    expect(arraySelector(store.getState(), { parentId: raKashikishiHAHC.id })).toEqual([
      raKsh2,
      raKsh3,
    ]);
    expect(
      arraySelector(store.getState(), { jurisdictionIdsArray: [raKashikishiHAHC.id, raKsh3.id] })
    ).toEqual([raKashikishiHAHC, raKsh3]);
    expect(fcSelector(store.getState(), { parentId: raKashikishiHAHC.id })).toEqual({
      features: [raKsh2, raKsh3],
      type: 'FeatureCollection',
    });
    expect(fcSelector(store.getState(), { jurisdictionIdsArray: [raKsh3.id] })).toEqual({
      features: [raKsh3],
      type: 'FeatureCollection',
    });
  });
});
