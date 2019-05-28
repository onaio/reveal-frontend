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
    expect(getPlansIdArray(store.getState())).toEqual([
      'ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f',
      'plan-id-2',
    ]);
    expect(getPlansArray(store.getState())).toEqual(values(expected));
    expect(getPlanById(store.getState(), 'ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f')).toEqual(
      expected['ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f']
    );
  });

  it('should save plans correctly', () => {
    store.dispatch(fetchPlans([fixtures.plan3] as any));
    const plan3FromStore = getPlanById(store.getState(), '1502e539');
    expect(plan3FromStore).not.toBeNull();
    if (plan3FromStore) {
      expect(plan3FromStore.jurisdiction_path).toEqual([
        '9c3c2db4-bddd-44c5-870a-a0eef539e4da',
        '1d16510a-4ae1-453d-9c55-60d966818f47',
        '872cc59e-0bce-427a-bd1f-6ef674dba8e2',
        'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
      ]);
      expect(plan3FromStore.jurisdiction_name_path).toEqual([
        'Lop Buri',
        'District Tha Luang',
        'Canton Tha Luang',
        'Tha Luang Village 1',
      ]);
      expect(plan3FromStore).toEqual(fixtures.plan3);
    }
  });
});
