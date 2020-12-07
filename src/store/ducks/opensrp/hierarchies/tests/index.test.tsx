import reducerRegistry from '@onaio/redux-reducer-registry';
import { cloneDeep } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  autoSelectNodes,
  deforest,
  deselectAllNodes,
  deselectNode,
  fetchTree,
  Filters,
  getAllSelectedNodes,
  getAncestors,
  getCurrentChildren,
  getCurrentParentNode,
  getNodeById,
  getNodesInSelectedTree,
  getRootByNodeId,
  getSelectedHierarchy,
  getStructuresCount,
  getTreeById,
  reducerName,
  selectNode,
} from '..';
import store from '../../../../index';
import { TreeNode } from '../types';
import { generateJurisdictionTree, nodeIsSelected } from '../utils';
import { anotherHierarchy, raZambiaHierarchy, sampleHierarchy } from './fixtures';

reducerRegistry.register(reducerName, reducer);

const childrenSelector = getCurrentChildren();
const parentNodeSelector = getCurrentParentNode();
const nodeSelector = getNodeById();
const rootSelector = getRootByNodeId();
const ancestorSelector = getAncestors();
const treeByIdSelector = getTreeById();
const selectedHierarchySelector = getSelectedHierarchy();
const selectedNodesSelector = getNodesInSelectedTree();
const planId = 'randomPlanId';

let flushThunks;

