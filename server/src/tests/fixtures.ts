// tslint:disable: -literal-sort-keys
export const parsedApiResponse = {
  preferredName: 'Superset User',
  roles: ['Provider'],
  userName: 'superset-user',
};

export const oauthState = {
  gatekeeper: {
    result: {
      oAuth2Data: {
        access_token: '64dc9918-fa1c-435d-9a97-ddb4aa1a8316',
        expires_in: 3221,
        refresh_token: '808f060c-be93-459e-bd56-3074d9b96229',
        scope: 'read write',
        token_type: 'bearer',
      },
      preferredName: 'Superset User',
      roles: ['Provider'],
      userName: 'superset-user',
    },
    success: true,
  },
  session: {
    authenticated: true,
    extraData: {
      oAuth2Data: {
        access_token: '64dc9918-fa1c-435d-9a97-ddb4aa1a8316',
        expires_in: 3221,
        refresh_token: '808f060c-be93-459e-bd56-3074d9b96229',
        scope: 'read write',
        token_type: 'bearer',
      },
      preferredName: 'Superset User',
      roles: ['Provider'],
      userName: 'superset-user',
    },
    user: {
      email: '',
      gravatar: '',
      name: '',
      username: 'superset-user',
    },
  },
};

export const unauthorized = {
  error: 'Not authorized',
};
