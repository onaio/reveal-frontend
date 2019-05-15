import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, {
  fetchPlans,
  getPlanById,
  getPlansArray,
  getPlansById,
  getPlansIdArray,
  Plan,
  reducerName,
} from '../plans';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/superset', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getPlansById(store.getState())).toEqual({});
    expect(getPlansIdArray(store.getState())).toEqual([]);
    expect(getPlansArray(store.getState())).toEqual([]);
    expect(getPlanById(store.getState(), 'someId')).toEqual(null);
  });

  it('should fetch plans', () => {
    store.dispatch(fetchPlans(fixtures.plans));
    const expected = keyBy(fixtures.plans, (plan: Plan) => plan.plan_id);
    expect(getPlansById(store.getState())).toEqual(expected);
    expect(getPlansIdArray(store.getState())).toEqual(['10f9e9fa-ce34-4b27-a961-72fab5206ab6']);
    expect(getPlansArray(store.getState())).toEqual(values(expected));
    expect(getPlanById(store.getState(), '10f9e9fa-ce34-4b27-a961-72fab5206ab6')).toEqual(
      expected['10f9e9fa-ce34-4b27-a961-72fab5206ab6']
    );
  });
});
