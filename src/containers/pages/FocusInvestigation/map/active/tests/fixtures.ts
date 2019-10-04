import * as globalFixtures from '../../../../../../store/ducks/tests/fixtures';

/** the existing state for the test case: selectors get called with correct arguments
 * relies on the passed props.
 */
export const existingState = {
  gatekeeper: { result: {}, success: null },
  goals: {
    currentGoal: null,
    goalsById: { '19b86421-3cb2-5698-9f11-c1bdafbe5e6d': globalFixtures.goal3 },
  },
  jurisdictions: {
    allJurisdictionIds: {
      '450fc15b-5bd2-468a-927a-49cb10d3bcac': {
        id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        isLoaded: true,
      },
    },
    jurisdictionsById: {
      '450fc15b-5bd2-468a-927a-49cb10d3bcac': globalFixtures.jurisdiction1,
    },
  },
  plans: {
    planRecordsById: {},
    plansById: {
      'ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f': globalFixtures.plan1,
    },
  },
  router: {
    action: 'POP',
    location: { hash: '', pathname: '/', search: '', state: undefined },
  },
  session: {
    authenticated: false,
    extraData: {},
    user: { email: '', gravatar: '', name: '', username: '' },
  },
  structures: { structuresById: {} },
  superset: { authorized: null },
  tasks: {
    tasksById: {
      '01d0b84c-df06-426c-a272-6858e84fea31': globalFixtures.task4,
      '03458d28-af61-4f70-b110-73a3429ada2d': globalFixtures.task2,
      'e3e1f2a7-4c53-4059-ab81-0811539e0c5e': globalFixtures.task3,
      'e652f8b2-b884-42d5-832a-86009c10a812': globalFixtures.task1,
    },
  },
};
