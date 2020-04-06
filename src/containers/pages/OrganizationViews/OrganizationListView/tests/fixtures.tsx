import { organization1, organization2 } from '../../../../../store/ducks/tests/fixtures';

export const state = {
  gatekeeper: { result: {}, success: null, working: false },
  organizations: {
    organizationsById: {
      '4c506c98-d3a9-11e9-bb65-2a2ae2dbcce4': organization2,
      'fcc19470-d599-11e9-bb65-2a2ae2dbcce4': organization1,
    },
  },
  router: {
    action: 'POP',
    location: { hash: '', pathname: '/', search: '', state: undefined, query: {} },
  },
  session: {
    authenticated: false,
    extraData: {},
    user: { email: '', gravatar: '', name: '', username: '' },
  },
};
