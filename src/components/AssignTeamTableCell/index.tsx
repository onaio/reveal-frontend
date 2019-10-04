import React from 'react';
import Button from 'reactstrap/lib/Button';
import { stopPropagationAndPreventDefault } from '../../helpers/utils';

/** Interface for Assign Teams cell props */
export interface AssignTeamCellProps {
  jurisdictionId: string;
  planId: string;
}

/** Component that will be rendered in IRS planning table cells
 * showing the button and card in the Assign Teams column
 */
const AssignTeamTableCell: React.ElementType<AssignTeamCellProps> = (
  props: AssignTeamCellProps
) => {
  const AssignTeamButton = (
    <Button color="primary" onClick={stopPropagationAndPreventDefault} size="sm">
      Assign Teams
    </Button>
  );

  return <div>{AssignTeamButton}</div>;
};

export default AssignTeamTableCell;
