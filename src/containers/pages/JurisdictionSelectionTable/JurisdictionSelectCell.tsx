/** component in the jurisdictionTable selector that will render a node according to a few rules:
 * 1) as a link if the node has children
 * 2) as plain text if the node does not have children.
 */
import { Dictionary } from '@onaio/utils';
import React from 'react';
import TreeModel from 'tree-model/types';
import { ParsedHierarchySingleNode } from './utils';

/**
 * Props for JurisdictionCell
 */
export interface JurisdictionCellProps {
  node: TreeModel.Node<ParsedHierarchySingleNode> /** the current jurisdiction */;
  onClickCallback: (event: React.MouseEvent) => void;
}

/**
 * JurisdictionCell
 *
 * Displays the jurisdiction.  If the jurisdiction is not a leaf node, then it is
 * displayed as a link, so that one can traverse down the tree.
 *
 * @param props - the props
 */
const JurisdictionCell = (props: JurisdictionCellProps) => {
  const { node, onClickCallback } = props;

  // isLeafNode if node does not have children
  const nodeHasChildren = node.children.length > 0;

  const className = nodeHasChildren ? 'btn-link' : '';

  let spanProps: Dictionary = {};
  if (nodeHasChildren) {
    spanProps = {
      className,
      onClick: onClickCallback,
      style: { cursor: 'pointer' },
    };
  }

  return (
    <span {...spanProps} key={`${node.id}-span`}>
      {node.model.label}
    </span>
  );
};

export { JurisdictionCell };
