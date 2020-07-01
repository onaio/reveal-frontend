/** a custom hook to manage changes to the jurisdiction tree */
import { Failure, Result } from '@onaio/utils/dist/types/types';
import { cloneDeep, uniqWith } from 'lodash';
import React from 'react';
import TreeModel from 'tree-model/types';
import { LoadOpenSRPHierarchy } from '../../../helpers/dataLoading/jurisdictions';
import { failure } from '../../../helpers/dataLoading/utils';
import { OpenSRPService } from '../../../services/opensrp';
import { generateJurisdictionTree, ParsedHierarchySingleNode, RawOpenSRPHierarchy } from './utils';

/** string to use as key when setting value of a node as selected */
const SELECT_KEY = 'selected';

/** given an array of the childrenNodes, return true if all of them are selected
 * @param childrenNodes - an array of nodes
 */
export function areAllChildrenSelected(
  childrenNodes: Array<TreeModel.Node<ParsedHierarchySingleNode>>
) {
  let selected = true;
  childrenNodes.forEach(node => {
    selected = selected && node.model.node.attributes[SELECT_KEY];
  });
  return selected;
}

/** returns if node is selected
 * @param node - The node
 */
export const nodeIsSelected = (node: TreeModel.Node<ParsedHierarchySingleNode>) => {
  return !!node.model.node.attributes[SELECT_KEY];
};

/** checks whether a node is a parent node or a leaf node
 * @param node - the node
 * @return true if node is a parent node, false if node is a leaf node
 */
export const nodeHasChildren = (node: TreeModel.Node<ParsedHierarchySingleNode>) => {
  return node.children && node.children.length > 0;
};

/** constructs, and manages interactions that mutate the tree
 * @param rootJurisdictionId - uses this jurisdiction id to get the opensrp hierarchy
 */
