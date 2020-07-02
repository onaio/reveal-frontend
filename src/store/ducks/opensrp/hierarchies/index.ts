/** store location hierarchy information
 * - should be able to add a tree model
 * - modify the tree model in a manner such that shallow comparison would yield false
 * - provide the selectors
 */

import { Dictionary } from '@onaio/utils/dist/types/types';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import { AutoSelectCallback, RawOpenSRPHierarchy, TreeNode } from './types';
import {
  autoSelectNodesAndCascade,
  generateJurisdictionTree,
  nodeHasChildren,
  nodeIsSelected,
  SELECT_KEY,
  setAttrsToNode,
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

/** action to auto-append/ auto-modify the selected attribute of nodes in a tree */
export const AUTO_SELECT_NODES = 'opensrp/locations/hierarchy/AUTO_SELECT_NODES';

/** action to set the currentParent id for a certain tree */
export const CURRENT_PARENT_SET = 'opensrp/locations/hierarchy/CURRENT_PARENT_SET';

/** describes action that adds a tree to store */
export interface FetchedTreeAction extends AnyAction {
  type: typeof TREE_FETCHED;
  treeByRootId: Dictionary<TreeNode>;
}

/** describes action that sets the current parent of a given tree */
export interface SetCurrentParentIdAction extends AnyAction {
  type: typeof CURRENT_PARENT_SET;
  currentParentIdsByRootId: Dictionary<string | undefined>;
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
}

/** combined full action types | its a union */
export type TreeActionTypes =
  | FetchedTreeAction
  | SetCurrentParentIdAction
  | SelectNodeAction
  | DeforestAction
  | DeselectNodeAction
  | AnyAction;

// **************************** action creators ****************************

/** action creator when adding a tree to store
 * @param apiResponse - the raw hierarchy as received from opensrp
 */
export function fetchTree(apiResponse: RawOpenSRPHierarchy): FetchedTreeAction {
  const tree = generateJurisdictionTree(apiResponse);
  return {
    treeByRootId: {
      [tree.model.id]: tree,
    },
    type: TREE_FETCHED,
  };
}

/** action creator for setting a parent id of a known tree
 * @param rootJurisdictionId - id of the rootNode; thus able to get the jurisdiction in question
 * @param currentParentId - id of the node you wish to set as parent
 */
export function setCurrentParentId(
  rootJurisdictionId: string,
  currentParentId: string | undefined
): SetCurrentParentIdAction {
  return {
    currentParentIdsByRootId: {
      [rootJurisdictionId]: currentParentId,
    },
    type: CURRENT_PARENT_SET,
  };
}

/** action creator for when selecting a node
 * @param rootJurisdictionId - need to know the tree that should be modified
 * @param nodeId - the id of the node whose selected status should be changed
 */
export function selectNode(rootJurisdictionId: string, nodeId: string): SelectNodeAction {
  return {
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
export function deselectNode(rootJurisdictionId: string, nodeId: string): DeselectNodeAction {
  return {
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
  callback: AutoSelectCallback
): AutoSelectNodesAction {
  return {
    callback,
    rootJurisdictionId,
    type: AUTO_SELECT_NODES,
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

    case CURRENT_PARENT_SET:
      return {
        ...state,
        currentParentIdsByRootId: {
          ...state.currentParentIdsByRootId,
          ...action.currentParentIdsByRootId,
        },
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
      const { treeClone } = setAttrsToNode(treeOfInterest, action.nodeId, SELECT_KEY, true, true);
      return {
        ...state,
        treeByRootId: { ...state.treeByRootId, [action.rootJurisdictionId]: treeClone },
      };

    case DESELECT_NODE:
      // typescript or sth forced me to used different variables names, it thinks declaring
      // the same variable name in different case is a mistake, or maybe it is I should look into it
      const allTrees = state.treeByRootId;
      const wantedTree = (allTrees as Dictionary<TreeNode>)[action.rootJurisdictionId];
      if (!wantedTree) {
        return state;
      }
      const response = setAttrsToNode(wantedTree, action.nodeId, SELECT_KEY, false, true, true);
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
      const treeResponse = autoSelectNodesAndCascade(theTree, action.callback);
      return {
        ...state,
        treeByRootId: { ...state.treeByRootId, [action.rootJurisdictionId]: treeResponse },
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
}

/** retrieve the rootJurisdiction value
 * @param state - the store
 * @param props -  the filterProps
 */
export const getRootJurisdictionId = (_: Partial<Store>, props: Filters) =>
  props.rootJurisdictionId;

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

/** retrieve the node designated as the current Parent id
 * @param state - the store
 * @param props -  the filterProps
 */
export const getCurrentParentNode = () =>
  createSelector(
    getTreeById(),
    getParentIdsByRootId,
    getRootJurisdictionId,
    (tree, idsMap, rootId) => {
      if (!tree) {
        return;
      }
      return tree.first(node => node.model.id === idsMap[rootId]);
    }
  );
/** returns an array of current children
 * @param state - the store
 * @param props -  the filterProps
 */
export const getCurrentChildren = () => {
  return createSelector(getCurrentParentNode(), getTreeById(), (currentParentNode, tree) => {
    if (currentParentNode) {
      return currentParentNode.children;
    } else if (tree) {
      return [tree];
    }
    return [];
  });
};

/** retrieves an array of all the selected nodes
 * @param state - the store
 * @param props -  the filterProps
 */
export const getAllSelectedNodes = () =>
  createSelector(getTreeById(), getLeafNodesOnly, (tree, leafNodesOnly) => {
    const nodesList: TreeNode[] = [];
    if (!tree) {
      return [];
    }
    tree.walk(node => {
      const shouldAddNode = nodeIsSelected(node) && !(leafNodesOnly && nodeHasChildren(node));
      if (shouldAddNode) {
        nodesList.push(node);
      }
      return true;
    });
    return nodesList;
  });