describe('reducers/opensrp/hierarchies', () => {
  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(deforest());
  });

  it('should have initial state', () => {
    // what do we expect returned from selectors for an unpopulated store
    expect(childrenSelector(store.getState(), { rootJurisdictionId: '', planId })).toEqual([]);
    expect(
      parentNodeSelector(store.getState(), { rootJurisdictionId: '', planId })
    ).toBeUndefined();
  });

  it('works with custom tree id', () => {
    store.dispatch(fetchTree(sampleHierarchy, '1337'));
    expect(treeByIdSelector(store.getState(), { rootJurisdictionId: '1337', planId })).toEqual(
      generateJurisdictionTree(sampleHierarchy)
    );
  });

  it('should fetch tree', () => {
    // checking that dispatching actions has desired effect
    let filters: Filters = {
      planId,
      rootJurisdictionId: '2942',
    };
    store.dispatch(fetchTree(sampleHierarchy));
    // when the parent node is undefined; current children is set to an array of the rootNode
    expect(childrenSelector(store.getState(), filters).length).toEqual(1);
    const parentNode = parentNodeSelector(store.getState(), filters);
    if (!parentNode) {
      fail();
    }
    expect(parentNode.model.id).toEqual('2942');

    filters = {
      ...filters,
      currentParentId: '2942',
    };

    expect(childrenSelector(store.getState(), filters).length).toEqual(1);

    const node = parentNodeSelector(store.getState(), filters);
    if (!node) {
      fail();
    }
    expect(node.model.label).toEqual('Lusaka');
  });

  it('selecting & unselecting a node works', () => {
    // checking that dispatching actions has desired effect
    const rootJurisdictionId = '2942';
    const filters = {
      planId,
      rootJurisdictionId,
    };
    store.dispatch(fetchTree(sampleHierarchy));
    store.dispatch(selectNode(rootJurisdictionId, '2942', planId));
    let node = nodeSelector(store.getState(), { ...filters, nodeId: '2942' });
    if (!node) {
      fail();
    }
    expect(nodeIsSelected(node)).toBeTruthy();

    store.dispatch(deselectNode(rootJurisdictionId, '2942', planId));
    node = nodeSelector(store.getState(), { ...filters, nodeId: '2942' });
    if (!node) {
      fail();
    }
    expect(nodeIsSelected(node)).toBeFalsy();
  });

  it('selecting & unselecting a node works across plans', () => {
    // select a node for a certain plan see if it will be selected for another plan
    const rootJurisdictionId = '2942';
    const filters = {
      planId: 'another plan',
      rootJurisdictionId,
    };
    store.dispatch(fetchTree(sampleHierarchy));
    store.dispatch(selectNode(rootJurisdictionId, '2942', planId));
    let node = nodeSelector(store.getState(), { ...filters, nodeId: '2942' });
    if (!node) {
      fail();
    }

    expect(nodeIsSelected(node)).toBeFalsy();

    // lets change the selector filters back to the actual plan that we register selectNodes action under
    const correctFilters = {
      ...filters,
      planId,
    };

    node = nodeSelector(store.getState(), { ...correctFilters, nodeId: '2942' });
    if (!node) {
      fail();
    }
    expect(nodeIsSelected(node)).toBeTruthy();
  });

  it('auto selecting nodes works', () => {
    // checking that dispatching actions has desired effect
    const rootJurisdictionId = '2942';
    const nodeIdToAutoSelect = '2942';
    const callback = (node: TreeNode) => node.model.id === nodeIdToAutoSelect;
    const filters = {
      planId,
      rootJurisdictionId,
    };
    store.dispatch(fetchTree(sampleHierarchy));
    store.dispatch(autoSelectNodes(rootJurisdictionId, callback, planId));

    // all nodes should be selected due cascade effect, there is only one path and the
    // child is selected

    const tree = nodeSelector(store.getState(), { ...filters, nodeId: rootJurisdictionId });
    if (!tree) {
      fail();
    }

    expect(nodeIsSelected(tree)).toBeTruthy();

    let allSelected = getAllSelectedNodes()(store.getState(), {
      ...filters,
      leafNodesOnly: false,
    });
    expect(allSelected.length).toEqual(3);
    allSelected = getAllSelectedNodes()(store.getState(), {
      leafNodesOnly: true,
      ...filters,
    });
    expect(allSelected.length).toEqual(1);
  });

  it('can hold multiple trees', () => {
    store.dispatch(fetchTree(sampleHierarchy));
    store.dispatch(fetchTree(anotherHierarchy));
    expect(Object.keys(store.getState().hierarchy.treeByRootId)).toEqual(['1337', '2942']);
  });

  it('can find rootId given a node', () => {
    store.dispatch(fetchTree(sampleHierarchy));
    store.dispatch(fetchTree(anotherHierarchy));
    const filters = {
      nodeId: '3951',
      rootJurisdictionId: '',
    };
    expect(rootSelector(store.getState(), filters)).toEqual('2942');
    expect(rootSelector(store.getState(), { rootJurisdictionId: '999', nodeId: '7331' })).toEqual(
      '999'
    );
    expect(rootSelector(store.getState(), { ...filters, nodeId: '7331' })).toEqual('1337');
    expect(rootSelector(store.getState(), { ...filters, nodeId: '?' })).toBeUndefined();
  });

  it('getAncestors works', () => {
    store.dispatch(fetchTree(sampleHierarchy));
    store.dispatch(fetchTree(anotherHierarchy));
    const filters: Filters = {
      nodeId: '3951',
      rootJurisdictionId: '',
    };
    expect(ancestorSelector(store.getState(), filters).map(n => n.model.id)).toEqual([
      '2942',
      '3019',
      '3951',
    ]);
    expect(
      ancestorSelector(store.getState(), { ...filters, nodeId: '7331' }).map(n => n.model.id)
    ).toEqual(['1337', '7331']);
    expect(
      ancestorSelector(store.getState(), { ...filters, nodeId: '2942' }).map(n => n.model.id)
    ).toEqual(['2942']);
    expect(ancestorSelector(store.getState(), { ...filters, nodeId: '?' })).toEqual([]);
    expect(
      ancestorSelector(store.getState(), { rootJurisdictionId: '2942', nodeId: '3019' }).map(
        n => n.model.id
      )
    ).toEqual(['2942', '3019']);
  });

  it('can create a hierarchy of selected jurisdictions', () => {
    // select a node and see if after computing the selected hierarchy it is as expected

    store.dispatch(fetchTree(raZambiaHierarchy));

    const rootJurisdictionId = '0ddd9ad1-452b-4825-a92a-49cb9fc82d18';
    const raCDZ139AId = 'cd5ec29e-6be9-41a2-9b88-bc81fbc691c6';

    // we will select a single node at the very bottom -> //ra_CDZ_139a
    store.dispatch(selectNode(rootJurisdictionId, raCDZ139AId, planId, ''));

    // get the selected hierarchy.
    const selectedTree = selectedHierarchySelector(store.getState(), {
      planId,
      rootJurisdictionId,
    });
    if (!selectedTree) {
      fail();
    }

    expect(selectedTree.model.id).toEqual(rootJurisdictionId);

    // here we create a manual path of ids : we want to check that the
    // ids of all jurisdictions in the ra_CDZ_139s path remain as they should be
    const expected = [
      '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
      '615dcd30-cc67-4f6b-812f-90da37f4a911',
      'd7d22c6d-f02f-4631-bebd-21fecc111ddc',
      'a185de87-b77b-4b8a-9570-0cb3843fafde',
      'cd5ec29e-6be9-41a2-9b88-bc81fbc691c6',
    ];
    const raCDZ139ANode = selectedTree.first(node => node.model.id === raCDZ139AId);
    if (!raCDZ139ANode) {
      fail();
    }
    const received = raCDZ139ANode.getPath().map(node => node.model.id);
    expect(received).toEqual(expected);

    // finally : how many nodes are there in the whole tree.
    const numberOfNodes = selectedTree.all(node => !!node).length;
    expect(numberOfNodes).toEqual(expected.length);

    // also maybe check we have not mutated the existing tree in the process
    const origTree = treeByIdSelector(store.getState(), { rootJurisdictionId });
    if (!origTree) {
      fail();
    }
    const nodesNumOriginally = origTree.all(node => !!node).length;
    expect(nodesNumOriginally).toEqual(64);
  });

  it('getStructuresCount works', () => {
    // should be able to select then deselect using deselect action
    const structureCountSelector = getStructuresCount();
    const rootJurisdictionId = '2942';
    const filters = {
      planId,
      rootJurisdictionId,
    };

    const testHierarchy = cloneDeep(sampleHierarchy);

    // Add a node that does not have the structureCount field
    (testHierarchy as any).locationsHierarchy.map['2942'].children['3019'].children['1337'] = {
      id: '1337',
      label: 'No structure count',
      node: {
        attributes: {
          // missing structureCount
          geographicLevel: 2,
        },
        locationId: '1337',
        name: 'No structure count',
        parentLocation: {
          locationId: '3019',
          voided: false,
        },
        voided: false,
      },
      parent: '3019',
    };

    store.dispatch(fetchTree(testHierarchy));

    /** This function generates the callback function  */
    const getCallback = (ids: string[]) => {
      return (node: TreeNode, jurisdictionsIds: string[] = ids) => {
        const isLeafNodePastThreshHold =
          !node.hasChildren() && jurisdictionsIds.includes(node.model.id);
        return isLeafNodePastThreshHold;
      };
    };

    // should just work nicely
    store.dispatch(
      autoSelectNodes(rootJurisdictionId, getCallback(['3951']), planId, 'Auto-Selection')
    );
    expect(structureCountSelector(store.getState(), filters)).toEqual(159);

    // should still work even when the tree node does not have a structureCount property
    store.dispatch(
      autoSelectNodes(rootJurisdictionId, getCallback(['1337']), planId, 'Auto-Selection')
    );
    expect(structureCountSelector(store.getState(), filters)).toEqual(0);
  });

  it('deselects nodes correctly', () => {
    // should be able to select then deselect using deselect action
    const rootJurisdictionId = '2942';
    const callback = () => true;
    const filters = {
      currentParentId: rootJurisdictionId,
      planId,
      rootJurisdictionId,
    };
    store.dispatch(fetchTree(sampleHierarchy));
    store.dispatch(autoSelectNodes(rootJurisdictionId, callback, planId));

    const tree = selectedHierarchySelector(store.getState(), filters);
    if (!tree) {
      fail();
    }

    const { parentNode, childrenNodes } = selectedNodesSelector(store.getState(), filters);

    [parentNode, ...childrenNodes].forEach(node => {
      expect(nodeIsSelected(node)).toBeTruthy();
    });

    // dispatch deselect
    store.dispatch(deselectAllNodes(rootJurisdictionId));

    const res = selectedNodesSelector(store.getState(), filters);

    expect(res.parentNode).toBeUndefined();
    expect(res.childrenNodes).toEqual([]);
  });
});
