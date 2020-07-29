import reducerRegistry from '@onaio/redux-reducer-registry';
import fetchMock from 'fetch-mock';
import { OPENSRP_OAUTH_STATE, SUPERSET_API_BASE } from '../../../configs/env';
import { ERROR_PERMISSION_DENIED } from '../../../configs/lang';
import * as helperErrors from '../../../helpers/errors';
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

    fetchMock.get(`${SUPERSET_API_BASE}oauth-authorized/${OPENSRP_OAUTH_STATE}`, 500);
    await supersetFetch('1337');
    expect(isAuthorized(store.getState())).toEqual(false);

    store.dispatch(authorizeSuperset(false));

    await supersetFetch('1337');
    expect(isAuthorized(store.getState())).toEqual(false);
  });

  it('authZ should authorize superset when it works', async () => {
    const displayErrorMock = jest.spyOn(helperErrors, 'displayError');
    fetchMock.get(
      `${SUPERSET_API_BASE}oauth-authorized/${OPENSRP_OAUTH_STATE}`,
      JSON.stringify({})
    );
    fetchMock.get(
      `${SUPERSET_API_BASE}superset/slice_json/1337`,
      JSON.stringify(fixtures.sliceResponse)
    );

    store.dispatch(resetSuperset()); /** reset to null */
    await supersetFetch('1337');
    expect(isAuthorized(store.getState())).toEqual(true);

    store.dispatch(authorizeSuperset(false));
    await supersetFetch('1337');
    expect(isAuthorized(store.getState())).toEqual(true);
    expect(displayErrorMock).not.toHaveBeenCalled();
  });

  it('Error message is dispayed if permission denied', async () => {
    const displayErrorMock = jest.spyOn(helperErrors, 'displayError');

    fetchMock.get(
      `${SUPERSET_API_BASE}oauth-authorized/${OPENSRP_OAUTH_STATE}`,
      JSON.stringify({})
    );
    fetchMock.get(
      `${SUPERSET_API_BASE}superset/slice_json/1337`,
      JSON.stringify({
        message: 'Access is Denied',
      })
    );

    store.dispatch(resetSuperset()); /** reset to null */
    await supersetFetch('1337');
    expect(displayErrorMock).toHaveBeenLastCalledWith(new Error(ERROR_PERMISSION_DENIED));
  });
});
