import { Providers } from '@onaio/gatekeeper';

import { DOMAIN_NAME, ONADATA_CLIENT_ID } from '../constants';

export const providers: Providers = {
  Ona: {
    accessTokenUri: 'https://stage-api.ona.io/o/token/',
    authorizationUri: 'https://stage-api.ona.io/o/authorize/',
    clientId: ONADATA_CLIENT_ID,
    redirectUri: `${DOMAIN_NAME}/oauth/callback/Ona/`,
    scopes: ['read', 'write'],
    state: 'abc',
    userUri: 'https://stage-api.ona.io/api/v1/user.json',
  },
};
