import React, { Fragment, useState } from 'react';
import { Tooltip } from 'reactstrap';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';

/** Props for SelectedJurisdictionsCount  */
export interface SelectedJurisdictionsCountProps {
  id: string;
  jurisdictions: TreeNode[] /** array of jurisdictions */;
  parentNode: TreeNode | undefined;
}

/** default props for SelectedJurisdictionsCount */
const defaultProps: SelectedJurisdictionsCountProps = {
  id: '',
  jurisdictions: [],
  parentNode: undefined,
};

/**
 * getSelectedNodesUnderParentNode
 *
 * Disects the selected nodes to the respective children as you drill down the table
 *
 * @param tree - Parent node of the tree
 * @param selectedLeafNodes - an array of all the selected leaf nodes
 */
const getSelectedNodesUnderParentNode = (
  tree: TreeNode | undefined,
  selectedLeafNodes: TreeNode[]
): TreeNode[] => {
  const nodesList: TreeNode[] = [];
  if (!tree) {
    return selectedLeafNodes;
  }
  tree.walk(node => {
    selectedLeafNodes.forEach(leaf => {
      if (leaf.model.id === node.model.id) {
        nodesList.push(leaf);
      }
    });
    return true;
  });
  return nodesList;
};
/**
 * SelectedJurisdictionsCount
 *
 * This component displays the count of the selected jurisdictions
 *
 * @param props - the props!
 */
const SelectedJurisdictionsCount = (props: SelectedJurisdictionsCountProps) => {
  const { id, jurisdictions, parentNode } = props;

  if (!jurisdictions || jurisdictions.length < 1) {
    return null;
  }
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const nodeJurisdictions = getSelectedNodesUnderParentNode(parentNode, jurisdictions);
  const jurisdictionNames: string[] = nodeJurisdictions.map(
    jurisdiction => jurisdiction.model.label
  );
  const toolTipDisplay = jurisdictionNames.join(', ');

  return (
    <Fragment>
      <span id={`jurisdiction-tooltip-${id}`}>{nodeJurisdictions.length}</span>
      <Tooltip
        placement="top"
        isOpen={tooltipOpen}
        target={`jurisdiction-tooltip-${id}`}
        toggle={toggleTooltip}
      >
        <span id={`jurisdiction-span-${id}`}>{toolTipDisplay}</span>;
      </Tooltip>
    </Fragment>
  );
};

SelectedJurisdictionsCount.defaultProps = defaultProps;

export { SelectedJurisdictionsCount };
