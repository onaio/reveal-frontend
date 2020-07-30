/** store location hierarchy information
 * - should be able to add a tree model
 * - modify the tree model in a manner such that shallow comparison would yield false
 * - provide the selectors
 */

import { Dictionary } from '@onaio/utils';
import FlatToNested from 'flat-to-nested';
import { cloneDeep, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import TreeModel from 'tree-model';
import { SELECTION_REASON } from './constants';
import {
  AutoSelectCallback,
  Meta,
  ParsedHierarchySingleNode,
  RawOpenSRPHierarchy,
  TreeNode,
} from './types';
import {
  autoSelectNodesAndCascade,
  computeParentNodesSelection,
  computeSelectedNodes,
  findAParentNode,
  generateJurisdictionTree,
  getChildrenForNode,
  preOrderStructureCountComputation,
  setSelectOnNode,
} from './utils';

/** reducer name for hierarchy reducer */
export const reducerName = 'hierarchy';

// **************************** actions *****************************

/** action to add a tree to store */
export const TREE_FETCHED = 'opensrp/locations/hierarchy/TREE_FETCHED';

/** remove trees */
export const DEFOREST = 'opensrp/locations/hierarchy/DEFOREST';

/** TODO - there should be a generic version of this that adds any attribute to a node in the tree
 * there is just not enough time at the moment
 */

/** action to append/modify the selected attribute of a node
 */
export const SELECT_NODE = 'opensrp/locations/hierarchy/SELECT_NODE';
export const DESELECT_NODE = 'opensrp/locations/hierarchy/DESELECT_NODE';
export const DESELECT_ALL_NODES = 'opensrp/locations/hierarchy/DESELECT_ALL_NODES';

// /** action to auto-append/ auto-modify the selected attribute of nodes in a tree */
export const AUTO_SELECT_NODES = 'opensrp/locations/hierarchy/AUTO_SELECT_NODES';

/** describes action that adds a tree to store */
export interface FetchedTreeAction extends AnyAction {
  type: typeof TREE_FETCHED;
  treeByRootId: Dictionary<TreeNode>;
}

/** describes action to remove all trees */
export interface DeforestAction extends AnyAction {
  type: typeof DEFOREST;
  treeByRootId: {};
}

/** action to select a node  */
export interface SelectNodeAction extends AnyAction {
  type: typeof SELECT_NODE;
  nodeId: string;
  rootJurisdictionId: string;
  actionBy: string;
}

/** describes action to set the selected attribute of a node to false */
export interface DeselectNodeAction extends AnyAction {
  type: typeof DESELECT_NODE;
  nodeId: string;
  rootJurisdictionId: string;
  actionBy: string;
}

/** describes action to automate the node selection process */
export interface AutoSelectNodesAction extends AnyAction {
  type: typeof AUTO_SELECT_NODES;
  rootJurisdictionId: string;
  callback: AutoSelectCallback;
  actionBy: string;
}

/** describes an action to deselect or selected nodes in a tree */
export interface DeselectAllNodesAction extends AnyAction {
  type: typeof DESELECT_ALL_NODES;
  rootJurisdictionId: string;
  actionBy: string;
}

/** combined full action types | its a union */
export type TreeActionTypes =
  | FetchedTreeAction
  | SelectNodeAction
  | DeforestAction
  | DeselectNodeAction
  | AutoSelectNodesAction
  | DeselectAllNodesAction
  | AnyAction;

// **************************** action creators ****************************

/** action creator when adding a tree to store
 * @param apiResponse - the raw hierarchy as received from opensrp
 * @param treeId - the treeId to use while saving to the store
 */
export function fetchTree(
  apiResponse: RawOpenSRPHierarchy,
  treeId: string | null = null
): FetchedTreeAction {
  const tree = generateJurisdictionTree(apiResponse);
  return {
    treeByRootId: {
      [treeId ? treeId : tree.model.id]: tree,
    },
    type: TREE_FETCHED,
  };
}

/** action creator for when selecting a node
 * @param rootJurisdictionId - need to know the tree that should be modified
 * @param nodeId - the id of the node whose selected status should be changed
 */
export function selectNode(
  rootJurisdictionId: string,
  nodeId: string,
  actionBy: string = SELECTION_REASON.USER_CHANGE
): SelectNodeAction {
  return {
    actionBy,
    nodeId,
    rootJurisdictionId,
    type: SELECT_NODE,
  };
}

/** clear all the trees */
export function deforest(): DeforestAction {
  return {
    treeByRootId: {},
    type: DEFOREST,
  };
}

/** set the selected status of a node to false
 * @param rootJurisdictionId - so that we can know what tree to target
 * @param nodeId - the node whose selected status is going to be set to false
 */
export function deselectNode(
  rootJurisdictionId: string,
  nodeId: string,
  actionBy: string = SELECTION_REASON.USER_CHANGE
): DeselectNodeAction {
  return {
    actionBy,
    nodeId,
    rootJurisdictionId,
    type: DESELECT_NODE,
  };
}

/** sets nodes to selected based on calculation that you provide
 * @param rootJurisdictionId - to know what tree to target
 * @param callback - a function that dictates which nodes to be selected
 */
export function autoSelectNodes(
  rootJurisdictionId: string,
  callback: AutoSelectCallback,
  actionBy: string = SELECTION_REASON.USER_CHANGE
): AutoSelectNodesAction {
  return {
    actionBy,
    callback,
    rootJurisdictionId,
    type: AUTO_SELECT_NODES,
  };
}

/** deselects all nodes in a tree */
export function deselectAllNodes(
  rootId: string,
  actionBy: string = SELECTION_REASON.NOT_CHANGED
): DeselectAllNodesAction {
  return {
    actionBy,
    rootJurisdictionId: rootId,
    type: DESELECT_ALL_NODES,
  };
}

// **************************** medusa ****************************

/** The store's slice state */
export interface TreeState {
  metaData: Dictionary<Dictionary<Meta>>;
  treeByRootId: Dictionary<TreeNode> | {};
}

/** TODO - make immutable */
/** starting state */
export const initialState: TreeState = {
  metaData: {},
  treeByRootId: {},
};

// the reducer function
export default function reducer(state = initialState, action: TreeActionTypes) {
  const treesByIds = state.treeByRootId;
  const treeOfInterest = (treesByIds as Dictionary<TreeNode>)[action.rootJurisdictionId];

  const thisRootsMetaData = state.metaData[action.rootJurisdictionId] || {};

  const { nodeId, actionBy, callback } = action;

  switch (action.type) {
    case TREE_FETCHED:
      return {
        ...state,
        treeByRootId: { ...state.treeByRootId, ...action.treeByRootId },
      };

    case DEFOREST:
      return {
        ...state,
        treeByRootId: action.treeByRootId,
      };

    case SELECT_NODE:
      if (!treeOfInterest) {
        return state;
      }
      // compute and populate the metaData field
      const response = setSelectOnNode(treeOfInterest, nodeId, actionBy, true, false, true);

      if (!response.nodeOfInterest) {
        return state;
      }

      const extraMeta = computeParentNodesSelection(
        response.nodeOfInterest,
        action.actionBy,
        thisRootsMetaData
      );

      return {
        ...state,
        metaData: {
          ...state.metaData,
          [action.rootJurisdictionId]: {
            ...state.metaData[action.rootJurisdictionId],
            ...response.metaByJurisdiction,
            ...extraMeta,
          },
        },
      };

    case DESELECT_NODE:
      if (!treeOfInterest) {
        return state;
      }
      const res = setSelectOnNode(treeOfInterest, nodeId, actionBy, false, true, true);

      return {
        ...state,
        metaData: {
          ...state.metaData,
          [action.rootJurisdictionId]: {
            ...state.metaData[action.rootJurisdictionId],
            ...res.metaByJurisdiction,
          },
        },
      };

    case AUTO_SELECT_NODES:
      if (!treeOfInterest) {
        return state;
      }
      const metaByJurisdictionId = autoSelectNodesAndCascade(
        treeOfInterest,
        callback,
        actionBy,
        thisRootsMetaData
      );

      return {
        ...state,
        metaData: {
          ...state.metaData,
          [action.rootJurisdictionId]: {
            ...state.metaData[action.rootJurisdictionId],
            ...metaByJurisdictionId,
          },
        },
      };

    case DESELECT_ALL_NODES:
      return {
        ...state,
        metaData: {
          ...state.metaData,
          [action.rootJurisdictionId]: {},
        },
      };

    default:
      return state;
  }
}

// **************************** selectors ****************************

/** prop filters to customize selector queries */
export interface Filters {
  rootJurisdictionId: string /** specify which tree to act upon */;
  nodeId?: string /** target node with this id */;
  leafNodesOnly?: boolean /** specified when requesting for selected nodes, truthy returns leaf nodes */;
  currentParentId?: string /** to use when filtering current children */;
  selectedLeafNodes?: TreeNode[] /** to use when filtering from the selected leaves */;
  parentNode?: TreeNode /** to use when filtering from the selected leaves */;
}

/** retrieve the rootJurisdiction value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getRootJurisdictionId = (_: Partial<Store>, props: Filters) =>
  props.rootJurisdictionId;

/** retrieve the currentParentId value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getCurrentParentId = (_: Partial<Store>, props: Filters) => props.currentParentId;

/** retrieve the nodeId value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getNodeId = (_: Partial<Store>, props: Filters) => props.nodeId;

/** retrieve the leaf nodes only value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getLeafNodesOnly = (_: Partial<Store>, props: Filters) => props.leafNodesOnly;

/** gets all trees key'd by the rootNodes id
 * @param state - the store
 * @param _ -  the filterProps
 */
export const getTreesByIds = (state: Partial<Store>, _: Filters): Dictionary<TreeNode> =>
  (state as any)[reducerName].treeByRootId;

/** retrieve the parentNode ids key'd by the rootNodes ids
 * @param state - the store
 * @param _ -  the filterProps
 */
export const getMetaData = (state: Partial<Store>, _: Filters): Dictionary<Dictionary<Meta>> =>
  (state as any)[reducerName].metaData;

/** retrieve the tree using a rootNodes id
 * @param state - the store
 * @param props -  the filterProps
 */
export const getTreeById = () =>
  createSelector(getTreesByIds, getRootJurisdictionId, (treesByIds, rootId):
    | TreeNode
    | undefined => {
    return treesByIds[rootId];
  });

export const getMetaForTree = () => {
  return createSelector(getMetaData, getRootJurisdictionId, (metaData, rootId) => {
    return metaData[rootId] || {};
  });
};

/** combine tree with metaData */
export const getTreeWithMeta = () => {
  return createSelector(getTreeById(), getMetaForTree(), (origTree, metaForTree) => {
    // walk the tree and update meta field.
    if (!origTree) {
      return;
    }
    const treeClone = cloneDeep(origTree);
    treeClone.walk(node => {
      node.model.meta = metaForTree[node.model.id] ? metaForTree[node.model.id] : {};
      return true;
    });

    return treeClone;
  });
};

/** retrieve a node given the id
 * @param state - the store
 * @param props -  the filterProps
 */
export const getNodeById = () =>
  createSelector(getTreeWithMeta(), getNodeId, (tree, nodeId) => {
    if (!tree || !nodeId) {
      return;
    }
    const nodeOfInterest = tree.first(node => node.model.id === nodeId);
    return nodeOfInterest;
  });

/**
 * Get the root id given a node
 *
 * Note: If you pass in rootJurisdictionId then that is what will be returned
 * You should pass in rootJurisdictionId as '' when don't know it
 *
 * @param state - the store
 * @param props -  the filterProps
 */
export const getRootByNodeId = () =>
  createSelector(
    [getTreesByIds, getNodeId, getRootJurisdictionId],
    (trees, nodeId, rootJurisdictionId) => {
      if (!!rootJurisdictionId) {
        return rootJurisdictionId;
      }
      let nodeInTree;
      for (const [treeId, tree] of Object.entries(trees)) {
        nodeInTree = tree.first(node => {
          return node.model.id === nodeId;
        });
        if (nodeInTree !== undefined) {
          return treeId;
        }
      }
      return;
    }
  );

/**
 * Get the ancestors of a given node as an array - ordered starting with the root
 *
 * Note that you can either pass in rootJurisdictionId or '' if you don't know the root
 *
 * @param state - the store
 * @param props -  the filterProps
 */
export const getAncestors = () =>
  createSelector([getRootByNodeId(), getTreesByIds, getNodeId], (rootId, treesByIds, nodeId) => {
    if (rootId) {
      const tree = treesByIds[rootId];
      const thisNode = tree.first(node => node.model.id === nodeId);
      if (thisNode) {
        return thisNode.getPath();
      }
    }
    return [];
  });

/** caveat: parentId is dictated by the jurisdictionId in the url, if parentId is undefined
 * it means drilling down has not begun, so we return the root of the tree as the parentNode as
 * opposed to returning undefined
 */
/** retrieve the node designated as the current Parent id
 * @param state - the store
 * @param props -  the filterProps
 */
export const getCurrentParentNode = () =>
  createSelector(getTreeWithMeta(), getCurrentParentId, findAParentNode);

/** returns an array of current children
 * @param state - the store
 * @param props -  the filterProps
 */
export const getCurrentChildren = () => {
  return createSelector(getCurrentParentNode(), getChildrenForNode);
};

/** retrieves an array of all the selected nodes
 * @param state - the store
 * @param props -  the filterProps
 */
export const getAllSelectedNodes = () =>
  createSelector(getTreeWithMeta(), getLeafNodesOnly, computeSelectedNodes);

/** returns an array of all leaf nodes for a particular jurisdiction
 * @param state - the store
 * @param props -  the filterProps
 */
export const getLeafNodes = () =>
  createSelector(getTreeWithMeta(), tree => {
    const nodesList: TreeNode[] = [];
    if (!tree) {
      return [];
    }
    tree.walk(node => {
      const shouldAddNode = !node.hasChildren();
      if (shouldAddNode) {
        nodesList.push(node);
      }
      return true;
    });
    return nodesList;
  });

/** retrieve the parent node value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getParentNode = (_: Partial<Store>, props: Filters) => props.parentNode;

/** retrieve the leaf nodes only value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getSelectedLeafNodes = (_: Partial<Store>, props: Filters) => props.selectedLeafNodes;

/** returns an array of all the selected nodes from a specified node on the tree
 * @param state - the store
 * @param props -  the filterProps
 */
export const getSelectedNodesUnderParentNode = () =>
  createSelector(
    getParentNode,
    getSelectedLeafNodes,
    (tree: TreeNode | undefined, selectedLeafNodes: TreeNode[] | undefined): TreeNode[] => {
      const nodesList: TreeNode[] = [];
      if (!tree) {
        if (!selectedLeafNodes) {
          return nodesList;
        }
        return nodesList;
      }

      if (selectedLeafNodes) {
        tree.walk(node => {
          selectedLeafNodes.forEach(leaf => {
            if (leaf.model.id === node.model.id) {
              nodesList.push(leaf);
            }
          });
          return true;
        });
      }

      return nodesList;
    }
  );

/** returns the total structure count for all selected nodes in the entire tree
 * requires only the rootJurisdiction id
 * @param state -  the store state
 * @param {Pick<Filters, 'rootJurisdictionId'>} filters
 */
export const getStructuresCount = () =>
  createSelector(getTreeWithMeta(), tree => {
    const allSelectedLeafNodes = computeSelectedNodes(tree, true);
    const reducingFn = (acc: number, value: number) => acc + value;
    return allSelectedLeafNodes
      .map(node => node.model.node.attributes.structureCount)
      .reduce(reducingFn, 0);
  });

/** we might need to reconstruct a tree whose hierarchy includes only the
 * jurisdiction objects that have selected leaf nodes.(calling this the selected hierarchy)
 * @param state - the store state
 * @param props - the Filters
 */
export const getSelectedHierarchy = () => {
  return createSelector(getTreeWithMeta(), origTree => {
    // need to be very keen not tu mutate the original tree.
    const tree = cloneDeep(origTree);
    // get selected leaf nodes.
    const allSelectedLeafNodes = computeSelectedNodes(tree, true);
    if (allSelectedLeafNodes.length === 0) {
      return;
    }

    let allNodesInPaths = keyBy<TreeNode>(allSelectedLeafNodes, node => node.model.id);

    // create an object with uniq jurisdiction entries for all jurisdictions that exist
    // in a path that has a selected leaf node.
    allSelectedLeafNodes.forEach(node => {
      allNodesInPaths = {
        ...allNodesInPaths,
        ...keyBy<TreeNode>(node.getPath(), nd => nd.model.id),
      };
    });

    // flatten it into an array in preparation of creating a nested structure
    const normalNodes: TreeNode[] = [];
    values(allNodesInPaths).forEach(node => {
      const data = node.model;
      // remove the existing children field, we will add it later with the computed children
      delete data.children;
      normalNodes.push(data);
    });

    // nest them normal nodes into a hierarchy
    // TODO - add a type declaration file.
    const flatToNested = new (FlatToNested as any)({
      id: 'id',
      parent: 'parent',
    });

    // create a new tree based on the new structure.
    const nestedNormalNodes = flatToNested.convert(normalNodes);
    const model = new TreeModel();
    const root = model.parse<ParsedHierarchySingleNode>(nestedNormalNodes);
    preOrderStructureCountComputation(root);
    return root;
  });
};

/** gets the parent node from the selectedHierarchy
 * @param state - the store state
 * @param props - the filters
 */
export const getParentNodeInSelectedTree = () => {
  return createSelector(getSelectedHierarchy(), getCurrentParentId, findAParentNode);
};

/** gets the children nodes from the selectedHierarchy
 * @param state - the store state
 * @param props - the filters
 */
export const getCurrentChildrenInSelectedTre = () => {
  return createSelector(getParentNodeInSelectedTree(), getChildrenForNode);
};

/** a combined selector that gets the parent node and the currentChildren
 * from the selectedHierarchy
 * @param state - the store state
 * @param props - the filters
 */
export const getNodesInSelectedTree = () =>
  createSelector(
    getParentNodeInSelectedTree(),
    getCurrentChildrenInSelectedTre(),
    (parentNode, childrenNodes) => {
      return { parentNode, childrenNodes };
    }
  );