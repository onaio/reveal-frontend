import { DropDownCellProps } from '@onaio/drill-down-table';
import React from 'react';
import { Link } from 'react-router-dom';
import { FI_URL } from '../../constants';

/** Interface for linked cell props */
export interface LinkedCellProps extends DropDownCellProps {
  urlPath?: string;
}

/** Component that will be rendered in drop-down table cells showing a link
 * that moves you to the next hierarchical level.
 */
const DrillDownTableLinkedCell: React.ElementType<LinkedCellProps> = (props: LinkedCellProps) => {
  const { cellValue, hasChildren, urlPath } = props;
  return (
    <div>{hasChildren ? <Link to={`${urlPath}/${cellValue}`}>{cellValue}</Link> : cellValue}</div>
  );
};

DrillDownTableLinkedCell.defaultProps = {
  urlPath: `${FI_URL}/historical`,
};

export default DrillDownTableLinkedCell;
