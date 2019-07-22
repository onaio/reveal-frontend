import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { authenticateUser } from '@onaio/session-reducer';
import store from '../../../store';
import { getDefaultHeaders, getURLParams, OpenSRPService } from '../index';
import { plansListResponse } from './fixtures/plans';
import { OpenSRPAPIResponse } from './fixtures/session';
/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../configs/env');

describe('services/OpenSRP', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks();
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

  it('getURLParams works', async () => {
    expect(getURLParams({})).toEqual('');
    expect(getURLParams({ foo: 'bar', leet: 1337, mosh: 'pitt' })).toEqual(
      'foo=bar&leet=1337&mosh=pitt'
    );
  });

  it('OpenSRPService list method works', async () => {
    fetch.mockResponseOnce(JSON.stringify(plansListResponse));
    const planService = new OpenSRPService('plans');
    const result = await planService.list();
    expect(result).toEqual(plansListResponse);
    expect(fetch.mock.calls).toEqual([
      [
        'https://test.smartregister.org/opensrp/rest/plans',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Token hunter2',
            'content-type': 'application/json',
          },
          method: 'GET',
        },
      ],
    ]);
  });

  it('OpenSRPService list method params work', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const service = new OpenSRPService('location');
    await service.list({ is_jurisdiction: true });
    expect(fetch.mock.calls[0][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/location?is_jurisdiction=true'
    );
  });

  it('OpenSRPService list method should handle http errors', async () => {
    fetch.mockResponseOnce(JSON.stringify({}), { status: 500 });
    const planService = new OpenSRPService('plans');
    let error;
    try {
      await planService.list();
    } catch (e) {
      error = e;
    }
    expect(error).toEqual(new Error('OpenSRPService list failed, HTTP status 500'));
  });

  it('OpenSRPService read method works', async () => {
    fetch.mockResponseOnce(JSON.stringify(plansListResponse[0]));
    const planService = new OpenSRPService('plans');
    const result = await planService.read('0e85c238-39c1-4cea-a926-3d89f0c98427');
    expect(result).toEqual(plansListResponse[0]);
    expect(fetch.mock.calls).toEqual([
      [
        'https://test.smartregister.org/opensrp/rest/plans/0e85c238-39c1-4cea-a926-3d89f0c98427',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Token hunter2',
            'content-type': 'application/json',
          },
          method: 'GET',
        },
      ],
    ]);
  });

  it('OpenSRPService read method params work', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const service = new OpenSRPService('location');
    await service.read('62b2f313', { is_jurisdiction: true });
    expect(fetch.mock.calls[0][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/location/62b2f313?is_jurisdiction=true'
    );
  });

  it('OpenSRPService read method should handle http errors', async () => {
    fetch.mockResponseOnce(JSON.stringify({}), { status: 500 });
    const planService = new OpenSRPService('plans');
    let error;
    try {
      await planService.read('0e85c238-39c1-4cea-a926-3d89f0c98427');
    } catch (e) {
      error = e;
    }
    expect(error).toEqual(new Error('OpenSRPService read failed, HTTP status 500'));
  });
});
