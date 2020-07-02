/** store location hierarchy information
 * - should be able to add a tree model
 * - modify the tree model in a manner such that shallow comparison would fail
 * - provide the selectors
 */

import { Dictionary } from '@onaio/utils/dist/types/types';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import { RawOpenSRPHierarchy, TreeNode } from './types';
import { generateJurisdictionTree } from './utils';

export const reducerName = 'hierarchy';

// **************************** actions *****************************

/** action to add a tree to store */
export const TREE_FETCHED = 'opensrp/locations/hierarchy/TREE_FETCHED';
/** action to append/modify attributes to a tree */
/** action to auto-append/ auto-modify attributes to a tree */
/** action to set the currentParent id for a certain tree */
export const CURRENT_PARENT_SET = 'opensrp/locations/hierarchy/CURRENT_PARENT_SET';
/** priority: lower action to remove a tree from the store */

export interface FetchedTreeAction extends AnyAction {
  type: typeof TREE_FETCHED;
  treeByRootId: Dictionary<TreeNode>;
}

export interface SetCurrentParentIdAction extends AnyAction {
  type: typeof CURRENT_PARENT_SET;
  currentParentIdsByRootId: Dictionary<string>;
}

export type TreeActionTypes = FetchedTreeAction | SetCurrentParentIdAction | AnyAction;

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
  currentParentId: string
): SetCurrentParentIdAction {
  return {
    currentParentIdsByRootId: {
      [rootJurisdictionId]: currentParentId,
    },
    type: CURRENT_PARENT_SET,
  };
}

// **************************** medusa ****************************

export interface TreeState {
  currentParentIdsByRootId: Dictionary<string>;
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
    default:
      return state;
  }
}

// **************************** selectors ****************************
interface Filters {
  rootJurisdictionId: string;
}

export const getRootJurisdictionId = (state: Partial<Store>, props: Filters) =>
  props.rootJurisdictionId;

// export const getCurrentParentId = (state: Partial<Store>, props: Filters) => props.currentParentId;

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
  return createSelector(getCurrentParentNode(), currentParentNode => {
    if (currentParentNode) {
      return currentParentNode.children;
    }
    return [];
  });
};
