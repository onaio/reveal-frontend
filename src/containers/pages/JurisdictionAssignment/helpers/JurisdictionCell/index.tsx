/** component in the jurisdictionTable selector that will render a node according to a few rules:
 * 1) as a link if the node has children
 * 2) as plain text if the node does not have children.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';

/**
 * Props for NodeCell
 */
export interface NodeCellProps {
  node: TreeNode /** the current jurisdiction */;
  baseUrl: string;
}

/**
 * NodeCell
 *
 * Displays the jurisdiction.  If the jurisdiction is not a leaf node, then it is
 * displayed as a link, so that one can traverse down the tree.
 * @param props - the props
 */
const NodeCell = (props: NodeCellProps) => {
  const { node, baseUrl } = props;

  // isLeafNode if node does not have children
  const isLeafNode = !node.hasChildren();

  if (isLeafNode) {
    return <span key={`${node.model.id}-span`}>{node.model.label}</span>;
  }

  return (
    <Link to={`${baseUrl}/${node.model.id}`} key={`${node.model.id}-span`}>
      {node.model.label}
    </Link>
  );
};

export { NodeCell };
