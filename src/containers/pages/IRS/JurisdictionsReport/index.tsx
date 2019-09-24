import DrillDownTable from '@onaio/drill-down-table';
import superset from '@onaio/superset-connector';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import 'react-table/react-table.css';
import { Col, Row } from 'reactstrap';
import IRSTableCell from '../../../../components/IRSTableCell';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, HOME_URL, IRS_REPORTING_TITLE, IRS_REPORTS_URL } from '../../../../constants';
import '../../../../helpers/tables.css';
import { FlexObject, RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import { getTree, NamibiaColumns } from './helpers';
import './style.css';
import * as fixtures from './tests/fixtures';

export interface IRSJurisdictionProps {
  service: typeof supersetFetch;
}

const data = superset.processData(fixtures.supersetJSON) || [];

/** Renders IRS Jurisdictions reports */
const IRSJurisdictions = (props: IRSJurisdictionProps & RouteComponentProps<RouteParams>) => {
  const [id, setId] = useState<string | null>(
    props.match && props.match.params && props.match.params.id ? props.match.params.id : null
  );

  useEffect(() => {
    if (props.match && props.match.params && props.match.params.id) {
      setId(props.match.params.id);
    } else {
      setId(null);
    }
  }, [props.match.params.id]);

  const pageTitle = IRS_REPORTING_TITLE;

  const basePage = {
    label: pageTitle,
    url: IRS_REPORTS_URL,
  };

  const breadcrumbProps = {
    currentPage: basePage,
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  const theObject = data.filter((el: FlexObject) => el.jurisdiction_id === id);

  let currentJurisdictionName: string | null = null;
  if (theObject && theObject.length > 0) {
    const theTree = getTree(data, theObject[0]);
    theTree.reverse();
    const pages = theTree.map(el => {
      return {
        label: el.jurisdiction_name,
        url: `${IRS_REPORTS_URL}/${el.jurisdiction_id}`,
      };
    });

    breadcrumbProps.pages.push(basePage);

    const newPages = breadcrumbProps.pages.concat(pages);
    breadcrumbProps.pages = newPages;

    const currentPage = {
      label: theObject[0].jurisdiction_name,
      url: `${IRS_REPORTS_URL}/${theObject[0].jurisdiction_id}`,
    };
    breadcrumbProps.currentPage = currentPage;

    currentJurisdictionName = theObject[0].jurisdiction_name;
  }

  const tableProps = {
    CellComponent: IRSTableCell,
    columns: NamibiaColumns,
    data,
    defaultPageSize: 500,
    extraCellProps: { urlPath: IRS_REPORTS_URL },
    getTdProps: (state: any, rowInfo: any, column: any, instance: any) => {
      return {
        onClick: (e: any, handleOriginal: any) => {
          if (column.id === 'jurisdiction_name') {
            setId(rowInfo.original.jurisdiction_id);
            props.history.push(`${IRS_REPORTS_URL}/${rowInfo.original.jurisdiction_id}`);
          }
          if (handleOriginal) {
            handleOriginal();
          }
        },
      };
    },
    identifierField: 'jurisdiction_id',
    linkerField: 'jurisdiction_name',
    minRows: 0,
    parentIdentifierField: 'jurisdiction_parent_id',
    resizable: true,
    rootParentId: id || '',
    shouldUseEffect: false,
    showPagination: false,
    useDrillDownTrProps: false,
  };

  const currentTitle = currentJurisdictionName
    ? `${pageTitle}: ${currentJurisdictionName}`
    : pageTitle;

  return (
    <div key={id || '0'}>
      <Helmet>
        <title>{currentTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col>
          <h3 className="mb-3 page-title">{currentTitle}</h3>
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
