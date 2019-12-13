import gatekeeper from '@onaio/gatekeeper';
import ClientOAuth2 from 'client-oauth2';
import express from 'express';
import fs from 'fs';
import path from 'path';
import request from 'request';
import serialize from 'serialize-javascript';

const opensrpAuth = new ClientOAuth2({
  accessTokenUri: 'https://reveal-stage.smartregister.org/opensrp/oauth/token',
  authorizationUri: 'https://reveal-stage.smartregister.org/opensrp/oauth/authorize',
  clientId: process.env.REACT_APP_OPENSRP_CLIENT_ID,
  clientSecret: process.env.REACT_APP_OPENSRP_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/oauth/callback/OpenSRP/',
  scopes: ['read', 'write'],
  state: 'opensrp',
});
const app = express();
const router = express.Router();

const PORT = process.env.PORT || 3000;
const BUILD_PATH = path.resolve(path.resolve(), 'build');
const filePath = path.resolve(BUILD_PATH, 'index.html');

// need to add docstrings and type defs
const renderer = (Request, res) => {
  const preloadedState = fs.readFileSync('/tmp/revealState.json');

  fs.readFile(filePath, 'utf8', (err, htmlData) => {
    if (err) {
      return res.status(404).end();
    }
    return res.send(
      htmlData.replace(
        '<div id="reveal-root"></div>',
        `<div id="reveal-root"></div><script>window.__PRELOADED_STATE__=${preloadedState}</script>`
      )
    );
  });
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
      const url = 'https://reveal-stage.smartregister.org/opensrp/user-details';
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
          const sessionState = gatekeeper.getOpenSRPUserInfo(apiResponse);
          if (sessionState) {
            const gatekeeperState = { success: true, result: sessionState.extraData };
            const preloadedState = {
              gatekeeper: gatekeeperState,
              session: sessionState,
            };
            fs.writeFileSync('/tmp/revealState.json', serialize(preloadedState));
          }
        }
      );

      // Refresh the current users access token.
      // user.refresh().then(function(updatedUser) {
      //   console.log(" updated user >>> ", updatedUser !== user); // => true
      //   console.log(" access token >>> ", updatedUser.accessToken);
      // });
    })
    .catch(e => {
      // console.log('error >>> ', e);
    });

  return res.send('oops');
};

// OAuth views
router.use('/oauth/opensrp', oauthLogin);
router.use('/oauth/callback/OpenSRP', oauthCallback);
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
