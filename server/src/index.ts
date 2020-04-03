import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import ClientOAuth2 from 'client-oauth2';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { trimStart } from 'lodash';
import path from 'path';
import querystring from 'querystring';
import request from 'request';
import sessionFileStore from 'session-file-store';
import { parse } from 'url';
import {
  EXPRESS_FRONTEND_LOGIN_URL,
  EXPRESS_FRONTEND_OPENSRP_CALLBACK_URL,
  EXPRESS_OPENSRP_ACCESS_TOKEN_URL,
  EXPRESS_OPENSRP_AUTHORIZATION_URL,
  EXPRESS_OPENSRP_CALLBACK_URL,
  EXPRESS_OPENSRP_CLIENT_ID,
  EXPRESS_OPENSRP_CLIENT_SECRET,
  EXPRESS_OPENSRP_OAUTH_STATE,
  EXPRESS_OPENSRP_USER_URL,
  EXPRESS_PORT,
  EXPRESS_REACT_BUILD_PATH,
  EXPRESS_SESSION_FILESTORE_PATH,
  EXPRESS_SESSION_LOGIN_URL,
  EXPRESS_SESSION_NAME,
  EXPRESS_SESSION_PATH,
  EXPRESS_SESSION_SECRET,
} from './configs/envs';

const opensrpAuth = new ClientOAuth2({
  accessTokenUri: EXPRESS_OPENSRP_ACCESS_TOKEN_URL,
  authorizationUri: EXPRESS_OPENSRP_AUTHORIZATION_URL,
  clientId: EXPRESS_OPENSRP_CLIENT_ID,
  clientSecret: EXPRESS_OPENSRP_CLIENT_SECRET,
  redirectUri: EXPRESS_OPENSRP_CALLBACK_URL,
  scopes: ['read', 'write'],
  state: EXPRESS_OPENSRP_OAUTH_STATE,
});
const loginURL = EXPRESS_SESSION_LOGIN_URL || '/';
const sessionName = EXPRESS_SESSION_NAME || 'session';

const app = express();

app.use(compression()); // Compress all routes
app.use(helmet()); // protect against well known vulnerabilities

const FileStore = sessionFileStore(session);
const fileStoreOptions = {
  path: EXPRESS_SESSION_FILESTORE_PATH || './sessions',
};

let nextPath: string | undefined;

const sess = {
  cookie: {
    httpOnly: true,
    path: EXPRESS_SESSION_PATH || '/',
    secure: false,
  },
  name: sessionName,
  resave: true,
  saveUninitialized: true,
  secret: EXPRESS_SESSION_SECRET || 'hunter2',
  store: new FileStore(fileStoreOptions),
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(cookieParser());
app.use(session(sess));

class HttpException extends Error {
  public statusCode: number;
  public message: string;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

const handleError = (err: HttpException, res: express.Response) => {
  const { message } = err;
  if (message.includes('resource owner or authorization server denied the request')) {
    return res.redirect(EXPRESS_FRONTEND_LOGIN_URL);
  }
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message,
    status: 'error',
    statusCode,
  });
};

const BUILD_PATH = EXPRESS_REACT_BUILD_PATH;
const filePath = path.resolve(BUILD_PATH, 'index.html');

// need to add docstrings and type defs
const renderer = (_: express.Request, res: express.Response) => {
  res.sendFile(filePath);
};

const oauthLogin = (_: express.Request, res: express.Response) => {
  const provider = opensrpAuth;
  const uri = provider.code.getUri();
  res.redirect(uri);
};

const oauthCallback = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const provider = opensrpAuth;
  provider.code
    .getToken(req.originalUrl)
    .then((user: ClientOAuth2.Token) => {
      const url = EXPRESS_OPENSRP_USER_URL;
      request.get(
        url,
        user.sign({
          method: 'GET',
          url,
        }),
        (error: Error, _: request.Response, body: string) => {
          if (error) {
            next(error); // pass error to express
          }
          const apiResponse = JSON.parse(body);
          apiResponse.oAuth2Data = user.data;

          const sessionState = getOpenSRPUserInfo(apiResponse);
          if (sessionState) {
            const gatekeeperState = { success: true, result: sessionState.extraData };
            const preloadedState = {
              gatekeeper: gatekeeperState,
              session: sessionState,
            };
            req.session.preloadedState = preloadedState;
            const expireAfterMs = sessionState.extraData.oAuth2Data.expires_in * 1000;
            req.session.cookie.maxAge = expireAfterMs;
            // you have to save the session manually for POST requests like this one
            req.session.save(() => void 0);
            if (nextPath) {
              /** reset nextPath to undefined; its value once set should only be used
               * once and invalidated after being used, which is here. Failing to invalidate the previous value
               * would result in the user being redirected to the same url the next time they pass through
               * here irrespective of whether they should or shouldn't
               */
              const localNextPath = nextPath;
              nextPath = undefined;
              return res.redirect(localNextPath);
            }
            return res.redirect(EXPRESS_FRONTEND_OPENSRP_CALLBACK_URL);
          }
        }
      );
    })
    .catch((e: Error) => {
      next(e);
    });
};

const oauthState = (req: express.Request, res: express.Response) => {
  // check if logged in
  if (!req.session.preloadedState) {
    return res.json({ error: 'Not authorized' });
  }
  // only return this when user has valid session
  return res.json(req.session.preloadedState);
};

const loginRedirect = (req: express.Request, res: express.Response, _: express.NextFunction) => {
  // check if logged in and redirect
  const parsedUrl = parse(req.originalUrl);
  const searchParam = parsedUrl.search;
  if (searchParam) {
    const searchString = trimStart(searchParam, '?');
    const searchParams = querystring.parse(searchString);
    nextPath = searchParams.next as string | undefined;
  }
  req.session.preloadedState ? res.redirect(nextPath) : res.redirect(EXPRESS_FRONTEND_LOGIN_URL);
};

const logout = (req: express.Request, res: express.Response) => {
  req.session.destroy(() => void 0);
  res.clearCookie(sessionName);
  res.redirect(loginURL);
};

// OAuth views
const router = express.Router();
router.use('/oauth/opensrp', oauthLogin);
router.use('/oauth/callback/OpenSRP', oauthCallback);
router.use('/oauth/state', oauthState);
// handle login
router.use(loginURL, loginRedirect);
// logout
router.use('/logout', logout);
// render React app
router.use('^/$', renderer);
// other static resources should just be served as they are
router.use(express.static(BUILD_PATH, { maxAge: '30d' }));
// sends other routes to be handled by React Router
router.use('*', renderer);

// tell the app to use the above rules
app.use(router);

app.use(
  (err: HttpException, _: express.Request, res: express.Response, __: express.NextFunction) => {
    handleError(err, res);
  }
);

const PORT = EXPRESS_PORT || 3000;
const server = app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`App listening on port ${PORT}!`);
});

export default server;
