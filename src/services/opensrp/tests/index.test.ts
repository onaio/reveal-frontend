import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { authenticateUser } from '@onaio/session-reducer';
import store from '../../../store';
import { getDefaultHeaders } from '../index';
import { OpenSRPAPIResponse } from './fixtures/session';

describe('services/OpenSRP', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('getDefaultHeaders works', async () => {
    // call action to log in
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    await store.dispatch(authenticateUser(authenticated, user, extraData));
    expect(getDefaultHeaders()).toEqual({
      accept: 'application/json',
      authorization: 'Token hunter2',
      'content-type': 'application/json',
    });
  });
});
