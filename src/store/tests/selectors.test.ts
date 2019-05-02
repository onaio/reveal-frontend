import { recordResult } from '@onaio/gatekeeper';
import { authenticateUser } from '@onaio/session-reducer';
import { FlushThunks } from 'redux-testkit';
import store from '..';
import { getAccessToken, getApiToken } from '../selectors';

describe('store/selectors', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should be able to get the access token', () => {
    store.dispatch(recordResult(true, 'hunter2'));
    expect(getAccessToken(store.getState())).toEqual('hunter2');
  });

  it('should be able to get the access token', () => {
    store.dispatch(
      authenticateUser(
        true,
        {
          email: 'bob@example.com',
          name: 'Bobbie',
          username: 'RobertBaratheon',
        },
        { api_token: 'iLoveOov' }
      )
    );
    expect(getApiToken(store.getState())).toEqual('iLoveOov');
  });
});
