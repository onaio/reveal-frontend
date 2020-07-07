import React, { Fragment, useState } from 'react';
import { Tooltip } from 'reactstrap';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';
/** Props for SelectedJurisdictionsCount  */
export interface SelectedJurisdictionsCountProps {
  jurisdictions: TreeNode[] /** array of jurisdictions */;
}

/** default props for SelectedJurisdictionsCount */
const defaultProps: SelectedJurisdictionsCountProps = {
  jurisdictions: [],
};

/**
 * SelectedJurisdictionsCount
 *
 * This component displays the count of the selected jurisdictions
 *
 * @param props - the props!
 */
const SelectedJurisdictionsCount = (props: SelectedJurisdictionsCountProps) => {
  const { jurisdictions } = props;

  if (!jurisdictions || jurisdictions.length < 1) {
    return null;
  }
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  return (
    <Fragment>
      <span id={`org-tooltip-${jurisdictions[0].id}`}>{jurisdictions.length}</span>
      <Tooltip
        placement="top"
        isOpen={tooltipOpen}
        target={`org-tooltip-${jurisdictions[0].id}`}
        toggle={toggleTooltip}
      >
        {jurisdictions.length}
      </Tooltip>
    </Fragment>
  );
};

SelectedJurisdictionsCount.defaultProps = defaultProps;

export { SelectedJurisdictionsCount };
