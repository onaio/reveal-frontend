/** store location hierarchy information
 * - should be able to add a tree model
 * - modify the tree model in a manner such that shallow comparison would yield false
 * - provide the selectors
 */

import { Dictionary } from '@onaio/utils/dist/types/types';
import FlatToNested from 'flat-to-nested';
import { keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import TreeModel from 'tree-model';
import {
  AutoSelectCallback,
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
  nodeHasChildren,
  SELECT_KEY,
  selectionReason,
  SetSelectAttrToNode,
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

/** action to auto-append/ auto-modify the selected attribute of nodes in a tree */
export const AUTO_SELECT_NODES = 'opensrp/locations/hierarchy/AUTO_SELECT_NODES';

/** describes action that adds a tree to store */
export interface FetchedTreeAction extends AnyAction {
  type: typeof TREE_FETCHED;
  treeByRootId: Dictionary<TreeNode>;
}

/** action to select a node  */
export interface SelectNodeAction extends AnyAction {
  type: typeof SELECT_NODE;
  nodeId: string;
  rootJurisdictionId: string;
}

/** describes action to remove all trees */
export interface DeforestAction extends AnyAction {
  type: typeof DEFOREST;
  treeByRootId: {};
}

/** describes action to set the selected attribute of a node to false */
export interface DeselectNodeAction extends AnyAction {
  type: typeof DESELECT_NODE;
  nodeId: string;
  rootJurisdictionId: string;
}

/** describes action to automate the node selection process */
export interface AutoSelectNodesAction extends AnyAction {
  type: typeof AUTO_SELECT_NODES;
  rootJurisdictionId: string;
  callback: AutoSelectCallback;
  selectedBy: string;
}

/** describes an action to deselect or selected nodes in a tree */
export interface DeselectAllNodesAction extends AnyAction {
  type: typeof DESELECT_ALL_NODES;
  rootJurisdictionId: string;
}

/** combined full action types | its a union */
export type TreeActionTypes =
  | FetchedTreeAction
  | SelectNodeAction
  | DeforestAction
  | DeselectNodeAction
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
  selectedBy: string = selectionReason.USER_CHANGE
): SelectNodeAction {
  return {
    nodeId,
    rootJurisdictionId,
    selectedBy,
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
  selectedBy: string = selectionReason.USER_CHANGE
): DeselectNodeAction {
  return {
    nodeId,
    rootJurisdictionId,
    selectedBy,
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
  selectedBy: string = selectionReason.USER_CHANGE
): AutoSelectNodesAction {
  return {
    callback,
    rootJurisdictionId,
    selectedBy,
    type: AUTO_SELECT_NODES,
  };
}

/** deselects all nodes in a tree */
export function deselectAllNodes(rootId: string): DeselectAllNodesAction {
  return {
    rootJurisdictionId: rootId,
    type: DESELECT_ALL_NODES,
  };
}

// **************************** medusa ****************************

/** The store's slice state */
export interface TreeState {
  currentParentIdsByRootId: Dictionary<string | undefined>;
  treeByRootId: Dictionary<TreeNode> | {};
}

/** TODO - make immutable */
/** starting state */
export const initialState: TreeState = {
  currentParentIdsByRootId: {},
  treeByRootId: {},
};

// the reducer function
export default function reducer(state = initialState, action: TreeActionTypes) {
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
      const treesByIds = state.treeByRootId;
      const treeOfInterest = (treesByIds as Dictionary<TreeNode>)[action.rootJurisdictionId];
      if (!treeOfInterest) {
        return state;
      }
      const { treeClone: alteredTree, argNode } = SetSelectAttrToNode(
        treeOfInterest,
        action.nodeId,
        SELECT_KEY,
        true,
        true,
        false,
        action.selectedBy
      );
      computeParentNodesSelection(argNode, action.selectedBy);
      return {
        ...state,
        treeByRootId: { ...state.treeByRootId, [action.rootJurisdictionId]: alteredTree },
      };

    case DESELECT_NODE:
      const allTrees = state.treeByRootId;
      const wantedTree = (allTrees as Dictionary<TreeNode>)[action.rootJurisdictionId];
      if (!wantedTree) {
        return state;
      }
      const response = SetSelectAttrToNode(
        wantedTree,
        action.nodeId,
        SELECT_KEY,
        false,
        true,
        true,
        action.selectedBy
      );
      return {
        ...state,
        treeByRootId: { ...state.treeByRootId, [action.rootJurisdictionId]: response.treeClone },
      };

    case AUTO_SELECT_NODES:
      const theForest = state.treeByRootId;
      const theTree = (theForest as Dictionary<TreeNode>)[action.rootJurisdictionId];
      if (!theTree) {
        return state;
      }
      const treeResponse = autoSelectNodesAndCascade(theTree, action.callback, action.selectedBy);
      return {
        ...state,
        treeByRootId: { ...state.treeByRootId, [action.rootJurisdictionId]: treeResponse },
      };

    case DESELECT_ALL_NODES:
      // get the tree of interest.
      const fullForest = state.treeByRootId;
      const interestingTree = (fullForest as Dictionary<TreeNode>)[action.rootJurisdictionId];

      // set the attr on the root node and cascade
      const res = SetSelectAttrToNode(
        interestingTree,
        action.rootJurisdictionId,
        SELECT_KEY,
        false,
        true,
        true,
        selectionReason.NOT_CHANGED
      );
      return {
        ...state,
        treeByRootId: { ...state.treeByRootId, [action.rootJurisdictionId]: res.treeClone },
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
export const getParentIdsByRootId = (state: Partial<Store>, _: Filters): Dictionary<string> =>
  (state as any)[reducerName].currentParentIdsByRootId;

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

/** retrieve a node given the id
 * @param state - the store
 * @param props -  the filterProps
 */
export const getNodeById = () =>
  createSelector(getTreeById(), getNodeId, (tree, nodeId) => {
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
  createSelector(getTreeById(), getCurrentParentId, findAParentNode);

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
  createSelector(getTreeById(), getLeafNodesOnly, computeSelectedNodes);

/** returns an array of all leaf nodes for a particular jurisdiction
 * @param state - the store
 * @param props -  the filterProps
 */
export const getLeafNodes = () =>
  createSelector(getTreeById(), tree => {
    const nodesList: TreeNode[] = [];
    if (!tree) {
      return [];
    }
    tree.walk(node => {
      const shouldAddNode = !nodeHasChildren(node);
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
  createSelector(getTreeById(), tree => {
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
  return createSelector(getTreeById(), tree => {
    // get selected leaf nodes.
    const allSelectedLeafNodes = computeSelectedNodes(tree, true);
    if (allSelectedLeafNodes.length === 0) {
      return;
    }
    let allNodesInPaths = keyBy(allSelectedLeafNodes, node => node.model.id);

    // create an object with uniq jurisdiction entries for all jurisdictions that exist
    // in a path that has a selected leaf node.
    allSelectedLeafNodes.forEach(node => {
      allNodesInPaths = { ...allNodesInPaths, ...keyBy(node.getPath(), nd => nd.model.id) };
    });

    // flatten it into an array in preparation of creating a nested structure
    // TODO - any
    const normalNodes: TreeNode[] = [];
    values(allNodesInPaths).forEach((node: any) => {
      const data = node.model;
      // remove the existing children field, we will add it later with the computed children
      delete data.children;
      normalNodes.push(data);
    });

    // nest them normal nodes into a hierarchy
    const flatToNested = new (FlatToNested as any)({
      children: 'children',
      id: 'id',
      parent: 'parent',
    });

    // create a new tree based on the new structure.
    const nestedNormalNodes = flatToNested.convert(normalNodes);
    const model = new TreeModel();
    const root = model.parse<ParsedHierarchySingleNode>(nestedNormalNodes);
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
