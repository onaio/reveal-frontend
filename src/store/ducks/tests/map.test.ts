import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import { getAdminLevelIndex, reducer, reducerName, updateAdminLevelIndex } from '../map';

reducerRegistry.register(reducerName, reducer);

describe('reducers/map', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });
  it('should have initial state', () => {
    expect(getAdminLevelIndex(store.getState())).toEqual(0);
  });

  it('Updates Admin level index correctly', () => {
    // action creators dispatch
    store.dispatch(updateAdminLevelIndex(5));
    expect(getAdminLevelIndex(store.getState())).toEqual(5);
  });
});
