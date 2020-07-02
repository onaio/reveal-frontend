/** component in the jurisdictionTable selector that will render a node according to a few rules:
 * 1) as a link if the node has children
 * 2) as plain text if the node does not have children.
 */
import { Dictionary } from '@onaio/utils';
import React from 'react';
import { TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import { nodeHasChildren } from '../../../../store/ducks/opensrp/hierarchies/utils';

/**
 * Props for NodeCell
 */
export interface NodeCellProps {
  node: TreeNode /** the current jurisdiction */;
  onClickCallback: (event: React.MouseEvent) => void;
}

/**
 * NodeCell
 *
 * Displays the jurisdiction.  If the jurisdiction is not a leaf node, then it is
 * displayed as a link, so that one can traverse down the tree.
 *
 * @param props - the props
 */
const NodeCell = (props: NodeCellProps) => {
  const { node, onClickCallback } = props;

  // isLeafNode if node does not have children
  const isLeafNode = !nodeHasChildren(node);
  const className = isLeafNode ? '' : 'btn-link cursor-pointer';

  let spanProps: Dictionary = {};
  if (!isLeafNode) {
    spanProps = {
      className,
      onClick: onClickCallback,
    };
  }

  return (
    <span {...spanProps} key={`${node.id}-span`}>
      {node.model.label}
    </span>
  );
};

export { NodeCell };
