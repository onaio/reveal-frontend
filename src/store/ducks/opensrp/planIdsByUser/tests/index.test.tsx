import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  fetchPlansByUser,
  makePlansByUserNamesSelector,
  reducerName,
  removePlansWithUser,
} from '..';
import { PlanDefinition } from '../../../../../configs/settings';
import store from '../../../../../store';
import * as fixtures from '../../PlanDefinition/tests/fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/opensrp/PlanDefinition.reselect.userNameFilter', () => {
  let flushThunks;
  const getPlanIdsByUserName = makePlansByUserNamesSelector();

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removePlansWithUser());
  });

  it('should have initial state', () => {
    const state = store.getState();
    expect(getPlanIdsByUserName(state, {})).toEqual(null);
    expect(getPlanIdsByUserName(state, { userName: 'random' })).toEqual([]);
  });

  it('userName filter works correctly', () => {
    const sampleUserName = 'user';
    store.dispatch(fetchPlansByUser(fixtures.plans as PlanDefinition[], sampleUserName));
    expect(getPlanIdsByUserName(store.getState(), { userName: 'nonExistent' })).toEqual([]);
    expect(getPlanIdsByUserName(store.getState(), { userName: sampleUserName })).toEqual([
      '356b6b84-fc36-4389-a44a-2b038ed2f38d',
      '8fa7eb32-99d7-4b49-8332-9ecedd6d51ae',
      'f0558ad1-396d-4d97-9fff-c46cf92b6ce6',
      '0e85c238-39c1-4cea-a926-3d89f0c98429',
      'f3da140c-2d2c-4bf7-8189-c2349f143a72',
      '043fc8cb-0459-4b39-b71c-abc15f13a5dd',
    ]);
    // dispatch call (x1) should not overwrite the work done by dispatch call x.
    const anotherUserName = 'user2';
    store.dispatch(fetchPlansByUser([fixtures.plans[0]] as PlanDefinition[], anotherUserName));
    expect(getPlanIdsByUserName(store.getState(), { userName: anotherUserName })).toEqual([
      '356b6b84-fc36-4389-a44a-2b038ed2f38d',
    ]);
    expect(getPlanIdsByUserName(store.getState(), { userName: sampleUserName })).toEqual([
      '356b6b84-fc36-4389-a44a-2b038ed2f38d',
      '8fa7eb32-99d7-4b49-8332-9ecedd6d51ae',
      'f0558ad1-396d-4d97-9fff-c46cf92b6ce6',
      '0e85c238-39c1-4cea-a926-3d89f0c98429',
      'f3da140c-2d2c-4bf7-8189-c2349f143a72',
      '043fc8cb-0459-4b39-b71c-abc15f13a5dd',
    ]);
  });

  it('removes planDefinitions correctly', () => {
    expect(getPlanIdsByUserName(store.getState(), {})).toEqual(null);
    expect(getPlanIdsByUserName(store.getState(), { userName: 'user' })).toEqual([]);
  });
});
