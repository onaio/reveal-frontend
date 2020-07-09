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
  id: string;
  jurisdictions: TreeNode[] /** array of jurisdictions */;
  parentNode: TreeNode | undefined;
  selectedNodesUnderParent: TreeNode[];
}

/** default props for SelectedJurisdictionsCount */
const defaultProps: SelectedJurisdictionsCountProps = {
  id: '',
  jurisdictions: [],
  parentNode: undefined,
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
  const { id, jurisdictions, selectedNodesUnderParent } = props;

  if (!jurisdictions || jurisdictions.length < 1) {
    return null;
  }
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const nodeJurisdictions = selectedNodesUnderParent;
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

/** map state to props interface  */
type MapStateToProps = Pick<SelectedJurisdictionsCountProps, 'selectedNodesUnderParent'>;

/** maps props to store state */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: SelectedJurisdictionsCountProps
): MapStateToProps => {
  const filters: Filters = {
    parentNode: ownProps.parentNode,
    rootJurisdictionId: ownProps.id,
    selectedLeafNodes: ownProps.jurisdictions,
  };
  return {
    selectedNodesUnderParent: getSelectedNodesUnderParentNode()(state, filters),
  };
};

export const ConnectedSelectedJurisdictionsCount = connect(mapStateToProps)(
  SelectedJurisdictionsCount
);
