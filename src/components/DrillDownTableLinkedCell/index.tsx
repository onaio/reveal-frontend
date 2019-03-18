import { DropDownCellProps } from '@onaio/drill-down-table';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { FOCUS_INVESTIGATION_URL } from '../../constants';

interface DDX extends RouteComponentProps, DropDownCellProps {}

/** Component that will be rendered in drop-down table cells showing a link
 * that moves you to the next hierarchical level.
 */
const DrillDownTableLinkedCell: React.ElementType<DDX> = (props: DropDownCellProps) => {
  const { cellValue, hasChildren } = props;
  return (
    <div>
      {hasChildren ? (
        <Link to={`${FOCUS_INVESTIGATION_URL}/${cellValue}`}>{cellValue}</Link>
      ) : (
        cellValue
      )}
    </div>
  );
};

export default withRouter(DrillDownTableLinkedCell);
