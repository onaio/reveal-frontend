import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, keys, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, { fetchGoals, getGoalById, getGoalsById, Goal, reducerName } from '../goals';
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
  });

  it('should fetch goals', () => {
    store.dispatch(fetchGoals(fixtures.goals));
    const expected = keyBy(fixtures.goals, (goal: Goal) => goal.id);
    expect(getGoalsById(store.getState())).toEqual(expected);
    expect(getGoalById(store.getState(), '5a27ec10-7a5f-563c-ba11-4de150b336af')).toEqual(
      fixtures.goal1
    );
  });
});
