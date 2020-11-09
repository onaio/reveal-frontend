import superset from '@onaio/superset-connector';
import * as globalFixtures from '../../../../../../store/ducks/tests/fixtures';

/** the existing state for the test case: selectors get called with correct arguments
 * relies on the passed props.
 */
export const existingState = {
  gatekeeper: { result: {}, success: null, working: false },
  goals: {
    currentGoal: null,
    goalsById: { '19b86421-3cb2-5698-9f11-c1bdafbe5e6d': globalFixtures.goal3 },
  },
  indexCasesDetails: {
    objectsById: {},
    totalRecords: 0,
  },
  jurisdictions: {
    allJurisdictionIds: {
      '313056f2-2a21-454e-9f88-63207acb00d4': {
        id: '313056f2-2a21-454e-9f88-63207acb00d4',
        isLoaded: true,
      },
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
    location: { hash: '', pathname: '/', search: '', state: undefined, query: {} },
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

// tslint:disable: no-var-requires
export const planJSON = require('./supersetFixtures/plans.json');
export const jurisdictionJSON = require('./supersetFixtures/jurisdictions.json');
export const structuresJSON = require('./supersetFixtures/structures.json');
export const goalsJSON = require('./supersetFixtures/goals.json');
/** this includes all tasks for this plan */
export const plansTasksJSON = require('./supersetFixtures/planTasks.json');
/** this are case confirmation tasks within the jurisdiction area that this plan is part of */
export const caseConfirmationJSON = require('./supersetFixtures/caseConfirmationTasks.json');

export const processedPlansJSON = superset.processData(planJSON) || [];
export const processedJurisdictionJSON = superset.processData(jurisdictionJSON) || [];
export const processedStructuresJSON = superset.processData(structuresJSON) || [];
export const processedGoalsJSON = superset.processData(goalsJSON) || [];
export const processedPlansTasksJson = superset.processData(plansTasksJSON) || [];
export const processedCaseConfirmationTasksJSON = superset.processData(caseConfirmationJSON) || [];
// หุบเขาคลองเพลิน from Thailand production
export const oneGoalJurisdiction = require('./supersetFixtures/one-goal/jurisdiction.json');
export const oneGoalTasks = require('./supersetFixtures/one-goal/task_structures.json');
export const oneGoalPlan = require('./supersetFixtures/one-goal/plan.json');
export const oneGoalGoals = require('./supersetFixtures/one-goal/goals.json');
export const processedOneGoalJurisdiction = superset.processData(oneGoalJurisdiction) || [];
export const processedOneGoalTasks = superset.processData(oneGoalTasks) || [];
export const processedOneGoalPlan = superset.processData(oneGoalPlan) || [];
export const processedOneGoalGoals = superset.processData(oneGoalGoals) || [];
