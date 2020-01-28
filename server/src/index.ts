import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import ClientOAuth2 from 'client-oauth2';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import path from 'path';
import request from 'request';
import sessionFileStore from 'session-file-store';

// initialize configuration
dotenv.config();

const opensrpAuth = new ClientOAuth2({
  accessTokenUri: process.env.EXPRESS_OPENSRP_ACCESS_TOKEN_URL,
  authorizationUri: process.env.EXPRESS_OPENSRP_AUTHORIZATION_URL,
  clientId: process.env.EXPRESS_OPENSRP_CLIENT_ID,
  clientSecret: process.env.EXPRESS_OPENSRP_CLIENT_SECRET,
  redirectUri: process.env.EXPRESS_OPENSRP_CALLBACK_URL,
  scopes: ['read', 'write'],
  state: process.env.EXPRESS_OPENSRP_OAUTH_STATE,
});

const loginURL = process.env.EXPRESS_SESSION_LOGIN_URL || '/';

const sessionName = process.env.EXPRESS_SESSION_NAME || 'session';

const app = express();

const FileStore = sessionFileStore(session);
const fileStoreOptions = {
  path: process.env.EXPRESS_SESSION_FILESTORE_PATH || './sessions',
};

const sess = {
  cookie: {
    httpOnly: true,
    path: process.env.EXPRESS_SESSION_PATH || '/',
    secure: false,
  },
  name: sessionName,
  resave: true,
  saveUninitialized: true,
  secret: process.env.EXPRESS_SESSION_SECRET || 'hunter2',
  store: new FileStore(fileStoreOptions),
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

// app.use(express.json());
app.use(cookieParser());
app.use(session(sess));

// This middleware will check if user's cookie is still saved in browser and
// preloadedState is not set, then automatically remove the cookie.
// app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
//   if (req.cookies[sessionName] && (!req.session || !req.session.preloadedState)) {
//     res.clearCookie(sessionName);
//   }
//   next();
// });

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
  const { statusCode, message } = err;
  res.status(statusCode).json({
    message,
    status: 'error',
    statusCode,
  });
};
// middleware function to check for logged-in users
const sessionChecker = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.session.preloadedState) {
    res.redirect(loginURL);
  }
  next();
};

const router = express.Router();

const PORT = process.env.EXPRESS_PORT || 3000;

const BUILD_PATH = process.env.EXPRESS_REACT_BUILD_PATH || path.resolve(path.resolve(), '../build');
const filePath = path.resolve(BUILD_PATH, 'index.html');

// need to add docstrings and type defs
const renderer = (req: express.Request, res: express.Response) => {
  res.sendFile(filePath);
};

const oauthLogin = (req: express.Request, res: express.Response) => {
  const provider = opensrpAuth;
  const uri = provider.code.getUri();
  res.redirect(uri);
};

const oauthCallback = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const provider = opensrpAuth;
  provider.code
    .getToken(req.originalUrl)
    .then((user: ClientOAuth2.Token) => {
      const url = process.env.EXPRESS_OPENSRP_USER_URL;
      request.get(
        url,
        user.sign({
          method: 'GET',
          url,
        }),
        (error: Error, response: request.Response, body: string) => {
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
            // you have to save the session manually for POST requests like this one
            req.session.save(() => void 0);
          }
        }
      );

      return res.status(200).json('Success');
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

const logout = (req: express.Request, res: express.Response) => {
  req.session.destroy(() => void 0);
  res.clearCookie(sessionName);
  res.redirect(loginURL);
};

// OAuth views
router.use('/oauth/opensrp', oauthLogin);
router.use('/oauth/callback/OpenSRP', oauthCallback);
router.use('/oauth/state', oauthState);
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
  (err: HttpException, req: express.Request, res: express.Response, next: express.NextFunction) => {
    handleError(err, res);
  }
);

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`App listening on port ${PORT}!`);
});
