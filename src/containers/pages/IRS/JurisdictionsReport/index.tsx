import DrillDownTable from '@onaio/drill-down-table';
import superset from '@onaio/superset-connector';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import 'react-table/react-table.css';
import { Col, Row } from 'reactstrap';
import IRSTableCell from '../../../../components/IRSTableCell';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, HOME_URL } from '../../../../constants';
import '../../../../helpers/tables.css';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import { NamibiaColumns } from './helpers';
import './style.css';
import * as fixtures from './tests/fixtures';

export interface IRSJurisdictionProps {
  service: typeof supersetFetch;
}

const data = superset.processData(fixtures.supersetJSON) || [];

/** Renders IRS Jurisdictions reports */
const IRSJurisdictions = (props: IRSJurisdictionProps & RouteComponentProps<RouteParams>) => {
  const pageTitle = 'IRS Reports';

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: 'xxx',
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  const tableProps = {
    CellComponent: IRSTableCell,
    columns: NamibiaColumns,
    data,
    extraCellProps: { urlPath: 'xxx' },
    identifierField: 'jurisdiction_id',
    linkerField: 'jurisdiction_name',
    minRows: 0,
    parentIdentifierField: 'jurisdiction_parent_id',
    resizable: true,
    rootParentId: '',
    shouldUseEffect: false,
    showPageSizeOptions: true,
    showPagination: true,
    useDrillDownTrProps: true,
  };

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col>
          <h3 className="mb-3 page-title">{pageTitle}</h3>
          <div className="irs-report-table">
            <DrillDownTable {...tableProps} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

const defaultProps: IRSJurisdictionProps = {
  service: supersetFetch,
};

IRSJurisdictions.defaultProps = defaultProps;

export { IRSJurisdictions };
