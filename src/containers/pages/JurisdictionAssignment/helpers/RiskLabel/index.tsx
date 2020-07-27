/** Rendered as a table cell and shows the risk label for a given jurisdiction node */
import React from 'react';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';
import { JurisdictionsMetadata } from '../../../../../store/ducks/opensrp/jurisdictionsMetadata';

export interface RiskLabelProps {
  metadata: JurisdictionsMetadata[];
  node: TreeNode;
}

/** finds the nodes risk label from the fetched metadata and displays it */
export const RiskLabel = (props: RiskLabelProps) => {
  const { metadata, node } = props;

  // could get more that one meta objects
  const metasOfInterest = metadata.filter(meta => meta.key === node.model.id);

  // pick the first one with a value
  const metaOfInterest = metasOfInterest.filter(meta => meta.value !== undefined);
  const theSingleMeta = metaOfInterest[0];

  if (theSingleMeta && theSingleMeta.value) {
    return <>{theSingleMeta.value}</>;
  }
  return <>{'--'}</>;
};
