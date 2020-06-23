import { DropDownCellProps } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { MDA_POINT_LOCATION_REPORT_URL } from '../../constants';

/** Interface for linked cell props */
export interface LinkedCellProps extends DropDownCellProps {
  urlPath?: string;
}

/** Component that will be rendered in drop-down table cells showing a link
 * that moves you to the next hierarchical level.
 */
const MDAPointTableCell: React.ElementType<LinkedCellProps> = (props: LinkedCellProps) => {
  const { cell, cellValue, hasChildren, urlPath } = props;
  const original: Dictionary = cell.row.original;
  const { plan_id, jurisdiction_id } = original;
  let url = '';
  if (hasChildren) {
    url = urlPath ? `${urlPath}/${original.jurisdiction_id}` : '';
  } else {
    url = `${MDA_POINT_LOCATION_REPORT_URL}/${plan_id}/${jurisdiction_id}`;
  }
  const val =
    hasChildren || original.is_virtual_jurisdiction ? (
      <span className="plan-jurisdiction-name name-label">{cellValue}</span>
    ) : (
      <Link to={url}>{cellValue}</Link>
    );
  return <div>{hasChildren ? <Link to={url}>{cellValue}</Link> : val}</div>;
};

export default MDAPointTableCell;
