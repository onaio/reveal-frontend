import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../..';
import { InterventionType } from '../../plans';
import reducer, {
  fetchMDAPointPlans,
  getMDAPointPlanById,
  getMDAPointPlansArray,
  getMDAPointPlansArrayByTitle,
  getMDAPointPlansById,
  makeMDAPointPlansArraySelector,
  MDAPointPlan,
  reducerName,
  removeMDAPointPlans,
} from '../MDAPointPlans';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/MDAPoint/MDAPointPlan', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getMDAPointPlansArray(store.getState())).toEqual([]);
    expect(getMDAPointPlanById(store.getState(), '356b6b84-fc36-4389-a44a-2b038ed2f38d')).toEqual(
      null
    );
    expect(getMDAPointPlansById(store.getState())).toEqual({});
  });

  it('Fetches plan definitions correctly', () => {
    // action creators dispatch
    store.dispatch(fetchMDAPointPlans(fixtures.MDAPointplans as MDAPointPlan[]));

    expect(getMDAPointPlansById(store.getState())).toEqual(
      keyBy(fixtures.MDAPointplans, 'plan_id')
    );

    expect(getMDAPointPlansArray(store.getState())).toEqual(fixtures.MDAPointplans);

    expect(getMDAPointPlanById(store.getState(), '40357eff-81b6-4e32-bd3d-484019689f7c')).toEqual(
      fixtures.MDAPointplans[0]
    );

    // filter by intervention type
    expect(getMDAPointPlansArray(store.getState(), InterventionType.MDAPoint)).toEqual([
      fixtures.MDAPointplans[0],
      fixtures.MDAPointplans[1],
      fixtures.MDAPointplans[2],
    ]);

    expect(getMDAPointPlansById(store.getState(), InterventionType.MDAPoint)).toEqual(
      keyBy(
        [fixtures.MDAPointplans[0], fixtures.MDAPointplans[1], fixtures.MDAPointplans[2]],
        'plan_id'
      )
    );

    // RESELECT TESTS
    const titleFilter = {
      plan_title: 'Berg',
    };
    const titleUpperFilter = {
      plan_title: 'BERG',
    };

    const MDAPointPlansArraySelector = makeMDAPointPlansArraySelector();
    expect(getMDAPointPlansArrayByTitle()(store.getState(), titleFilter)).toEqual([
      fixtures.MDAPointplans[2],
    ]);
    expect(getMDAPointPlansArrayByTitle()(store.getState(), titleUpperFilter)).toEqual([
      fixtures.MDAPointplans[2],
    ]);
    expect(MDAPointPlansArraySelector(store.getState(), { plan_title: 'Berg' })).toEqual([
      fixtures.MDAPointplans[2],
    ]);
    expect(MDAPointPlansArraySelector(store.getState(), { statusList: ['retired'] })).toEqual([
      fixtures.MDAPointplans[0],
    ]);
    expect(MDAPointPlansArraySelector(store.getState(), { statusList: ['draft'] })).toEqual([]);
    expect(
      MDAPointPlansArraySelector(store.getState(), { statusList: ['active'], plan_title: 'mda' })
    ).toEqual([fixtures.MDAPointplans[1]]);
    // reset
    store.dispatch(removeMDAPointPlans());
    expect(getMDAPointPlansArray(store.getState())).toEqual([]);
  });

  it('Fetching plans does not replace MDAPointPlansById', () => {
    // fetch two plan definition objects
    store.dispatch(
      fetchMDAPointPlans([fixtures.MDAPointplans[0], fixtures.MDAPointplans[1]] as MDAPointPlan[])
    );
    // we should have them in the store
    expect(getMDAPointPlansArray(store.getState())).toEqual([
      fixtures.MDAPointplans[0],
      fixtures.MDAPointplans[1],
    ]);
    // fetch one more plan definition objects
    store.dispatch(fetchMDAPointPlans([fixtures.MDAPointplans[2]] as MDAPointPlan[]));
    // we should now have a total of three plan definition objects in the store
    expect(getMDAPointPlansArray(store.getState())).toEqual([
      fixtures.MDAPointplans[0],
      fixtures.MDAPointplans[1],
      fixtures.MDAPointplans[2],
    ]);
  });
});
