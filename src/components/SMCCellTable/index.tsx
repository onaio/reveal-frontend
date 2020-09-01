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
const SMCTableCell: React.ElementType<LinkedCellProps> = (props: LinkedCellProps) => {
  const { cell, cellValue, hasChildren, urlPath } = props;
  const original: Dictionary = cell.row.original;
  const { plan_id, jurisdiction_id } = original;
  let url = '';
  if (hasChildren) {
    url = urlPath ? `${urlPath}/${original.jurisdiction_id}` : '';
  } else {
    // url = `${SMC_LOCATION_REPORT_URL}/${plan_id}/${jurisdiction_id}`;
    url = '';
  }
  const val =
    jurisdiction_id !== 'c071d830eb5a69df4b96f8bbcc253f6c' ? (
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
  return (
    <div>
      {hasChildren ? (
        <Link to={url}>{cellValue}</Link>
      ) : (
        // <Link to={`${urlPath}/${original.jurisdiction_id}/${MAP}`}>{cellValue}</Link>
        val
      )}
    </div>
  );
};

export default SMCTableCell;
