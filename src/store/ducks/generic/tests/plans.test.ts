import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import store from '../../..';
import { InterventionType } from '../../plans';
import reducer, {
  genericFetchPlans,
  genericRemovePlans,
  getPlanByIdSelector,
  getPlansArrayByTitle,
  makeGenericPlansArraySelector,
  reducerName,
} from '../plans';
import { GenericPlan } from '../plans';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

const MDAInterventionType = InterventionType.DynamicMDA;
const plansSelector = makeGenericPlansArraySelector();
const defaultProps = {};

describe('reducers/MDA/Dynami-MDAPlan', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(plansSelector(store.getState(), defaultProps)).toEqual([]);
    expect(getPlanByIdSelector(store.getState(), '356b6b84-fc36-4389-a44a-2b038ed2f38d')).toEqual(
      null
    );
  });

  it('Fetches plan definitions correctly', () => {
    // action creators dispatch
    store.dispatch(genericFetchPlans(fixtures.DynamicMDAPlans as GenericPlan[]));

    expect(getPlanByIdSelector(store.getState(), '40357eff-81b6-4e32-bd3d-484019689f7c')).toEqual(
      fixtures.DynamicMDAPlans[0]
    );

    // RESELECT TESTS
    const titleFilter = {
      interventionTypes: [MDAInterventionType],
      plan_title: 'Berg',
    };
    const titleUpperFilter = {
      interventionTypes: [MDAInterventionType],
      plan_title: 'BERG',
    };

    expect(getPlansArrayByTitle()(store.getState(), titleFilter)).toEqual([
      fixtures.DynamicMDAPlans[2],
    ]);
    expect(getPlansArrayByTitle()(store.getState(), titleUpperFilter)).toEqual([
      fixtures.DynamicMDAPlans[2],
    ]);
    expect(
      plansSelector(store.getState(), {
        interventionTypes: [MDAInterventionType],
        statusList: ['retired'],
      })
    ).toEqual([fixtures.DynamicMDAPlans[0]]);
    expect(
      plansSelector(store.getState(), {
        interventionTypes: [MDAInterventionType],
        statusList: ['draft'],
      })
    ).toEqual([]);
    expect(
      plansSelector(store.getState(), {
        interventionTypes: [MDAInterventionType],
        plan_title: 'mda',
        statusList: ['active'],
      })
    ).toEqual([fixtures.DynamicMDAPlans[1]]);
    // reset
    store.dispatch(genericRemovePlans());
    expect(plansSelector(store.getState(), defaultProps)).toEqual([]);
  });

  it('Fetching plans does not replace GenericPlansById', () => {
    // fetch two plan definition objects
    store.dispatch(
      genericFetchPlans([fixtures.DynamicMDAPlans[0], fixtures.DynamicMDAPlans[1]] as GenericPlan[])
    );
    // we should have them in the store
    expect(plansSelector(store.getState(), defaultProps)).toEqual([
      fixtures.DynamicMDAPlans[0],
      fixtures.DynamicMDAPlans[1],
    ]);
    // fetch one more plan definition objects
    store.dispatch(genericFetchPlans([fixtures.DynamicMDAPlans[2]] as GenericPlan[]));
    // we should now have a total of three plan definition objects in the store
    expect(plansSelector(store.getState(), defaultProps)).toEqual([
      fixtures.DynamicMDAPlans[0],
      fixtures.DynamicMDAPlans[1],
      fixtures.DynamicMDAPlans[2],
    ]);
  });
});

describe('reducer: generic reducers', () => {
  let flushThunks;
  const selector = makeGenericPlansArraySelector();

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('fetches plans correctly', () => {
    // the target to is to make sure that the returned plans respects the intervention type
    // dispatch all 3 plan types: IRS, DynamicIRS, DynamicMDA, MdaPointPlans
    const allPlans = [
      ...fixtures.plans,
      fixtures.DynamicMDAPlans,
      fixtures.MDAPointPlans,
    ] as GenericPlan[];
    store.dispatch(genericFetchPlans(allPlans));

    // we will look for an IRS plan using different intervention types

    const state = store.getState();
    let response = selector(state, {
      interventionTypes: [InterventionType.IRS],
      // using plan_title somewhat like na id
      plan_title: 'MegaMind',
    });

    expect(response).toEqual([]);

    // now check again using dynamic IRS intervention type
    response = selector(state, {
      interventionTypes: [InterventionType.DynamicIRS],
      // using plan_title somewhat like na id
      plan_title: 'MegaMind',
    });
    expect(response).toEqual([fixtures.plans[3]]);
    // this will also return correct plan when there is no intervention type
    response = selector(state, {
      plan_title: 'MegaMind',
    });
    expect(response).toEqual([fixtures.plans[3]]);

    // what if we checked using DynamicMDA
    response = selector(state, {
      interventionTypes: [InterventionType.DynamicMDA],
      plan_title: 'MegaMind',
    });
    expect(response).toEqual([]);

    response = selector(state, {
      interventionTypes: [InterventionType.MDAPoint],
      plan_title: 'MegaMind',
    });
    expect(response).toEqual([]);
  });
});
