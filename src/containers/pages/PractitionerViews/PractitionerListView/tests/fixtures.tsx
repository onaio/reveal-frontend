import {
  practitioner1,
  practitioner2,
  practitioner3,
} from '../../../../../store/ducks/tests/fixtures';

export const state = {
  gatekeeper: { result: {}, success: null, working: false },
  practitioner: {
    practitionerRoles: {},
    practitionersById: {
      '437cc699-cfa7-414c-ba27-1668b6b517e6': practitioner3,
      'd7c9c000-e9b3-427a-890e-49c301aa48e6': practitioner2,
      p5id: practitioner1,
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
