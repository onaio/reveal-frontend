/** component in the jurisdictionTable selector that will render a node according to a few rules:
 * 1) as a link if the node has children
 * 2) as plain text if the node does not have children.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { OpenSRPJurisdiction, SimpleJurisdiction } from '../../../components/TreeWalker/types';

/**
 * Props for JurisdictionCell
 */
export interface JurisdictionCellProps {
  // TODO - remove any here
  node: any /** the current jurisdiction */;
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

  // isLeafNode if node does not have children
  const nodeHasChildren = !!node.children;
  const isLeafNode: boolean = !nodeHasChildren;

  const nodeLabel = node.model.label;

  if (isLeafNode) {
    return <span key={`${node.id}-span`}>{nodeLabel}</span>;
  }

  return (
    <Link key={`${node.id}-link`} to={url}>
      {nodeLabel}
    </Link>
  );
};

export { JurisdictionCell };
