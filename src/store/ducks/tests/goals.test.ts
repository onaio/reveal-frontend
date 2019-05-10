import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, keys, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, {
  fetchGoals,
  getGoalsArrayByPlanId,
  getGoalsByPlanId,
  reducerName,
} from '../goals';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/superset', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getGoalsByPlanId(store.getState())).toEqual({});
    expect(getGoalsArrayByPlanId(store.getState(), 'abc')).toEqual(null);
  });

  it('should fetch goals', () => {
    store.dispatch(fetchGoals(fixtures.goals));
    expect(getGoalsByPlanId(store.getState())).toEqual(fixtures.goalsByPlanId);
    expect(getGoalsArrayByPlanId(store.getState(), '10f9e9fa-ce34-4b27-a961-72fab5206ab6')).toEqual(
      [fixtures.goal1, fixtures.goal2]
    );
    expect(getGoalsArrayByPlanId(store.getState(), '1337')).toEqual([fixtures.goal3]);
  });
});
