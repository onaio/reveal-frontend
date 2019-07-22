import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { authenticateUser } from '@onaio/session-reducer';
import store from '../../../store';
import { getDefaultHeaders, OpenSRPService } from '../index';
import { OpenSRPAPIResponse } from './fixtures/session';

jest.mock('../../../configs/env');

describe('services/OpenSRP', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('getDefaultHeaders works', async () => {
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    await store.dispatch(authenticateUser(authenticated, user, extraData));
    expect(getDefaultHeaders()).toEqual({
      accept: 'application/json',
      authorization: 'Token hunter2',
      'content-type': 'application/json',
    });
  });

  it('OpenSRPService constructor works', async () => {
    const planService = new OpenSRPService('plans');
    expect(planService.baseURL).toEqual('https://test.smartregister.org/opensrp/rest/');
    expect(planService.endpoint).toEqual('plans');
    expect(planService.generalURL).toEqual('https://test.smartregister.org/opensrp/rest/plans');
  });
});
