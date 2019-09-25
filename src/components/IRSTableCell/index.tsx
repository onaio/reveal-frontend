import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropDownCellProps } from '@onaio/drill-down-table';
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
  const url = urlPath ? `${urlPath}/${cell.original.jurisdiction_id}` : '';
  const val = hasChildren ? (
    cellValue
  ) : (
    <span>
      <span className="plan-jurisdiction-name btn-link">
        <Link to={`${urlPath}/${MAP}/${cell.original.jurisdiction_id}`}>
          <FontAwesomeIcon icon={['fas', MAP]} />
        </Link>
        &nbsp;&nbsp;
      </span>
      {cellValue}
    </span>
  );
  return <div>{hasChildren ? <Link to={url}>{cellValue}</Link> : val}</div>;
};

export default IRSTableCell;
