import { jwtAccessToken } from '../../services/opensrp/tests/fixtures/session';

export const expressAPIResponse = {
  gatekeeper: {
    result: {
      oAuth2Data: {
        access_token: jwtAccessToken,
        expires_in: 1142,
        refresh_token: 'iloveoov',
        scope: 'read write',
        token_type: 'bearer',
      },
      preferredName: 'Superset User',
      roles: ['Provider'],
      username: 'superset-user',
    },
    success: true,
  },
  session: {
    authenticated: true,
    extraData: {
      oAuth2Data: {
        access_token: jwtAccessToken,
        expires_in: 1142,
        refresh_token: 'iloveoov',
        scope: 'read write',
        token_type: 'bearer',
      },
      preferredName: 'Superset User',
      roles: ['Provider'],
      username: 'superset-user',
    },
    user: {
      email: '',
      gravatar: '',
      name: '',
      username: 'superset-user',
    },
  },
};
