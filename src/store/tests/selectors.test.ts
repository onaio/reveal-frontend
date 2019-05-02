import { authenticateUser, logOutUser } from '@onaio/session-reducer';
import { FlushThunks } from 'redux-testkit';
import store from '..';
import { getAccessToken, getApiToken } from '../selectors';

describe('store/selectors', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(logOutUser());
  });

  it('should be able to get the access token', () => {
    expect(getAccessToken(store.getState())).toEqual(null);
    store.dispatch(
      authenticateUser(
        true,
        {
          email: 'bob@example.com',
          name: 'Bobbie',
          username: 'RobertBaratheon',
        },
        { api_token: 'hunter2', oAuth2Data: { access_token: 'iLoveOov' } }
      )
    );
    expect(getAccessToken(store.getState())).toEqual('iLoveOov');
  });

  it('should be able to get the access token', () => {
    expect(getApiToken(store.getState())).toEqual(null);
    store.dispatch(
      authenticateUser(
        true,
        {
          email: 'bob@example.com',
          name: 'Bobbie',
          username: 'RobertBaratheon',
        },
        { api_token: 'hunter2', oAuth2Data: { access_token: 'iLoveOov' } }
      )
    );
    expect(getApiToken(store.getState())).toEqual('hunter2');
  });
});
