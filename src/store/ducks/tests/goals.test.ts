import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, {
  fetchGoals,
  getCurrentGoal,
  getGoalById,
  getGoalsByGoalId,
  getGoalsById,
  getGoalsByJurisdictionId,
  getGoalsByPlanAndJurisdiction,
  getGoalsByPlanId,
  Goal,
  reducerName,
  removeGoalsAction,
  setCurrentGoal,
} from '../goals';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/goals', () => {
  beforeEach(() => {
    FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getGoalsById(store.getState())).toEqual({});
    expect(getGoalById(store.getState(), 'someId')).toEqual(null);
    expect(getGoalsByPlanId(store.getState(), 'someId')).toEqual([]);
    expect(getGoalsByGoalId(store.getState(), 'someId')).toEqual([]);
    expect(getGoalsByJurisdictionId(store.getState(), 'someId')).toEqual([]);
    expect(getGoalsByPlanAndJurisdiction(store.getState(), 'a', 'b')).toEqual([]);
    expect(getCurrentGoal(store.getState())).toEqual(null);
  });

  it('should fetch goals', () => {
    store.dispatch(fetchGoals(fixtures.goals as Goal[]));
    const expected = keyBy(fixtures.goals, (goal: Goal) => goal.id);
    expect(getGoalsById(store.getState())).toEqual(expected);
    expect(getGoalById(store.getState(), '5a27ec10-7a5f-563c-ba11-4de150b336af')).toEqual(
      fixtures.goal1
    );
    expect(getGoalsByPlanId(store.getState(), '10f9e9fa-ce34-4b27-a961-72fab5206ab6')).toEqual([
      fixtures.goal1,
      fixtures.goal2,
      fixtures.goal4,
    ]);
    expect(getGoalsByGoalId(store.getState(), 'Case_Confirmation')).toEqual([fixtures.goal1]);
    expect(
      getGoalsByJurisdictionId(store.getState(), '450fc15b-5bd2-468a-927a-49cb10d3bcac')
    ).toEqual([fixtures.goal1, fixtures.goal2, fixtures.goal4]);
    expect(
      getGoalsByPlanAndJurisdiction(
        store.getState(),
        '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
        '450fc15b-5bd2-468a-927a-49cb10d3bcac'
      )
    ).toEqual([fixtures.goal1, fixtures.goal2, fixtures.goal4]);
  });

  it('should set currentGoal', () => {
    store.dispatch(setCurrentGoal(fixtures.currentGoal));
    expect(getCurrentGoal(store.getState())).toEqual(fixtures.currentGoal);
    store.dispatch(setCurrentGoal(fixtures.nextGoal));
    expect(getCurrentGoal(store.getState())).toEqual(fixtures.nextGoal);
    store.dispatch(setCurrentGoal(null));
    expect(getCurrentGoal(store.getState())).toEqual(null);
  });

  it('should save goals correctly', () => {
    store.dispatch(fetchGoals([fixtures.goal37] as any));
    const goal37FromStore = getGoalById(store.getState(), '1337');
    expect(goal37FromStore).not.toBeNull();
    if (goal37FromStore) {
      expect(goal37FromStore).toEqual({
        action_code: 'Mosquito Collection',
        action_description:
          'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
        action_prefix: '6',
        action_reason: 'Investigation',
        action_title: 'Mosquito Collection',
        completed_task_count: 3,
        goal_comparator: '>=',
        goal_id: 'Mosquito_Collection_Min_3_Traps',
        goal_unit: 'traps',
        goal_value: 3,
        id: '1337',
        jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        measure: 'Number of mosquito collection traps',
        plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
        task_business_status_map: {
          Complete: 3,
          'In Progress': 3,
          Incomplete: 1,
          'Not Eligible': 6,
          'Not Visited': 5,
        },
        task_count: 18,
      });
    }
  });

  it('should reset goal records in store', () => {
    store.dispatch(removeGoalsAction);
    let goalsInStore = getGoalsById(store.getState());
    expect(goalsInStore).toEqual({});

    store.dispatch(fetchGoals(fixtures.goals as Goal[]));
    goalsInStore = getGoalsById(store.getState());

    store.dispatch(removeGoalsAction);
    expect(goalsInStore).not.toEqual({});
    goalsInStore = getGoalsById(store.getState());
    expect(goalsInStore).toEqual({});
  });

  it('Should add new goals to existing goals in store', () => {
    store.dispatch(removeGoalsAction);
    const plan1Id = '10f9e9fa-ce34-4b27-a961-72fab5206ab6';
    let goalNumberInStore = getGoalsByPlanId(store.getState(), plan1Id).length;
    expect(goalNumberInStore).toEqual(0);

    store.dispatch(fetchGoals([fixtures.goal1 as Goal]));
    const goal1Id = '5a27ec10-7a5f-563c-ba11-4de150b336af';
    let goal1FromStore = getGoalById(store.getState(), goal1Id);
    expect(goal1FromStore).not.toBe(null);
    goalNumberInStore = getGoalsByPlanId(store.getState(), plan1Id).length;
    expect(goalNumberInStore).toEqual(1);

    store.dispatch(fetchGoals([fixtures.goal2 as Goal]));
    const goal2Id = 'f8d4e0a9-5867-5c78-9e26-de45d72556c4';
    const goal2FromStore = getGoalById(store.getState(), goal2Id);
    goal1FromStore = getGoalById(store.getState(), goal1Id);
    expect(goal2FromStore).not.toBe(null);
    expect(goal1FromStore).not.toBe(null);
    goalNumberInStore = getGoalsByPlanId(store.getState(), plan1Id).length;
    expect(goalNumberInStore).toEqual(2);

    store.dispatch(fetchGoals([fixtures.goal1 as Goal]));
    goalNumberInStore = getGoalsByPlanId(store.getState(), plan1Id).length;
    expect(goalNumberInStore).toEqual(2);
  });
});
