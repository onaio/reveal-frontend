import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, {
  fetchGoals,
  getGoalById,
  getGoalsByGoalId,
  getGoalsById,
  getGoalsByJurisdictionId,
  getGoalsByPlanAndJurisdiction,
  getGoalsByPlanId,
  Goal,
  reducerName,
} from '../goals';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/goals', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getGoalsById(store.getState())).toEqual({});
    expect(getGoalById(store.getState(), 'someId')).toEqual(null);
    expect(getGoalsByPlanId(store.getState(), 'someId')).toEqual([]);
    expect(getGoalsByGoalId(store.getState(), 'someId')).toEqual([]);
    expect(getGoalsByJurisdictionId(store.getState(), 'someId')).toEqual([]);
    expect(getGoalsByPlanAndJurisdiction(store.getState(), 'a', 'b')).toEqual([]);
  });

  it('should fetch goals', () => {
    store.dispatch(fetchGoals(fixtures.goals));
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

  it('should save goals correctly', () => {
    store.dispatch(fetchGoals([fixtures.goal37] as any));
    const goal37FromStore = getGoalById(store.getState(), '1337');
    expect(goal37FromStore).not.toBeNull();
    if (goal37FromStore) {
      expect(goal37FromStore).toEqual({
        action_code: 'Mosquito Collection',
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
});
