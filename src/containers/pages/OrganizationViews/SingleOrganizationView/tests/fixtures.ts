export const selectorState = {
  gatekeeper: { result: {}, success: null, working: false },
  organizations: {
    organizationsById: {
      'd23f7350-d406-11e9-bb65-2a2ae2dbcce4': {
        active: true,
        id: 2,
        identifier: 'd23f7350-d406-11e9-bb65-2a2ae2dbcce4',
        name: 'Takang 1',
        partOf: 1,
        type: {
          coding: [
            {
              code: 'team',
              display: 'Team',
              system: 'http://terminology.hl7.org/CodeSystem/organization-type',
            },
          ],
        },
      },
    },
  },
  practitioner: {
    practitionerRoles: {
      'd23f7350-d406-11e9-bb65-2a2ae2dbcce4': {
        '437cc699-cfd7-414c-ba27-1668b6b517e6': {
          active: true,
          identifier: '437cc699-cfd7-414c-ba27-1668b6b517e6',
          name: 'Test User Lusaka',
          userId: 'cad04f1e-9c05-4ebc-92ce-4b38aa478644',
          username: 'lusaka',
        },
        healer: {
          active: true,
          identifier: 'healer',
          name: 'tlv2_name',
          userId: '84f3b7ce-e3fa-420f-8de6-e7c36e08f0bc',
          username: 'tlv2',
        },
        master: {
          active: true,
          identifier: 'master',
          name: 'Biophics Tester',
          userId: '8df26310-c7ef-4bb2-b77f-3b9f4bd23713',
          username: 'tak',
        },
      },
    },
    practitionersById: {},
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
