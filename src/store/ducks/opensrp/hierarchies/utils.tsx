/** if you are a fan of properly typed code, whose types just fall in place,
 * this file might not be for you.
 */
import { Dictionary } from '@onaio/utils';
import { cloneDeep, uniqWith } from 'lodash';
import TreeModel from 'tree-model';
import {
  ParsedHierarchySingleNode,
  RawHierarchySingleNode,
  RawHierarchySingleNodeMap,
  RawOpenSRPHierarchy,
  TreeNode,
} from './types';

export const META_FIELD_NAME = 'meta';
export const SELECT_KEY = 'selected';

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

/** helper that sets attributes to a node such that the tree changes causing a re-render
 * @param aTree - the tree, usually the tree state variable
 * @param nodeId - id of the node of interest
 * @param attrAccessor - the key to use when assigning the value
 * @param attrValue - the value to assign to attrAccessor
 * @param cascadeDown - whether to do the value assignment on each of the node's descendants
 * @param cascadeDown - whether to do the value assignment on each of the node's ancestors
 */
export function setAttrsToNode(
  aTree: TreeNode,
  nodeId: string,
  attrAccessor: string,
  attrValue: string | number | boolean,
  cascadeDown: boolean = false,
  cascadeUp: boolean = false
) {
  const treeClone = cloneDeep(aTree);
  const argNode = treeClone.first(nd => nd.model.id === nodeId);
  if (!argNode) {
    return treeClone;
  }
  argNode.model[META_FIELD_NAME][attrAccessor] = attrValue;
  if (cascadeDown) {
    // argNode is part of this walk.
    argNode.walk(nd => {
      nd.model[META_FIELD_NAME][attrAccessor] = attrValue;
      // removing this return cause a type error, that's its sole purpose
      return true;
    });
  }
  if (cascadeUp) {
    const parentsPath = argNode.getPath();
    // remove the node from path
    parentsPath.pop();
    parentsPath.forEach(parentNode => {
      parentNode.model[META_FIELD_NAME][attrAccessor] = attrValue;
    });
  }
  return { treeClone, argNode };
  // do not setTree here yet so that the caller can perform additional mutations
}

/** given an array of the childrenNodes, return true if all of them are selected
 * @param childrenNodes - an array of nodes
 */
export function areAllChildrenSelected(childrenNodes: TreeNode[]) {
  let selected = true;
  childrenNodes.forEach(node => {
    selected = selected && node.model.meta[SELECT_KEY];
  });
  return selected;
}

/** returns if node is selected
 * @param node - The node
 */
export const nodeIsSelected = (node: TreeNode) => {
  return !!node.model.meta[SELECT_KEY];
};

/** checks whether a node is a parent node or a leaf node
 * @param node - the node
 * @return true if node is a parent node, false if node is a leaf node
 */
export const nodeHasChildren = (node: TreeNode) => {
  return node.children && node.children.length > 0;
};

/** traverse up and select the parent nodes where necessary
 * @param node a node
 */
export function computeParentNodesSelection(node: TreeNode) {
  const parentsPath = node.getPath();
  const reversedParentSPath = parentsPath.reverse();
  // now for each of the parent if all the children are selected then label the parent as selected too
  for (const parentNode of reversedParentSPath) {
    const allChildrenAreSelected = areAllChildrenSelected(parentNode.children);
    if (allChildrenAreSelected) {
      parentNode.model[META_FIELD_NAME][SELECT_KEY] = allChildrenAreSelected;
    } else {
      break;
    }
  }
}

/** any callback that will take a node and return whether we should select the node
 * @param callback - callback is given each node in a walk and decides whether that node should be selected by returning true or false
 */
export const autoSelectNodesAndCascade = (
  tree: TreeNode,
  callback: (node: TreeNode) => boolean
) => {
  let treeClone = cloneDeep(tree);
  if (!treeClone) {
    return;
  }
  // deselect all
  treeClone = setAttrsToNode(tree, tree.model.id, SELECT_KEY, false, true).treeClone;
  const parentNodes: TreeNode[] = [];
  treeClone.walk(node => {
    if (callback(node)) {
      node.model[META_FIELD_NAME][SELECT_KEY] = true;
      parentNodes.push(node);
    }
    return true;
  });

  // remove duplicates
  const parentNodesSet = uniqWith(parentNodes, (nodeA, nodeB) => nodeA.model.id === nodeB.model.id);

  // now select parents accordingly
  parentNodesSet.forEach(node => {
    computeParentNodesSelection(node);
  });
  return treeClone;
};
