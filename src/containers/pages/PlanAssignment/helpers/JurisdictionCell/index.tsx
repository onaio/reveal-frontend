import React from 'react';
import { Link } from 'react-router-dom';
import {
  OpenSRPJurisdiction,
  SimpleJurisdiction,
} from '../../../../../components/TreeWalker/types';

/**
 * Props for JurisdictionCell
 */
export interface JurisdictionCellProps {
  jurisdictionTree: SimpleJurisdiction[] /** the jurisdiction tree, structured as in the adjacency list model */;
  node: OpenSRPJurisdiction /** the current jurisdiction */;
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
  const { jurisdictionTree, node, url } = props;

  const knownParentIds = jurisdictionTree.map(item => item.jurisdiction_parent_id);
  const isLeafNode: boolean = !knownParentIds.includes(node.id);

  if (isLeafNode) {
    return <span key={`${node.id}-span`}>{node.properties.name}</span>;
  }

  return (
    <Link key={`${node.id}-link`} to={url}>
      {node.properties.name}
    </Link>
  );
};

export { JurisdictionCell };
