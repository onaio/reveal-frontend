import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, {
  fetchJurisdictions,
  getJurisdictionById,
  getJurisdictionsArray,
  getJurisdictionsById,
  getJurisdictionsIdArray,
  Jurisdiction,
  reducerName,
} from '../jurisdictions';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/jurisdictions', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getJurisdictionsById(store.getState())).toEqual({});
    expect(getJurisdictionsIdArray(store.getState())).toEqual([]);
    expect(getJurisdictionsArray(store.getState())).toEqual([]);
    expect(getJurisdictionById(store.getState(), 'someId')).toEqual(null);
  });

  it('should fetch jurisdictions', () => {
    store.dispatch(fetchJurisdictions(fixtures.jurisdictions));
    const expected = keyBy(
      fixtures.jurisdictions,
      (jurisdiction: Jurisdiction) => jurisdiction.jurisdiction_id
    );
    expect(getJurisdictionsById(store.getState())).toEqual(expected);
    expect(getJurisdictionsIdArray(store.getState())).toEqual(fixtures.jurisdictionsIdsArray);
    expect(getJurisdictionsArray(store.getState())).toEqual(values(expected));
    expect(getJurisdictionById(store.getState(), '450fc15b-5bd2-468a-927a-49cb10d3bcac')).toEqual(
      fixtures.jurisdictions[0]
    );
  });
});