export function useJurisdictionTree(rootJurisdictionId: string) {
  const [tree, setTree] = React.useState<TreeModel.Node<ParsedHierarchySingleNode> | undefined>(
    undefined
  );
  const [currentParentNode, setCurrentParent] = React.useState<
    TreeModel.Node<ParsedHierarchySingleNode> | undefined
  >(undefined);
  const [currentChildren, setCurrentChildren] = React.useState<
    Array<TreeModel.Node<ParsedHierarchySingleNode>>
  >([]);
  const [errors, setErrors] = React.useState<Failure[]>([]);
  const addError = (fail: Failure) => {
    setErrors([...errors, fail]);
  };
  const clearErrors = () => setErrors([]);

  React.useEffect(() => {
    const params = {
      return_structure_count: true,
    };
    LoadOpenSRPHierarchy(rootJurisdictionId, OpenSRPService, params)
      .then((apiResponse: Result<RawOpenSRPHierarchy>) => {
        // create parseable tree using treeModel lib
        if (apiResponse.value) {
          const responseData = apiResponse.value;
          const theTree = generateJurisdictionTree(responseData);
          setTree(theTree);
          setCurrentChildren([theTree]);
        } else {
          addError(apiResponse);
        }
      })
      .catch((err: Error) => {
        addError(failure(err));
      });
  }, []);

  /** make currentChildren reactive depending on the set parent node */
  React.useEffect(() => {
    if (currentParentNode) {
      setCurrentChildren(currentParentNode.children);
    }
    /** initially on mount currentParent node is undefined */
    if (!currentParentNode && tree) {
      setCurrentChildren([tree]);
    }
  }, [currentParentNode]);

  /** Update parent node once the tree is changed */
  React.useEffect(() => {
    if (tree && !currentParentNode) {
      setCurrentChildren([tree]);
    }
    if (currentParentNode) {
      const updatedCurrentParent = tree!.first(nd => nd.model.id === currentParentNode.model.id);
      setCurrentParent(updatedCurrentParent);
    }
  }, [tree]);

  /** helper that sets attributes to a node such that the tree changes causing a re-render
   * @param aTree - the tree, usually the tree state variable
   * @param nodeId - id of the node of interest
   * @param attrAccessor - the key to use when assigning the value
   * @param attrValue - the value to assign to attrAccessor
   * @param cascadeDown - whether to do the value assignment on each of the node's descendants
   * @param cascadeDown - whether to do the value assignment on each of the node's ancestors
   */
  function _setAttrsToNode(
    aTree: TreeModel.Node<ParsedHierarchySingleNode>,
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
    argNode.model.node.attributes[attrAccessor] = attrValue;
    if (cascadeDown) {
      // argNode is part of this walk.
      argNode.walk(nd => {
        nd.model.node.attributes[attrAccessor] = attrValue;
        // removing this return cause a type error, that's its sole purpose
        return true;
      });
    }
    if (cascadeUp) {
      const parentsPath = argNode.getPath();
      // remove the node from path
      parentsPath.pop();
      parentsPath.forEach(parentNode => {
        parentNode.model.node.attributes[attrAccessor] = attrValue;
      });
    }
    return { treeClone, argNode };
    // do not setTree here yet so that the caller can perform additional mutations
  }

  /** traverse up and select the parent nodes where necessary
   * @param node a node
   */
  function _computeParentNodesSelection(node: TreeModel.Node<ParsedHierarchySingleNode>) {
    const parentsPath = node.getPath();
    parentsPath.pop();
    const reversedParentSPath = parentsPath.reverse();
    // now for each of the parent if all the children are selected then label the parent as selected too
    for (const parentNode of reversedParentSPath) {
      const allChildrenAreSelected = areAllChildrenSelected(parentNode.children);
      if (allChildrenAreSelected) {
        parentNode.model.node.attributes[SELECT_KEY] = allChildrenAreSelected;
      } else {
        break;
      }
    }
  }

  /** marks a node as selected
   * @param nodeId: id of node
   */
  const selectNode = (nodeId: string) => {
    if (!tree) {
      return;
    }
    const { treeClone } = _setAttrsToNode(tree, nodeId, SELECT_KEY, true, true);
    // go up the tree look at the parent's children
    const node = treeClone.first(
      (nd: TreeModel.Node<ParsedHierarchySingleNode>) => nd.model.id === nodeId
    );
    if (!node) {
      // if node was not found do nothing.
      setTree(treeClone);
      return;
    }
    _computeParentNodesSelection(node);
    setTree(treeClone);
  };

  /** will unselect a node and cascade the effect up
   * @param nodeId - the node's id
   */
  const unSelectNode = (nodeId: string) => {
    if (!tree) {
      return;
    }
    const { treeClone } = _setAttrsToNode(tree, nodeId, SELECT_KEY, false, true, true);

    setTree(treeClone);
  };

  /** decides whether to call select or unselect based on the value to be assigned to the selected key
   * @param node - set selected value on this node
   * @param value - the node's selected value to this
   */
  const applySelectToNode = (node: TreeModel.Node<ParsedHierarchySingleNode>, value: boolean) => {
    if (value) {
      selectNode(node.model.id);
    } else {
      unSelectNode(node.model.id);
    }
  };

  /** any callback that will take a node and return whether we should select the node
   * @param callback - callback is given each node in a walk and decides whether that node should be selected by returning true or false
   */
  const autoSelectNodes = (
    callback: (node: TreeModel.Node<ParsedHierarchySingleNode>) => boolean
  ) => {
    const treeClone = cloneDeep(tree);
    if (!treeClone) {
      return;
    }
    const parentNodes: Array<TreeModel.Node<ParsedHierarchySingleNode>> = [];
    treeClone.walk(node => {
      if (callback(node)) {
        node.model.node.attributes[SELECT_KEY] = true;
        parentNodes.push(node.parent);
      }
      return true;
    });

    // remove duplicates
    const parentNodesSet = uniqWith(parentNodes, node => node.model.id);

    // now select parents accordingly
    parentNodesSet.forEach(node => {
      _computeParentNodesSelection(node);
    });
    setTree(treeClone);
  };

  /** returns all selected nodes
   * @param leafNodesOnly - whether to return leaf nodes only
   */
  const getAllSelectedNodes = (leafNodesOnly = false) => {
    const nodesList: Array<TreeModel.Node<ParsedHierarchySingleNode>> = [];
    if (!tree) {
      return [];
    }
    tree.walk(node => {
      const shouldAddNode = nodeIsSelected && !(leafNodesOnly && nodeHasChildren(node));
      if (shouldAddNode) {
        nodesList.push(node);
      }
      return true;
    });
    return nodesList;
  };

  // we need a way to set a current node as selected,
  return {
    applySelectToNode,
    autoSelectNodes,
    clearErrors,
    currentChildren,
    currentParentNode,
    errors,
    getAllSelectedNodes,
    selectNode,
    setCurrentParent,
    tree,
    unSelectNode,
  };
}
