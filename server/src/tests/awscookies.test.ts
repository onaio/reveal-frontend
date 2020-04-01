// test to simulate how the thailand server responds with cookies.
// specifically, we want to check that the cookies that the load-balancer
// would send in the preflight request(inside the callback handler), are included
// in further requests from the express server to the identity server.
import nock from 'nock';
import request from 'supertest';
import { EXPRESS_FRONTEND_OPENSRP_CALLBACK_URL } from '../configs/envs';
import server from '../index';
import { parsedApiResponse } from './fixtures';

// tslint:disable-next-line: no-var-requires
const { panic } = require('./utils');

const oauthCallbackUri = '/oauth/callback/OpenSRP/?code=Boi4Wz&state=opensrp';

const awsCookie = [
  'AWSALB=MkLQfzGel7fZhIVHD7rRHd8YFrSOlyASIIF3BYPyILJLRHQqFmL1QizZ/M4Pdrmm3euZssvywcu427N28Xv5uTlhNO9Y6LMmnL6BZrxGP+XwLil6g56hrTrddP1c; Expires=Fri, 03 Apr 2020 18:01:36 GMT; Path=/',
  'AWSALBCORS=MkLQfzGel7fZhIVHD7rRHd8YFrSOlyASIIF3BYPyILJLRHQqFmL1QizZ/M4Pdrmm3euZssvywcu427N28Xv5uTlhNO9Y6LMmnL6BZrxGP+XwLil6g56hrTrddP1c; Expires=Fri, 03 Apr 2020 18:01:36 GMT; Path=/; SameSite=None; Secure',
];

const tokenResponseBody = {
  access_token: 'f91d35a8-452c-4901-9f34-cf79d6353233',
  expires_in: 148,
  refresh_token: 'f9960324-2853-4aed-940b-74c9aba5c154',
  scope: 'read write',
  token_type: 'bearer',
};

describe('src/index.ts.awscookies', () => {
  afterAll(() => {
    server.close();
  });

  it('E2E: oauth/opensrp/callback works correctly', done => {
    nock('https://reveal-stage.smartregister.org')
      .persist()
      .defaultReplyHeaders({
        'set-cookie': awsCookie,
      })
      .get(`/opensrp/user-details`)
      .reply(200, parsedApiResponse);

    nock('https://reveal-stage.smartregister.org')
      .persist()
      .defaultReplyHeaders({
        'set-cookie': awsCookie,
      })
      .get('/opensrp')
      .reply(200, {}, {});

    // we need to check that the headers are sent along with this request.
    nock('https://reveal-stage.smartregister.org', {
      reqheaders: {
        cookie:
          'AWSALB=MkLQfzGel7fZhIVHD7rRHd8YFrSOlyASIIF3BYPyILJLRHQqFmL1QizZ/M4Pdrmm3euZssvywcu427N28Xv5uTlhNO9Y6LMmnL6BZrxGP+XwLil6g56hrTrddP1c; AWSALBCORS=MkLQfzGel7fZhIVHD7rRHd8YFrSOlyASIIF3BYPyILJLRHQqFmL1QizZ/M4Pdrmm3euZssvywcu427N28Xv5uTlhNO9Y6LMmnL6BZrxGP+XwLil6g56hrTrddP1c',
      },
    })
      .persist()
      .post('/opensrp/oauth/token')
      .reply(200, tokenResponseBody);

    /** PS: This test will start failing on  Fri, 14 May 3019 11:55:39 GMT */
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => new Date('3019-05-14T11:01:58.135Z').valueOf());

    request(server)
      .get(oauthCallbackUri)
      .end((err, res: request.Response) => {
        panic(err, done);
        expect(res.header.location).toEqual(EXPRESS_FRONTEND_OPENSRP_CALLBACK_URL);
        expect(res.notFound).toBeFalsy();
        expect(res.redirect).toBeTruthy();
        done();
      });
  });
});
