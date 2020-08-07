import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'reactstrap';
import { Store } from 'redux';
import {
  Filters,
  getSelectedNodesUnderParentNode,
} from '../../../../../store/ducks/opensrp/hierarchies';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';

/** Props for SelectedJurisdictionsCount  */
export interface SelectedJurisdictionsCountProps {
  rootId: string;
  planId: string;
  parentNode: TreeNode;
  selectedNodesUnderParent: TreeNode[];
}

/** default props for SelectedJurisdictionsCount */
const defaultProps: Partial<SelectedJurisdictionsCountProps> = {
  selectedNodesUnderParent: [],
};

/**
 * SelectedJurisdictionsCount
 *
 * This component displays the count of the selected jurisdictions
 *
 * @param props - the props!
 */
const SelectedJurisdictionsCount = (props: SelectedJurisdictionsCountProps) => {
  const { parentNode, selectedNodesUnderParent } = props;

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const nodeJurisdictions = selectedNodesUnderParent;
  const jurisdictionNames: string[] = nodeJurisdictions.map(
    jurisdiction => jurisdiction.model.label
  );
  const toolTipDisplay = jurisdictionNames.join(', ');

  const nodeId = parentNode.model.id;

  return (
    <Fragment>
      <span id={`jurisdiction-tooltip-${nodeId}`}>{nodeJurisdictions.length}</span>
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

/** map state to props interface  */
type MapStateToProps = Pick<SelectedJurisdictionsCountProps, 'selectedNodesUnderParent'>;

/** maps props to store state */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: SelectedJurisdictionsCountProps
): MapStateToProps => {
  const filters: Filters = {
    currentParentId: ownProps.parentNode.model.id,
    leafNodesOnly: true,
    planId: ownProps.planId,
    rootJurisdictionId: ownProps.rootId,
  };
  return {
    selectedNodesUnderParent: getSelectedNodesUnderParentNode()(state, filters),
  };
};

export const ConnectedSelectedJurisdictionsCount = connect(mapStateToProps)(
  SelectedJurisdictionsCount
);
