import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import ClientOAuth2 from 'client-oauth2';
import express from 'express';
import fs from 'fs';
import path from 'path';
import request from 'request';
import serialize from 'serialize-javascript';

const opensrpAuth = new ClientOAuth2({
  accessTokenUri: process.env.EXPRESS_OPENSRP_ACCESS_TOKEN_URL,
  authorizationUri: process.env.EXPRESS_OPENSRP_AUTHORIZATION_URL,
  clientId: process.env.EXPRESS_OPENSRP_CLIENT_ID,
  clientSecret: process.env.EXPRESS_OPENSRP_CLIENT_SECRET,
  redirectUri: process.env.EXPRESS_OPENSRP_CALLBACK_URL,
  scopes: ['read', 'write'],
  state: process.env.EXPRESS_OPENSRP_OAUTH_STATE,
});

const preloadedStateFile = process.env.EXPRESS_PRELOADED_STATE_FILE || '/tmp/express.json';

console.log('opensrpAuth >>>>> ', opensrpAuth);

// const session = () => cookieSession({
//   httpOnly: false,
//   name: 'session',
//   secret: 'reveal',
// });

const app = express();

// app.use(session);
// app.use(cookieSession({
//   httpOnly: true,
//   name: 'session',
//   keys: ['key1', 'key2']
// }))

const router = express.Router();

const PORT = process.env.PORT || 3000;
const BUILD_PATH = path.resolve(path.resolve(), 'build');
const filePath = path.resolve(BUILD_PATH, 'index.html');

// need to add docstrings and type defs
const renderer = (req, res) => {
  res.sendFile(filePath);
};

const oauthLogin = (req, res) => {
  const provider = opensrpAuth;
  const uri = provider.code.getUri();
  res.redirect(uri);
};

const oauthCallback = (req, res) => {
  const provider = opensrpAuth;
  provider.code
    .getToken(req.originalUrl)
    .then(function(user) {
      const url = process.env.EXPRESS_OPENSRP_USER_URL;
      request.get(
        url,
        user.sign({
          method: 'GET',
          url,
        }),
        (error, response, body) => {
          if (error) {
            console.log('error >>> ', error);
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
            fs.writeFileSync(preloadedStateFile, serialize(preloadedState));
          }
        }
      );

      // Refresh the current users access token.
      // user.refresh().then(function(updatedUser) {
      //   console.log(" updated user >>> ", updatedUser !== user); // => true
      //   console.log(" access token >>> ", updatedUser.accessToken);
      // });
      return res.redirect(process.env.FRONTEND_OPENSRP_CALLBACK_URL);
    })
    .catch(e => {
      console.log('error >>> ', e);
      return res.send('oops');
    });
};

const oauthState = (req, res) => {
  const file = preloadedStateFile;
  if (!fs.existsSync(file)) {
    return res.json({ error: 'File not found' });
  }
  const preloadedState = fs.readFileSync(file, 'utf8');
  return res.json(JSON.parse(preloadedState));
};

// OAuth views
router.use('/oauth/opensrp', oauthLogin);
router.use('/oauth/callback/OpenSRP', oauthCallback);
router.use('/oauth/state', oauthState);
// render React app
router.use('^/$', renderer);
// other static resources should just be served as they are
router.use(express.static(BUILD_PATH, { maxAge: '30d' }));
// sends other routes to be handled by React Router
router.use('*', renderer);

// tell the app to use the above rules
app.use(router);

app.listen(PORT, () => {
  // console.log(`Example app listening on port ${PORT}!`)
});
