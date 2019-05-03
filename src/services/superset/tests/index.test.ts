import reducerRegistry from '@onaio/redux-reducer-registry';
import fetchMock from 'fetch-mock';
import supersetFetch from '../../../services/superset';
import store from '../../../store';
import supersetReducer, {
  authorizeSuperset,
  isAuthorized,
  reducerName as supersetReducerName,
  resetSuperset,
} from '../../../store/ducks/superset';
import * as fixtures from './fixtures';

reducerRegistry.register(supersetReducerName, supersetReducer);

describe('services/superset', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.restore();
  });

  it('authZ should not authorize superset when it fails', async () => {
    store.dispatch(resetSuperset()); /** reset to null */

    fetchMock.get('https://discover.ona.io/oauth-authorized/onadata', 500);
    await supersetFetch('1337');
    expect(isAuthorized(store.getState())).toEqual(false);

    store.dispatch(authorizeSuperset(false));

    await supersetFetch('1337');
    expect(isAuthorized(store.getState())).toEqual(false);
  });

  it('authZ should authorize superset when it works', async () => {
    fetchMock.get('https://discover.ona.io/oauth-authorized/onadata', JSON.stringify({}));
    fetchMock.get(
      'https://discover.ona.io/superset/slice_json/1337',
      JSON.stringify(fixtures.sliceResponse)
    );

    store.dispatch(resetSuperset()); /** reset to null */
    await supersetFetch('1337');
    expect(isAuthorized(store.getState())).toEqual(true);

    store.dispatch(authorizeSuperset(false));
    await supersetFetch('1337');
    expect(isAuthorized(store.getState())).toEqual(true);
  });
});
