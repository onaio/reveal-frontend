import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../..';
import { InterventionType } from '../../plans';
import reducer, {
  addIRSPlan,
  fetchIRSPlans,
  GenericPlan,
  getIRSPlanById,
  getIRSPlansArray,
  getIRSPlansArrayByTitle,
  getIRSPlansById,
  makeIRSPlansArraySelector,
  reducerName,
  removeIRSPlans,
} from '../plans';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/IRS/IRSPlan', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getIRSPlansArray(store.getState())).toEqual([]);
    expect(getIRSPlanById(store.getState(), '356b6b84-fc36-4389-a44a-2b038ed2f38d')).toEqual(null);
    expect(getIRSPlansById(store.getState())).toEqual({});
  });

  it('Fetches plan definitions correctly', () => {
    // action creators dispatch
    store.dispatch(fetchIRSPlans(fixtures.plans as GenericPlan[]));

    expect(getIRSPlansById(store.getState())).toEqual(keyBy(fixtures.plans, 'plan_id'));

    expect(getIRSPlansArray(store.getState())).toEqual(fixtures.plans);

    expect(getIRSPlanById(store.getState(), '727c3d40-e118-564a-b231-aac633e6abce')).toEqual(
      fixtures.plans[0]
    );

    // filter by intervention type
    expect(getIRSPlansArray(store.getState(), InterventionType.IRS)).toEqual([
      fixtures.plans[0],
      fixtures.plans[1],
      fixtures.plans[2],
    ]);
    expect(getIRSPlansArray(store.getState(), InterventionType.FI)).toEqual([]);

    expect(getIRSPlansById(store.getState(), InterventionType.FI)).toEqual({});
    expect(getIRSPlansById(store.getState(), InterventionType.IRS)).toEqual(
      keyBy([fixtures.plans[0], fixtures.plans[1], fixtures.plans[2]], 'plan_id')
    );

    // RESELECT TESTS
    const titleFilter = {
      plan_title: 'Berg',
    };
    const titleUpperFilter = {
      plan_title: 'BERG',
    };
    const IRSPlansArraySelector = makeIRSPlansArraySelector();
    expect(getIRSPlansArrayByTitle()(store.getState(), titleFilter)).toEqual([fixtures.plans[2]]);
    expect(getIRSPlansArrayByTitle()(store.getState(), titleUpperFilter)).toEqual([
      fixtures.plans[2],
    ]);
    expect(IRSPlansArraySelector(store.getState(), { plan_title: 'Berg' })).toEqual([
      fixtures.plans[2],
    ]);
    expect(IRSPlansArraySelector(store.getState(), { statusList: ['retired'] })).toEqual([
      fixtures.plans[0],
    ]);
    expect(IRSPlansArraySelector(store.getState(), { statusList: ['draft'] })).toEqual([]);
    expect(
      IRSPlansArraySelector(store.getState(), { statusList: ['active'], plan_title: 'irs' })
    ).toEqual([fixtures.plans[1]]);
    // reset
    store.dispatch(removeIRSPlans());
    expect(getIRSPlansArray(store.getState())).toEqual([]);
  });

  it('Fetching plans does not replace IRSPlansById', () => {
    // fetch two plan definition objects
    store.dispatch(fetchIRSPlans([fixtures.plans[0], fixtures.plans[1]] as GenericPlan[]));
    // we should have them in the store
    expect(getIRSPlansArray(store.getState())).toEqual([fixtures.plans[0], fixtures.plans[1]]);
    // fetch one more plan definition objects
    store.dispatch(fetchIRSPlans([fixtures.plans[2]] as GenericPlan[]));
    // we should now have a total of three plan definition objects in the store
    expect(getIRSPlansArray(store.getState())).toEqual([
      fixtures.plans[0],
      fixtures.plans[1],
      fixtures.plans[2],
    ]);
  });

  it('You can add one plan definition object to the store', () => {
    // reset
    store.dispatch(removeIRSPlans());

    // add one plan definition objects
    store.dispatch(addIRSPlan(fixtures.plans[2] as GenericPlan));
    // we should have it in the store
    expect(getIRSPlansArray(store.getState())).toEqual([fixtures.plans[2]]);

    // fetch one more plan definition objects
    store.dispatch(addIRSPlan(fixtures.plans[1] as GenericPlan));
    // we should now have a total of three plan definition objects in the store
    expect(getIRSPlansArray(store.getState())).toEqual([fixtures.plans[2], fixtures.plans[1]]);

    // add an existing plan again
    store.dispatch(addIRSPlan(fixtures.plans[2] as GenericPlan));
    // nothing should have changed in the store
    // we should now have a total of three plan definition objects in the store
    expect(getIRSPlansArray(store.getState())).toEqual([fixtures.plans[2], fixtures.plans[1]]);
  });
});
