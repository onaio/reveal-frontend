import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import { FlushThunks } from 'redux-testkit';
import thunk from 'redux-thunk';
import users, { authenticateUser, isAuthenticated } from '../users';

describe('reducers/users', () => {
  let flushThunks;
  let store: Store;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    store = createStore(combineReducers({ users }), applyMiddleware(flushThunks, thunk));
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    // initially logged out
    expect(isAuthenticated(store.getState())).toBe(false);
  });

  it('should be able to do authentication', () => {
    // initially logged out
    expect(isAuthenticated(store.getState())).toBe(false);
    // call action to log in
    store.dispatch(authenticateUser(true));
    // now should BE authenticated
    expect(isAuthenticated(store.getState())).toBe(true);
    // call action to log out
    store.dispatch(authenticateUser(false));
    // now should NOT be authenticated
    expect(isAuthenticated(store.getState())).toBe(false);
  });
});
