/** a reducer hook to manage changes to the jurisdiction tree */
// need some immutability

import { Result } from '@onaio/utils/dist/types/types';
import { cloneDeep } from 'lodash';
import React from 'react';
import TreeModel from 'tree-model/types';
import { LoadOpenSRPHierarchy } from '../../../helpers/dataLoading/jurisdictions';
import { OpenSRPService } from '../../../services/opensrp';
import { generateJurisdictionTree, ParsedHierarchySingleNode, RawOpenSRPHierarchy } from './utils';

// need some re-activeness
export function useJurisdictionReducer(rootJurisdictionId: string) {
  // TODO - make tree immutable;
  const [tree, setTree] = React.useState<TreeModel.Node<ParsedHierarchySingleNode> | undefined>(
    undefined
  );
  const [currentParentNode, setCurrentParent] = React.useState<
    TreeModel.Node<ParsedHierarchySingleNode> | undefined
  >(undefined);
  const [currentChildren, setCurrentChildren] = React.useState<
    Array<TreeModel.Node<ParsedHierarchySingleNode>>
  >([]);

  React.useEffect(() => {
    // fetch jurisdiction hierarchy
    const params = {
      return_structure_count: true,
    };
    LoadOpenSRPHierarchy(rootJurisdictionId, OpenSRPService, params)
      .then((apiResponse: Result<RawOpenSRPHierarchy>) => {
        // create parseable tree
        if (apiResponse.value) {
          const responseData = apiResponse.value;
          const theTree = generateJurisdictionTree(responseData);
          setTree(theTree);
          setCurrentChildren([theTree]);
        } else {
          // TODO- handle broken page
        }
      })
      .catch(_ => {
        // TODO - set page broken here.
      });
  }, []);

  React.useEffect(() => {
    // reactive when currentParent changes
    if (currentParentNode) {
      setCurrentChildren(currentParentNode.children);
    }
  }, [currentParentNode]);

  React.useEffect(() => {
    // update currentParentNode
    if (tree && !currentParentNode) {
      setCurrentChildren([tree]);
    }
    if (currentParentNode) {
      const updatedCurrentParent = tree!.first(nd => nd.model.id === currentParentNode.model.id);
      setCurrentParent(updatedCurrentParent);
    }
  }, [tree]);

  function setAttrsToNode(
    aTree: TreeModel.Node<ParsedHierarchySingleNode>,
    nodeId: string,
    attrAccessor: string,
    attrValue: string | number | boolean,
    cascade: boolean
  ) {
    const treeClone = cloneDeep(aTree);
    const argNode = treeClone.first(nd => nd.model.id === nodeId);
    if (!argNode) {
      return treeClone;
    }
    if (cascade) {
      argNode.walk(nd => {
        nd.model.node.attributes[attrAccessor] = attrValue;
        return true;
      });
    }
    return { treeClone, argNode };
    // do not setTree here yet so that the caller can perform additional mutations
  }

  function areAllChildrenSelected(childrenNodes: Array<TreeModel.Node<ParsedHierarchySingleNode>>) {
    let selected = true;
    childrenNodes.forEach(node => {
      selected = selected && node.model.node.attributes.selected;
    });
    return selected;
  }

  const selectNode = (nodeId: string) => {
    if (!tree) {
      return;
    }
    const { treeClone } = setAttrsToNode(tree, nodeId, 'selected', true, true);
    // go up the tree look at the parent's children
    const node = treeClone.first(
      (nd: TreeModel.Node<ParsedHierarchySingleNode>) => nd.model.id === nodeId
    );
    if (!node) {
      setTree(treeClone);
      return;
    }
    const parentsPath = node.getPath();
    parentsPath.pop();
    const reversedParentSPath = parentsPath.reverse();
    // now for each of the parent if all the children are selected then label the parent as selected too
    for (const parentNode of reversedParentSPath) {
      const allChildrenAreSelected = areAllChildrenSelected(parentNode.children);
      if (allChildrenAreSelected) {
        parentNode.model.node.attributes.selected = allChildrenAreSelected;
      } else {
        break;
      }
    }
    setTree(treeClone);
  };

  const unSelectNode = (nodeId: string) => {
    if (!tree) {
      return;
    }
    const { treeClone, argNode } = setAttrsToNode(tree, nodeId, 'selected', false, true);

    // set all the children to unselected.
    const path = argNode.getPath();
    path.forEach((nd: any) => {
      nd.model.node.attributes.selected = false;
    });
    setTree(treeClone);
  };

  const applySelectToNode = (node: any, value: boolean) => {
    if (value) {
      selectNode(node.model.id);
    } else {
      unSelectNode(node.model.id);
    }
  };

  // we need a way to set a current node as selected,
  return {
    applySelectToNode,
    currentChildren,
    currentParentNode,
    selectNode,
    setAttrsToNode,
    setCurrentParent,
    tree,
    unSelectNode,
  };
}
