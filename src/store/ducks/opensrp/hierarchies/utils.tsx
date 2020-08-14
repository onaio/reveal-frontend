/** if you are a fan of properly typed code, whose types just fall in place,
 * this file might not be for you.
 *
 * Has utils to parse the raw hierarchy response from opensrp.
 * A few other helpers that abstract the reducer(reducer and selectors) functionality
 */
import { Dictionary } from '@onaio/utils';
import { cloneDeep } from 'lodash';
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
export function areAllChildrenSelected(
  childrenNodes: TreeNode[],
  metaDataByJurisdiction: Dictionary<Meta>
) {
  let selected = true;
  childrenNodes.forEach(node => {
    selected =
      selected &&
      !!(
        metaDataByJurisdiction[node.model.id] &&
        metaDataByJurisdiction[node.model.id][SELECTION_KEY]
      );
  });
  return selected;
}

/** returns true if node is selected
 * @param node - The node
 */
export const nodeIsSelected = (node: TreeNode) => {
  return !!node.model.meta[SELECTION_KEY];
};

/** returns the Structure Count of a node
 * @param node - The node
 */
export const getNodeStructureCount = (node: TreeNode) => {
  // metaStructureCount is a frontend computed variable and thus we assume that to be 'truer'
  // than the structure count returned as part of the jurisdiction's attributes.
  const structureCount =
    node.model.meta[META_STRUCTURE_COUNT] || node.model.node.attributes.structureCount || 0;
  return structureCount;
};

/** wrapper for creating a metaData object for dryness purposes
 * @param nodeId - the id of the node
 * @param actionBy - who effected this action
 * @param selected - whether node is selected or not.
 */
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

/** Creates metaData objects that are records of which nodes are selected and which aren't
 * @param tree - the tree
 * @param nodeId - id of the selected node
 * @param actionBy - how was this change effected
 * @param selectValue - whether node should be selected or not
 * @param cascadeUp - whether the selection should be applied on the parents of this node
 * @param cascadeDown - whether the selection should be applied to the descendants of this node
 */
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
  metaByJurisdiction = Object.assign(metaByJurisdiction, thisNodesMeta);

  if (cascadeDown) {
    // argNode is part of this walk.
    nodeOfInterest.walk(nd => {
      metaByJurisdiction = Object.assign(
        metaByJurisdiction,
        createSingleMetaData(nd.model.id, actionBy, selectValue)
      );
      return true;
    });
  }
  if (cascadeUp) {
    const parentsPath = nodeOfInterest.getPath();
    // remove the node from path
    parentsPath.pop();
    parentsPath.forEach(parentNode => {
      metaByJurisdiction = Object.assign(
        metaByJurisdiction,
        createSingleMetaData(parentNode.model.id, actionBy, selectValue)
      );
    });
  }
  return { metaByJurisdiction, nodeOfInterest };
};

/** traverse up and select the parent nodes where necessary
 * @param node a node
 * @param actionBy - reason by which select changed
 * @param metaDataByJurisdiction - meta object key'd by jurisdictionId
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
      metaDataByJurisdictionId = Object.assign(
        metaDataByJurisdictionId,
        createSingleMetaData(parentNode.model.id, actionBy, true)
      );
    } else {
      break;
    }
  }
  return metaDataByJurisdictionId;
}

/** compute Selected nodes from the tree
 * @param tree - the whole tree or undefined
 * @param leafNodesOnly - whether to include the leaf nodes only
 * @param metaByJurisdiction - MetaData object
 */
export const computeSelectedNodes = (
  tree: TreeNode | undefined,
  leafNodesOnly: boolean | undefined,
  metaByJurisdiction: Dictionary<Meta>
) => {
  const nodesList: TreeNode[] = [];
  if (!tree) {
    return [];
  }
  tree.walk(node => {
    const shouldAddNode =
      !!(metaByJurisdiction[node.model.id] && metaByJurisdiction[node.model.id][SELECTION_KEY]) &&
      !(leafNodesOnly && node.hasChildren());
    if (shouldAddNode) {
      nodesList.push(node);
    }
    return true;
  });
  return nodesList;
};

/** any callback that will take a node and return whether we should select the node
 * @param tree - the tree
 * @param callback - callback is given each node in a walk and decides whether that node should be selected by returning true or false
 * @param actionBy - selected by
 */
export const autoSelectNodesAndCascade = (
  tree: TreeNode,
  callback: (node: TreeNode) => boolean,
  actionBy: string = SELECTION_REASON.USER_CHANGE
) => {
  let metaByJurisdictionId: Dictionary<Meta> = {};

  tree.walk(node => {
    if (callback(node)) {
      node.walk(nd => {
        metaByJurisdictionId = Object.assign(
          metaByJurisdictionId,
          createSingleMetaData(nd.model.id, actionBy, true)
        );
        // removing this return cause a type error, that's its sole purpose
        return true;
      });
    }
    return true;
  });

  const selectedChildren = computeSelectedNodes(tree, true, metaByJurisdictionId);

  selectedChildren.forEach(node => {
    metaByJurisdictionId = Object.assign(
      metaByJurisdictionId,
      computeParentNodesSelection(node, actionBy, metaByJurisdictionId)
    );
  });

  return Object.assign({}, metaByJurisdictionId);
};

/** uses pre-order tree traversal to compute new structure counts for jurisdictions in the tree
 * useful for instance after dropping a node from the tree
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

/** helper util that helps add metaData from the metaData state slice to the respective node
 * that owns the metaData
 * @param nodes - a node or a list of nodes to apply the metadata to
 * @param meta - meta object by jurisdiction
 */
export const applyMeta = (nodes?: TreeNode[] | TreeNode, meta: Dictionary<Meta> = {}) => {
  if (!nodes) {
    return [];
  }
  const localNodes = Array.isArray(nodes) ? [...nodes] : [nodes];
  for (let i = 0, len = localNodes.length; i < len; i++) {
    const node = localNodes[i];
    const thisNodesMeta = Object.assign(meta[node.model.id] || {}, {
      [META_STRUCTURE_COUNT]: node.model.meta[META_STRUCTURE_COUNT],
    });
    thisNodesMeta[META_STRUCTURE_COUNT] = node.model.meta[META_STRUCTURE_COUNT];
    node.model.meta = thisNodesMeta;
  }
  return localNodes;
};

/** find the parent node in a tree given the parentId
 * @param tree - the tree
 * @param parentId - id of the parent node
 * @param metaData - the tree's metaData - used to know which nodes to selected
 */
export const findAParentNode = (
  tree?: TreeNode,
  parentId?: string,
  metaData?: Dictionary<Meta>
) => {
  if (!tree) {
    return;
  }
  if (parentId === undefined) {
    const toReturnTree = tree;
    if (metaData) {
      return applyMeta(toReturnTree, metaData)[0];
    }
    return toReturnTree;
  }
  const finalNode: TreeNode | undefined = tree.first(node => node.model.id === parentId);

  if (metaData) {
    return applyMeta(finalNode, metaData)[0];
  }

  return finalNode;
};

/** find the current children from  a parent node. This is defined here to avoid repetition
 * @param parentNode -  the parent Node
 * @param metaData - the tree's metadata; used to know which nodes to select
 */
export const getChildrenForNode = (parentNode?: TreeNode, metaData?: Dictionary<Meta>) => {
  let children = [];
  if (parentNode) {
    children = parentNode.children;
  }
  if (metaData) {
    return applyMeta(children, metaData);
  }
  return children;
};
