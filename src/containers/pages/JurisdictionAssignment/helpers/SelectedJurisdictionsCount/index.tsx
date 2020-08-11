import React, { Fragment, useState } from 'react';
import { Tooltip } from 'reactstrap';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';

/** Props for SelectedJurisdictionsCount  */
export interface SelectedJurisdictionsCountProps {
  parentNode: TreeNode;
  selectedNodes: TreeNode[];
}

/** default props for SelectedJurisdictionsCount */
const defaultProps: Partial<SelectedJurisdictionsCountProps> = {
  selectedNodes: [],
};

/** computes the selected leaf nodes under the passed in parent node
 * @param parent the parent node
 * @param allSelected - a list of all selected leaf nodes
 */
const computeSelectedUnderParent = async (parent: TreeNode, allSelected: TreeNode[]) => {
  return allSelected.filter(node => {
    return node
      .getPath()
      .map(nd => nd.model.id)
      .includes(parent.model.id);
  });
};

/**
 * SelectedJurisdictionsCount
 *
 * This component displays the count of the selected jurisdictions
 *
 * @param props - the props!
 */
const SelectedJurisdictionsCount = (props: SelectedJurisdictionsCountProps) => {
  const { parentNode, selectedNodes } = props;
  const [nodesUnderParent, setNodesUnderParent] = React.useState<TreeNode[]>([]);

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  React.useEffect(() => {
    computeSelectedUnderParent(parentNode, selectedNodes)
      .then(res => {
        setNodesUnderParent(res);
      })
      .catch(() => {
        /** intentionally left blank */
      });
  }, [selectedNodes]);

  const jurisdictionNames: string[] = nodesUnderParent.map(
    jurisdiction => jurisdiction.model.label
  );
  const toolTipDisplay = jurisdictionNames.join(', ');

  const nodeId = parentNode.model.id;

  return (
    <Fragment>
      <span id={`jurisdiction-tooltip-${nodeId}`}>{nodesUnderParent.length}</span>
      <Tooltip
        placement="top"
        isOpen={tooltipOpen}
        target={`jurisdiction-tooltip-${nodeId}`}
        toggle={toggleTooltip}
      >
        <span id={`jurisdiction-span-${nodeId}`}>{toolTipDisplay}</span>;
      </Tooltip>
    </Fragment>
  );
};

SelectedJurisdictionsCount.defaultProps = defaultProps;

export { SelectedJurisdictionsCount };
