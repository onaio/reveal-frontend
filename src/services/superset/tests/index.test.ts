import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import fetchMock from 'fetch-mock';
import { OPENSRP_OAUTH_STATE, SUPERSET_API_BASE } from '../../../configs/env';
import { ERROR_PERMISSION_DENIED } from '../../../configs/lang';
import * as helperErrors from '../../../helpers/errors';
import supersetFetch, { fetchCallback } from '../../../services/superset';
import store from '../../../store';
import supersetReducer, {
  authorizeSuperset,
  isAuthorized,
  reducerName as supersetReducerName,
  resetSuperset,
} from '../../../store/ducks/superset';
import * as fixtures from './fixtures';

reducerRegistry.register(supersetReducerName, supersetReducer);

jest.mock('../../../configs/env', () => ({
  CHECK_SESSION_EXPIRY_STATUS: false,
  OPENSRP_OAUTH_STATE: 'opensrp',
  SUPERSET_API_BASE: 'http://localhost',
  SUPERSET_API_ENDPOINT: 'slice',
}));

describe('services/superset', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.restore();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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

    await supersetFetch('1337');
    expect(displayErrorMock).toHaveBeenLastCalledWith(new Error(ERROR_PERMISSION_DENIED));
  });

  it('does not process superset data if no data is found', async () => {
    const processDataMock = jest.spyOn(superset, 'processData');
    fetchMock.get(
      `${SUPERSET_API_BASE}oauth-authorized/${OPENSRP_OAUTH_STATE}`,
      JSON.stringify({})
    );
    fetchMock.get(
      `${SUPERSET_API_BASE}superset/slice_json/1337`,
      JSON.stringify(fixtures.noDataResponse)
    );

    await supersetFetch('1337');

    expect(processDataMock).not.toHaveBeenCalled();
  });

  it('does process superset data if data is found', async () => {
    const processDataMock = jest.spyOn(superset, 'processData');
    fetchMock.get(
      `${SUPERSET_API_BASE}oauth-authorized/${OPENSRP_OAUTH_STATE}`,
      JSON.stringify({})
    );
    fetchMock.get(
      `${SUPERSET_API_BASE}superset/slice_json/1337`,
      JSON.stringify(fixtures.sliceResponse)
    );

    await supersetFetch('1337');

    expect(processDataMock).toHaveBeenCalledWith(fixtures.sliceResponse);
  });
});

describe('services/superset/fetchCallback', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('returns empty list if no data is found', () => {
    expect(fetchCallback(fixtures.noDataResponse)).toEqual([]);
  });

  it('returns a list if data is found', () => {
    expect(fetchCallback(fixtures.sliceResponse)).toEqual(fixtures.sliceResponse.data.records);
  });
});
