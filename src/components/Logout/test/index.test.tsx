import { logoutFromAuthServer } from '..';
import * as utils from '../../../helpers/errors';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('gatekeeper/utils/logoutFromAuthServer', () => {
  afterEach(() => {
    fetch.resetMocks();
  });
  it('invokes all the required stuff', async () => {
    fetch.once(JSON.stringify('logged off'), { status: 200 });
    delete window.location;
    const hrefMock = jest.fn();
    (window.location as any) = {
      set href(url: string) {
        hrefMock(url);
      },
    };

    logoutFromAuthServer();
    await new Promise(resolve => setImmediate(resolve));

    expect(fetch.mock.calls).toEqual([
      [
        'https://reveal-stage.smartregister.org/opensrp/logout.do?',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
    ]);
    expect(hrefMock).toHaveBeenCalledWith(
      'https://keycloak-stage.smartregister.org/auth/realms/reveal-stage/protocol/openid-connect/logout?redirect_uri=http%3A%2F%2Flocalhost%3A3000'
    );
  });

  it('Deals with errors', async () => {
    fetch.mockReject(JSON.stringify('still logged in'));
    const displayErrorMock = jest.spyOn(utils, 'displayError');

    logoutFromAuthServer();
    await new Promise(resolve => setImmediate(resolve));

    expect(displayErrorMock).toHaveBeenCalledWith('"still logged in"');
  });
});
