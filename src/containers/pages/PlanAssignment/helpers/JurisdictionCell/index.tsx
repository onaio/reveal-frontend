import React from 'react';
import { Link } from 'react-router-dom';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';

/**
 * Props for JurisdictionCell
 */
export interface JurisdictionCellProps {
  node: TreeNode /** the current jurisdiction as a node from the Jurisdiction Tree */;
  url: string /** the URL to use for display of nodes that do have children */;
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
  const { node, url } = props;

  if (!node.hasChildren()) {
    return <span key={`${node.model.id}-span`}>{node.model.label}</span>;
  }

  return (
    <Link key={`${node.model.id}-link`} to={url}>
      {node.model.label}
    </Link>
  );
};

export { JurisdictionCell };
