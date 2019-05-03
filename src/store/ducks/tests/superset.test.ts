import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, { authorizeSuperset, isAuthorized, reducerName, resetSuperset } from '../superset';

reducerRegistry.register(reducerName, reducer);

describe('reducers/superset', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(isAuthorized(store.getState())).toEqual(null);
  });

  it('should be able to authorize superset', () => {
    store.dispatch(authorizeSuperset(true));
    expect(isAuthorized(store.getState())).toEqual(true);
    store.dispatch(authorizeSuperset(false));
    expect(isAuthorized(store.getState())).toEqual(false);
  });

  it('should be able to reset authorization of superset', () => {
    store.dispatch(authorizeSuperset(true));
    expect(isAuthorized(store.getState())).toEqual(true);
    store.dispatch(resetSuperset());
    expect(isAuthorized(store.getState())).toEqual(null);
  });
});
