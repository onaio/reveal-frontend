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

describe('reducers/plans', () => {
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
    const expected = keyBy(fixtures.plans, (plan: Plan) => plan.id);
    expect(getPlansById(store.getState())).toEqual(expected);
    expect(getPlansIdArray(store.getState())).toEqual(['ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f']);
    expect(getPlansArray(store.getState())).toEqual(values(expected));
    expect(getPlanById(store.getState(), 'ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f')).toEqual(
      expected['ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f']
    );
  });
});
