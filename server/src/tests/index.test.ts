import ClientOauth2 from 'client-oauth2';
import { json } from 'express';
import nock from 'nock';
// import superagent from 'superagent';
import request from 'supertest';
import { EXPRESS_SESSION_LOGIN_URL, FRONTEND_OPENSRP_CALLBACK_URL } from '../configs/envs';
import server from '../index';
import { parsedApiResponse } from './fixtures';

const { extractCookies } = require('./utils');

const authorizationUri = 'https://reveal-stage.smartregister.org/opensrp/oauth/';
const oauthCallbackUri = '/oauth/callback/OpenSRP/?code=Boi4Wz&state=opensrp';

const panic = (err: Error, done: jest.DoneCallback) => {
  if (err) {
    done(err);
  }
};

jest.mock('../configs/envs');
// jest.mock('request', () => {
//   return {
//     get(url: string, options: any, callback: Function) {
//       callback();
//     },
//   };
// });

jest.mock('client-oauth2', () => {
  class CodeFlow {
    private client: ClientOauth2;
    public constructor(client: ClientOauth2) {
      this.client = client;
    }

    public getUri() {
      return authorizationUri;
    }

    public async getToken() {
      return this.client.token;
    }
  }
  // tslint:disable-next-line: max-classes-per-file
  class TokenFlow {
    public data = (() => {
      return {
        access_token: '64dc9918-fa1c-435d-9a97-ddb4aa1a8316',
        expires_in: 3221,
        refresh_token: '808f060c-be93-459e-bd56-3074d9b96229',
        scope: 'read write',
        token_type: 'bearer',
      };
    })();

    private client: ClientOauth2;
    public constructor(client: ClientOauth2) {
      this.client = client;
    }

    public sign(options: any) {
      return { url: 'http://someUrl.com' };
    }
  }

  // tslint:disable-next-line: max-classes-per-file
  return class ClientOAuth2 {
    public code = (() => {
      return new CodeFlow(this as any);
    })();
    public token = (() => {
      return new TokenFlow(this as any);
    })();
    private options: ClientOauth2.Options;
    private request: ClientOauth2.Request;
    public constructor(options: ClientOauth2.Options, request: ClientOauth2.Request) {
      this.options = options;
      this.request = request;
    }
  };
});

describe('src/index.ts', () => {
  const actualJsonParse = JSON.parse;
  // let sessionString: string;
  const agent = request.agent(server);
  let cookie: { [key: string]: any };

  afterEach(() => {
    JSON.parse = actualJsonParse;
    jest.resetAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  xit('serves the build.index.html file', done => {
    request(server)
      .get('/')
      .expect(200)
      .expect('Do you mind')
      .end((err: Error, res: Express.Response) => {
        if (err) {
          throw err;
        }
        done();
      });
  });

  xit('oauth/opensrp redirects to auth-server', done => {
    request(server)
      .get('/oauth/opensrp')
      .expect(302)
      .end((err: Error, res: any) => {
        panic(err, done);
        expect(res.headers.location).toEqual(authorizationUri);
        expect(res.notFound).toBeFalsy();
        expect(res.redirect).toBeTruthy();
        done();
      });
  });

  it('E2E: oauth/opensrp/callback works correctly', async done => {
    JSON.parse = body => {
      if (body === '{}') {
        return parsedApiResponse;
      }
    };
    nock('https://reveal-stage.smartregister.org')
      .get(`/opensrp/user-details`)
      .reply(200, {});

    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => new Date('2019-05-14T11:01:58.135Z').valueOf());

    agent.get(oauthCallbackUri).end((err, res: any) => {
      panic(err, done);
      expect(res.headers.location).toEqual(FRONTEND_OPENSRP_CALLBACK_URL);
      expect(res.notFound).toBeFalsy();
      expect(res.redirect).toBeTruthy();
      const sessionString = res.headers['set-cookie'][0].split(';')[0];
      agent.jar.setCookie(sessionString);
      cookie = extractCookies(res.headers);
      // expect that cookie will expire in:  now() + token.expires_in
      expect(cookie['reveal-session'].flags).toEqual({
        Expires: 'Tue, 14 May 2019 11:55:39 GMT',
        HttpOnly: true,
        Path: '/',
      });
      done();
    });
  });

  xit('/oauth/state works correctly without cookie', done => {
    request(server)
      .get('/oauth/state')
      .end((err, res) => {
        panic(err, done);
        expect(res.body).toEqual({
          error: 'Not authorized',
        });
        done();
      });
  });

  it('/oauth/state works correctly with cookie', done => {
    agent
      .get('/oauth/state')
      .set('cookie', 'reveal-session=s%3AuFazUSWRpWvpYa52rKN7Tq8_a0OCzZ_S.mu3q2UQd9%2BheIRG502lvP8WcVeyNr3DBJ2X7OHDADls')
      // .send()
      .end((e: Error, res) => {
        panic(e, done);
        expect(res.body).toEqual({});
        done();
      });
  });

  xit('logs user out', done => {
    request(server)
      .get('/logout')
      .end((err, res: any) => {
        panic(err, done);
        expect(res.headers.location).toEqual(EXPRESS_SESSION_LOGIN_URL);
        expect(res.redirect).toBeTruthy();
        done();
      });
  });

  xit('protects login route from authenticated users', done => {
    request(server)
      .get('/login')
      .end((err, res: any) => {
        panic(err, done);
        expect(res.headers.location).toEqual('');
      });
  });
});
