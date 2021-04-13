import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropDownCellProps } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { SHOW_MAP_AT_JURISDICTION_LEVEL } from '../../configs/env';
import { MAP, REPORT_MDA_LITE_WARD_URL } from '../../constants';

/** Interface for linked cell props */
export interface LinkedCellProps extends DropDownCellProps {
  urlPath?: string;
}

/** Component that will be rendered in drop-down table cells showing a link
 * that moves you to the next hierarchical level.
 */
const MDALiteTableCell: React.ElementType<LinkedCellProps> = (props: LinkedCellProps) => {
  const { cell, cellValue, hasChildren, urlPath } = props;
  const original: Dictionary = cell.row.original;
  const { jurisdiction_id, jurisdiction_depth, plan_id } = original;
  const url = `${urlPath}/${jurisdiction_id}`;
  const wardUrl = `${REPORT_MDA_LITE_WARD_URL}/${plan_id}/${jurisdiction_id}`;
  const jurLink = <Link to={url}>{cellValue}</Link>;
  if (SHOW_MAP_AT_JURISDICTION_LEVEL === +jurisdiction_depth) {
    return (
      <div style={{ minWidth: '100%' }}>
        <Row>
          <Col sm={8}>
            <Link to={wardUrl}>{cellValue}</Link>
          </Col>
          <Col sm={4}>
            <Link style={{ paddingLeft: '20px' }} to={`${url}/${MAP}`}>
              <FontAwesomeIcon icon={['fas', MAP]} />
            </Link>
          </Col>
        </Row>
      </div>
    );
  }
  const val = hasChildren ? (
    jurLink
  ) : (
    <span className="plan-jurisdiction-name name-label">{cellValue}</span>
  );
  return <div>{val}</div>;
};

export default MDALiteTableCell;
