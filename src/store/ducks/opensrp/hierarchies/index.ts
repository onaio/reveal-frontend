/** store location hierarchy information
 * - should be able to add a tree model
 * - modify the tree model in a manner such that shallow comparison would fail
 * - provide the selectors
 */

import { Dictionary } from '@onaio/utils/dist/types/types';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import { AutoSelectCallback, RawOpenSRPHierarchy, TreeNode } from './types';
import {
  generateJurisdictionTree,
  META_FIELD_NAME,
  nodeHasChildren,
  nodeIsSelected,
  SELECT_KEY,
  setAttrsToNode,
  autoSelectNodesAndCascade,
} from './utils';

export const reducerName = 'hierarchy';

// **************************** actions *****************************

/** action to add a tree to store */
export const TREE_FETCHED = 'opensrp/locations/hierarchy/TREE_FETCHED';
/** remove trees */
export const DEFOREST = 'opensrp/locations/hierarchy/DEFOREST';
/** action to append/modify attributes to a tree */
export const SELECT_NODE = 'opensrp/locations/hierarchy/SELECT_NODE';

export const DESELECT_NODE = 'opensrp/locations/hierarchy/DESELECT_NODE';

/** action to auto-append/ auto-modify attributes to a tree */
export const AUTO_SELECT_NODES = 'opensrp/locations/hierarchy/AUTO_SELECT_NODES';

/** action to set the currentParent id for a certain tree */
export const CURRENT_PARENT_SET = 'opensrp/locations/hierarchy/CURRENT_PARENT_SET';
/** priority: lower action to remove a tree from the store */

export interface FetchedTreeAction extends AnyAction {
  type: typeof TREE_FETCHED;
  treeByRootId: Dictionary<TreeNode>;
}

export interface SetCurrentParentIdAction extends AnyAction {
  type: typeof CURRENT_PARENT_SET;
  currentParentIdsByRootId: Dictionary<string | undefined>;
}

export interface SelectNodeAction extends AnyAction {
  type: typeof SELECT_NODE;
  nodeId: string;
  rootJurisdictionId: string;
}

export interface DeforestAction extends AnyAction {
  type: typeof DEFOREST;
  treeByRootId: {};
}

export interface DeselectNodeAction extends AnyAction {
  type: typeof DESELECT_NODE;
  nodeId: string;
  rootJurisdictionId: string;
}

export interface AutoSelectNodesAction extends AnyAction {
  type: typeof AUTO_SELECT_NODES;
  rootJurisdictionId: string;
  callback: AutoSelectCallback;
}

export type TreeActionTypes =
  | FetchedTreeAction
  | SetCurrentParentIdAction
  | SelectNodeAction
  | DeforestAction
  | DeselectNodeAction
  | AnyAction;

// **************************** action creators ****************************

export function fetchTree(apiResponse: RawOpenSRPHierarchy): FetchedTreeAction {
  const tree = generateJurisdictionTree(apiResponse);
  return {
    treeByRootId: {
      [tree.model.id]: tree,
    },
    type: TREE_FETCHED,
  };
}

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

export function selectNode(rootJurisdictionId: string, nodeId: string): SelectNodeAction {
  return {
    nodeId,
    rootJurisdictionId,
    type: SELECT_NODE,
  };
}

export function deforest(): DeforestAction {
  return {
    treeByRootId: {},
    type: DEFOREST,
  };
}

export function deselectNode(rootJurisdictionId: string, nodeId: string): DeselectNodeAction {
  return {
    nodeId,
    rootJurisdictionId,
    type: DESELECT_NODE,
  };
}

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

export interface TreeState {
  currentParentIdsByRootId: Dictionary<string | undefined>;
  treeByRootId: Dictionary<TreeNode> | {};
}

/** TODO - make immutable */

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
      let treesByIds = state.treeByRootId;
      let treeOfInterest = (treesByIds as Dictionary<TreeNode>)[action.rootJurisdictionId];
      if (!treeOfInterest) {
        return state;
      }
      const { treeClone } = setAttrsToNode(treeOfInterest, action.nodeId, SELECT_KEY, true, true);
      return {
        ...state,
        treeByRootId: { ...state.treeByRootId, [action.rootJurisdictionId]: treeClone },
      };
    case DESELECT_NODE:
      treesByIds = state.treeByRootId;
      treeOfInterest = (treesByIds as Dictionary<TreeNode>)[action.rootJurisdictionId];
      if (!treeOfInterest) {
        return state;
      }
      const response = setAttrsToNode(treeOfInterest, action.nodeId, SELECT_KEY, false, true, true);
      return {
        ...state,
        treeByRootId: { ...state.treeByRootId, [action.rootJurisdictionId]: response.treeClone },
      };
    case AUTO_SELECT_NODES:
      treesByIds = state.treeByRootId;
      treeOfInterest = (treesByIds as Dictionary<TreeNode>)[action.rootJurisdictionId];
      if (!treeOfInterest) {
        return state;
      }
      const treeResponse = autoSelectNodesAndCascade(treeOfInterest, action.callback);
      return {
        ...state,
        treeByRootId: { ...state.treeByRootId, [action.rootJurisdictionId]: treeResponse },
      };
    default:
      return state;
  }
}

// **************************** selectors ****************************
export interface Filters {
  rootJurisdictionId: string;
  nodeId?: string;
  leafNodesOnly?: boolean;
}

export const getRootJurisdictionId = (state: Partial<Store>, props: Filters) =>
  props.rootJurisdictionId;

export const getNodeId = (state: Partial<Store>, props: Filters) => props.nodeId;

export const getLeafNodesOnly = (state: Partial<Store>, props: Filters) => props.leafNodesOnly;

export const getTreesByIds = (state: Partial<Store>, props: Filters): Dictionary<TreeNode> =>
  (state as any)[reducerName].treeByRootId;

export const getParentIdsByRootId = (state: Partial<Store>, props: Filters): Dictionary<string> =>
  (state as any)[reducerName].currentParentIdsByRootId;

export const getTreeById = () =>
  createSelector(getTreesByIds, getRootJurisdictionId, (treesByIds, rootId):
    | TreeNode
    | undefined => {
    return treesByIds[rootId];
  });

export const getNodeById = () =>
  createSelector(getTreeById(), getNodeId, (tree, nodeId) => {
    if (!tree || !nodeId) {
      return;
    }
    const nodeOfInterest = tree.first(node => node.model.id === nodeId);
    return nodeOfInterest;
  });

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

/** returns all selected nodes
 *
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
