/** if you are a fan of properly typed code, whose types just fall in place,
 * this file might not be for you.
 */
import { Dictionary } from '@onaio/utils';
import { cloneDeep, uniqWith } from 'lodash';
import TreeModel from 'tree-model';

import { META_FIELD_NAME, META_STRUCTURE_COUNT, SELECTION_REASON } from './constants';
import { SELECTION_KEY } from './constants';
import { Meta } from './types';
import {
  ParsedHierarchySingleNode,
  RawHierarchySingleNode,
  RawHierarchySingleNodeMap,
  RawOpenSRPHierarchy,
  TreeNode,
} from './types';

/** mutates the structure of the children property in a single node
 * @param {RawHierarchySingleNode} rawSingleNode - single node i.e. part of rawOpensrp hierarchy
 */
const parseChildren = (rawSingleNode: RawHierarchySingleNode) => {
  // explicitly dictating the types since we are mutating the object to a diff structure.
  const typedRawSingleNode = (rawSingleNode as unknown) as ParsedHierarchySingleNode;
  if (typedRawSingleNode.children) {
    typedRawSingleNode.children = Object.entries(typedRawSingleNode.children).map(
      ([_, value]) => value
    );
    typedRawSingleNode.children.forEach(child => {
      const typedChild = (child as unknown) as RawHierarchySingleNode;
      (typedChild as Dictionary)[META_FIELD_NAME] = {};
      parseChildren(typedChild);
    });
  }
};

/** extract the root node as a flat object
 * @param {RawOpenSRPHierarchy} map - value of map in the rawOpenSRPHierarchy
 */
const parseParent = (map: RawHierarchySingleNodeMap) => {
  const parentJurisdiction = Object.entries(map).map(([_, value]) => value)[0];
  // add the meta field
  (parentJurisdiction as Dictionary)[META_FIELD_NAME] = {};
  return parentJurisdiction;
};

/** parses the raw opensrp hierarchy to a hierarchy that we can quickly build
 * our tree model from.
 * @param {RawOpenSRPHierarchy} rawOpenSRPHierarchy - the response we get from opensrp
 */
const parseHierarchy = (rawOpenSRPHierarchy: RawOpenSRPHierarchy) => {
  // clone the locationTree, we are going to be mutating a copy
  const rawLocationsTreeClone = cloneDeep(rawOpenSRPHierarchy);
  // !IMPORTANT ASSUMPTION : locationsTreeClone has a single object under map, i.e there is only one root jurisdiction
  const { map } = rawLocationsTreeClone.locationsHierarchy;

  const parentNodeWithChildren = parseParent(map);
  parseChildren(parentNodeWithChildren);
  return (parentNodeWithChildren as unknown) as ParsedHierarchySingleNode;
};

/** takes the raw opensrp hierarchy response and creates a tree model structure
 * @param {RawOpenSRPHierarchy} apiResponse - the response we get from opensrp
 */
export const generateJurisdictionTree = (apiResponse: RawOpenSRPHierarchy) => {
  const tree = new TreeModel();
  const hierarchy = parseHierarchy(apiResponse);
  const root = tree.parse<ParsedHierarchySingleNode>(hierarchy);
  return root;
};

/** given an array of the childrenNodes, return true if all of them are selected
 * @param childrenNodes - an array of nodes
 * @param metaDataByJurisdiction - all meta keyed by their jurisdiction ids
 */
export function areAllChildrenSelected(childrenNodes: TreeNode[], metaData: Dictionary<Meta>) {
  let selected = true;
  childrenNodes.forEach(node => {
    selected = selected && !!(metaData[node.model.id] && metaData[node.model.id][SELECTION_KEY]);
  });
  return selected;
}

/** returns if node is selected
 * @param node - The node
 */
export const nodeIsSelected = (node: TreeNode) => {
  return !!node.model.meta[SELECTION_KEY];
};

export const createSingleMetaData = (
  nodeId: string,
  actionBy: string,
  selected: boolean
): Dictionary<Meta> => {
  return {
    [nodeId]: {
      actionBy,
      selected,
    },
  };
};

export const setSelectOnNode = (
  tree: TreeNode,
  nodeId: string,
  actionBy: string,
  selectValue: boolean,
  cascadeUp: boolean,
  cascadeDown: boolean
) => {
  let metaByJurisdiction: Dictionary<any> = {};

  // need to create Meta object for all other jurisdictions in tree that
  // are potentially affected by this due to a cascade
  const nodeOfInterest = tree.first(nd => nd.model.id === nodeId);
  if (!nodeOfInterest) {
    return {};
  }
  // add an entry for this node
  const thisNodesMeta = createSingleMetaData(nodeId, actionBy, true);
  metaByJurisdiction = {
    ...metaByJurisdiction,
    ...thisNodesMeta,
  };

  if (cascadeDown) {
    // argNode is part of this walk.
    nodeOfInterest.walk(nd => {
      metaByJurisdiction = {
        ...metaByJurisdiction,
        ...createSingleMetaData(nd.model.id, actionBy, selectValue),
      };
      return true;
    });
  }
  if (cascadeUp) {
    const parentsPath = nodeOfInterest.getPath();
    // remove the node from path
    parentsPath.pop();
    parentsPath.forEach(parentNode => {
      metaByJurisdiction = {
        ...metaByJurisdiction,
        ...createSingleMetaData(parentNode.model.id, actionBy, selectValue),
      };
    });
  }
  return { metaByJurisdiction, nodeOfInterest };
};

