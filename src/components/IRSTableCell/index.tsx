import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropDownCellProps } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { MAP } from '../../constants';

/** Interface for linked cell props */
export interface LinkedCellProps extends DropDownCellProps {
  urlPath?: string;
}

/** Component that will be rendered in drop-down table cells showing a link
 * that moves you to the next hierarchical level.
 */
const IRSTableCell: React.ElementType<LinkedCellProps> = (props: LinkedCellProps) => {
  const { cell, cellValue, hasChildren, urlPath } = props;
  const original: Dictionary = cell.row.original;
  const url = urlPath ? `${urlPath}/${original.jurisdiction_id}` : '';
  const val =
    hasChildren || original.is_virtual_jurisdiction ? (
      <span className="plan-jurisdiction-name name-label">{cellValue}</span>
    ) : (
      <span className="plan-jurisdiction-name main-span">
        <span className="plan-jurisdiction-name btn-link">
          <Link to={`${urlPath}/${original.jurisdiction_id}/${MAP}`}>
            <FontAwesomeIcon icon={['fas', MAP]} />
          </Link>
        </span>
        &nbsp;&nbsp;
        <Link to={`${urlPath}/${original.jurisdiction_id}/${MAP}`}>{cellValue}</Link>
      </span>
    );
  return <div>{hasChildren ? <Link to={url}>{cellValue}</Link> : val}</div>;
};

export default IRSTableCell;
