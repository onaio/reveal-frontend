import { DropDownCellProps } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import React from 'react';
import { Link } from 'react-router-dom';

/** Interface for linked cell props */
export interface LinkedCellProps extends DropDownCellProps {
  urlPath?: string;
}

/** Component that will be rendered in drop-down table cells showing a link
 * that moves you to the next hierarchical level.
 */
const GenericTableCell: React.ElementType<LinkedCellProps> = (props: LinkedCellProps) => {
  const { cell, cellValue, hasChildren, urlPath } = props;
  const original: Dictionary = cell.row.original;
  let url = '';
  if (hasChildren) {
    url = urlPath ? `${urlPath}/${original.jurisdiction_id}` : '';
    return <Link to={url}>{cellValue}</Link>;
  }

  return <span className="plan-jurisdiction-name name-label">{cellValue}</span>;
};

export default GenericTableCell;
