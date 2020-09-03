import { DrillDownColumn, DrillDownTable } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';
import { NoDataComponent } from '../../../../../components/Table/NoDataComponent';
import { HOME, IRS_PERFORMANCE_REPORTING_TITLE } from '../../../../../configs/lang';
import { HOME_URL, PERFORMANCE_REPORT_IRS_PLAN_URL } from '../../../../../constants';
import { displayError } from '../../../../../helpers/errors';
import { RouteParams } from '../../../../../helpers/utils';
import supersetFetch from '../../../../../services/superset';
import { districtColumns } from './helpers';

/** generic IRSPerfomenceReport props */
export interface IRSPerfomenceReportProps {
  columns: Array<DrillDownColumn<Dictionary<{}>>>;
  pageTitle: string;
  pageURL: string;
  service: typeof supersetFetch;
}

const IRSPerfomenceReport = (
  props: IRSPerfomenceReportProps & RouteComponentProps<RouteParams>
) => {
  // const planId = props.match.params.planId;

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);

  const { pageTitle, pageURL, service, columns } = props;

  const basePage = {
    label: pageTitle,
    url: pageURL,
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

  /** async function to load the data */
  async function loadData() {
    try {
      await service('601').then(result => {
        setData(result);
        // console.log(result);
      });
    } catch (e) {
      // todo - handle error https://github.com/onaio/reveal-frontend/issues/300
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(err => displayError(err));
  }, []);

  const tableProps = {
    columns,
    data: data as Array<Dictionary<any>>,
    // extraCellProps: { urlPath: currentBaseURL }
    // CellComponent: <div></div>,
    // identifierField: 'id',
    // linkerField: 'id',
    // paginate: false,
    // parentIdentifierField: planId,
    renderNullDataComponent: () => <NoDataComponent />,
    resize: true,
    // rootParentId: planId || '',
    useDrillDown: false,
  };

  if (loading === true) {
    return <Loading />;
  }

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col>
          <h3 className="mb-3 page-title">{pageTitle}</h3>
          <div className="generic-report-table">
            <DrillDownTable {...tableProps} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

const defaultProps: IRSPerfomenceReportProps = {
  columns: districtColumns,
  pageTitle: IRS_PERFORMANCE_REPORTING_TITLE,
  pageURL: PERFORMANCE_REPORT_IRS_PLAN_URL,
  service: supersetFetch,
};

IRSPerfomenceReport.defaultProps = defaultProps;

export { IRSPerfomenceReport };