/** traverse up and select the parent nodes where necessary
 * @param node a node
 */
export function computeParentNodesSelection(
  node: TreeNode,
  actionBy: string = SELECTION_REASON.NOT_CHANGED,
  metaDataByJurisdiction: Dictionary<Meta>
) {
  let metaDataByJurisdictionId: Dictionary<Meta> = {};
  // need to return state.metaData
  const parentsPath = node.getPath();
  const reversedParentSPath = parentsPath.reverse();
  // now for each of the parent if all the children are selected then label the parent as selected too
  for (const parentNode of reversedParentSPath) {
    const allChildrenAreSelected = areAllChildrenSelected(
      parentNode.children,
      metaDataByJurisdiction
    );
    if (allChildrenAreSelected) {
      metaDataByJurisdictionId = {
        ...metaDataByJurisdictionId,
        ...createSingleMetaData(parentNode.model.id, actionBy, true),
      };
    } else {
      break;
    }
  }
  return metaDataByJurisdictionId;
}

/** any callback that will take a node and return whether we should select the node
 * @param callback - callback is given each node in a walk and decides whether that node should be selected by returning true or false
 */
export const autoSelectNodesAndCascade = (
  tree: TreeNode,
  callback: (node: TreeNode) => boolean,
  actionBy: string = SELECTION_REASON.USER_CHANGE,
  thisTreeMetaData: Dictionary<Meta>
) => {
  let metaByJurisdictionId: Dictionary<Meta> = {};
  // deselect all
  const { metaByJurisdiction } = setSelectOnNode(tree, tree.model.id, actionBy, false, true, true);
  const parentNodes: TreeNode[] = [];
  tree.walk(node => {
    if (callback(node)) {
      node.walk(nd => {
        metaByJurisdictionId = {
          ...createSingleMetaData(nd.model.id, actionBy, true),
          ...metaByJurisdictionId,
        };
        // removing this return cause a type error, that's its sole purpose
        return true;
      });
      parentNodes.push(node);
    }
    return true;
  });

  // remove duplicates
  const parentNodesSet = uniqWith(parentNodes, (nodeA, nodeB) => nodeA.model.id === nodeB.model.id);

  // now select parents accordingly
  parentNodesSet.forEach(node => {
    metaByJurisdictionId = {
      ...metaByJurisdictionId,
      ...computeParentNodesSelection(node, actionBy, thisTreeMetaData),
    };
  });

  return {
    ...metaByJurisdiction,
    ...metaByJurisdictionId,
  };
};

/** compute Selected nodes from the tree
 * @param tree - the whole tree or undefined
 * @param leafNodesOnly - whether to include the leaf nodes only
 */
export const computeSelectedNodes = (
  tree: TreeNode | undefined,
  leafNodesOnly: boolean | undefined
) => {
  const nodesList: TreeNode[] = [];
  if (!tree) {
    return [];
  }
  tree.walk(node => {
    const shouldAddNode = nodeIsSelected(node) && !(leafNodesOnly && node.hasChildren());
    if (shouldAddNode) {
      nodesList.push(node);
    }
    return true;
  });
  return nodesList;
};

/** will compute structure counts
 * @param node - the root node of a tree or subtree
 */
export const preOrderStructureCountComputation = (node: TreeNode) => {
  if (!node.hasChildren()) {
    const structureCount =
      (node.model.node.attributes && node.model.node.attributes.structureCount) || 0;
    node.model.meta[META_STRUCTURE_COUNT] = structureCount;
    return structureCount;
  }
  let thisNodesSelectedStructs = 0;
  node.children.forEach((nd: TreeNode) => {
    thisNodesSelectedStructs += preOrderStructureCountComputation(nd);
  });

  node.model.meta[META_STRUCTURE_COUNT] = thisNodesSelectedStructs;
  return thisNodesSelectedStructs;
};

/** find the parent node in a tree given the parentId
 * @param tree - the tree
 * @param parentId - id of the parent node
 */
export const findAParentNode = (tree: TreeNode | undefined, parentId: string | undefined) => {
  if (!tree) {
    return;
  }
  if (parentId === undefined) {
    return tree;
  }
  return tree.first(node => node.model.id === parentId);
};

/** find the current children from  a parent node. This is defined here to avoid repetition
 * @param parentNode -  the parent Node
 */
export const getChildrenForNode = (parentNode: TreeNode | undefined) => {
  let children = [];
  if (parentNode) {
    children = parentNode.children;
  }
  return children;
};
