import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  autoSelectNodes,
  deforest,
  deselectNode,
  fetchTree,
  getAllSelectedNodes,
  getCurrentChildren,
  getCurrentParentNode,
  getNodeById,
  reducerName,
  selectNode,
  setCurrentParentId,
} from '..';
import store from '../../../../index';
import { TreeNode } from '../types';
import { nodeIsSelected } from '../utils';
import { sampleHierarchy } from './fixtures';

reducerRegistry.register(reducerName, reducer);

const childrenSelector = getCurrentChildren();
const parentNodeSelector = getCurrentParentNode();
const nodeSelector = getNodeById();

describe('reducers/opensrp/hierarchies', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(deforest());
  });

  it('should have initial state', () => {
    // what do we expect returned from selectors for an unpopulated store
    expect(childrenSelector(store.getState(), { rootJurisdictionId: '' })).toEqual([]);
    expect(parentNodeSelector(store.getState(), { rootJurisdictionId: '' })).toBeUndefined();
  });

  it('should fetch tree', () => {
    // checking that dispatching actions has desired effect
    const filters = {
      rootJurisdictionId: '2942',
    };
    store.dispatch(fetchTree(sampleHierarchy));
    // when the parent node is undefined; current children is set to an array of the rootNode
    expect(childrenSelector(store.getState(), filters).length).toEqual(1);
    expect(parentNodeSelector(store.getState(), filters)).toBeUndefined();

    store.dispatch(setCurrentParentId('2942', '2942'));

    expect(childrenSelector(store.getState(), filters).length).toEqual(1);
    expect(parentNodeSelector(store.getState(), filters)!.model.label).toEqual('Lusaka');
  });

  it('selecting & unselecting a node works', () => {
    // checking that dispatching actions has desired effect
    const rootJurisdictionId = '2942';
    const filters = {
      rootJurisdictionId,
    };
    store.dispatch(fetchTree(sampleHierarchy));
    store.dispatch(selectNode(rootJurisdictionId, '2942'));
    let node = nodeSelector(store.getState(), { ...filters, nodeId: '2942' });

    expect(nodeIsSelected(node!)).toBeTruthy();

    store.dispatch(deselectNode(rootJurisdictionId, '2942'));
    node = nodeSelector(store.getState(), { ...filters, nodeId: '2942' });
    expect(nodeIsSelected(node!)).toBeFalsy();
  });

  it('auto selecting nodes works', () => {
    // checking that dispatching actions has desired effect
    const rootJurisdictionId = '2942';
    const nodeIdToAutoSelect = '3951';
    const callback = (node: TreeNode) => node.model.id === nodeIdToAutoSelect;
    const filters = {
      rootJurisdictionId,
    };
    store.dispatch(fetchTree(sampleHierarchy));
    store.dispatch(autoSelectNodes(rootJurisdictionId, callback));

    // all nodes should be selected due cascade effect, there is only one path and the
    // child is selected

    const tree = nodeSelector(store.getState(), { ...filters, nodeId: rootJurisdictionId });

    tree!.walk(node => {
      expect(nodeIsSelected(node)).toBeTruthy();
      // this is a matter of formality has nothing to do with the test
      return true;
    });

    let allSelected = getAllSelectedNodes()(store.getState(), {
      leafNodesOnly: false,
      rootJurisdictionId,
    });
    expect(allSelected.length).toEqual(3);
    allSelected = getAllSelectedNodes()(store.getState(), {
      leafNodesOnly: true,
      rootJurisdictionId,
    });
    expect(allSelected.length).toEqual(1);
  });
});
