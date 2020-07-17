/** shows the risk label */
import React from 'react';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';

interface Props {
  metadata: any[];
  node: TreeNode;
}

export const RiskLabel = (props: Props) => {
  const { metadata, node } = props;
  const metasOfInterest = metadata.filter(meta => meta.key === node.model.id);

  // pick the first one with a value
  const metaOfInterest = metasOfInterest.filter(meta => meta.value);

  const theSingleMeta = metaOfInterest[0];
  if (theSingleMeta && theSingleMeta.value) {
    return <>{theSingleMeta.value}</>;
  }
  return <>{'--'}</>;
};
