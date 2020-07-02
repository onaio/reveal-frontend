import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  fetchTree,
  getCurrentChildren,
  getCurrentParentNode,
  reducerName,
  setCurrentParentId,
} from '..';
import store from '../../../../index';
import { fetchTasks } from '../../../tasks';
import * as fixtures from '../../../tests/fixtures';
import {
  fetchOrganizations,
  getOrganizationsArray,
  removeOrganizationsAction,
} from '../../organizations';
import { sampleHierarchy } from './fixtures';

reducerRegistry.register(reducerName, reducer);

const childrenSelector = getCurrentChildren();
const parentNodeSelector = getCurrentParentNode();

describe('reducers/opensrp/hierarchies', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    // what do we expect returned from selectors for an unpopulated store
    expect(childrenSelector(store.getState(), { rootJurisdictionId: '' })).toEqual([]);
    expect(parentNodeSelector(store.getState(), { rootJurisdictionId: '' })).toBeUndefined();
  });

  it('should fetch households', () => {
    // checking that dispatching actions has desired effect
    const filters = {
      rootJurisdictionId: '2942',
    };
    store.dispatch(fetchTree(sampleHierarchy));
    expect(childrenSelector(store.getState(), filters)).toEqual([]);
    expect(parentNodeSelector(store.getState(), filters)).toBeUndefined();

    store.dispatch(setCurrentParentId('2942', '2942'));

    expect(childrenSelector(store.getState(), filters).length).toEqual(1);
    expect(parentNodeSelector(store.getState(), filters)!.model.label).toEqual('Lusaka');
  });
});
