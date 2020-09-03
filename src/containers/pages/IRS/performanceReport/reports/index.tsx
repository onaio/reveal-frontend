import { DrillDownColumn, DrillDownTable } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Dictionary } from '@onaio/utils';
import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb, {
  Page,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';
import { NoDataComponent } from '../../../../../components/Table/NoDataComponent';
import { HOME, IRS_PERFORMANCE_REPORTING_TITLE } from '../../../../../configs/lang';
import { HOME_URL, PERFORMANCE_REPORT_IRS_PLAN_URL } from '../../../../../constants';
import { displayError } from '../../../../../helpers/errors';
import { RouteParams } from '../../../../../helpers/utils';
import supersetFetch from '../../../../../services/superset';
import { getPlanByIdSelector } from '../../../../../store/ducks/generic/plans';
import { FetchIRSDataCollectors } from '../../../../../store/ducks/opensrp/performanceReports/IRS/dataCollectorReport';
import DistrictReducer, {
  FetchIRSDistricts,
  makeIRSDistrictArraySelector,
  reducerName as DistrictReducerName,
} from '../../../../../store/ducks/opensrp/performanceReports/IRS/districtReport';
import { FetchIRSSOPByDate } from '../../../../../store/ducks/opensrp/performanceReports/IRS/sopByDateReport';
import { FetchIRSSOPs } from '../../../../../store/ducks/opensrp/performanceReports/IRS/sopReport';
import { getColumnsToUse } from './helpers';

/** register the reducers */
reducerRegistry.register(DistrictReducerName, DistrictReducer);

/** selectors */
const IRSDistrictsArraySelector = makeIRSDistrictArraySelector();

/** generic IRSPerfomenceReport props */
export interface IRSPerfomenceReportProps {
  breadCrumbs: Page[];
  columns: Array<DrillDownColumn<Dictionary<{}>>>;
  currentPage: Page;
  fetchDataCollectors: typeof FetchIRSDataCollectors;
  fetchDistricts: typeof FetchIRSDistricts;
  fetchSOPs: typeof FetchIRSSOPs;
  fetchSopByDate: typeof FetchIRSSOPByDate;
  pageTitle: string;
  service: typeof supersetFetch;
  tableData: Array<Dictionary<any>>;
}

const IRSPerfomenceReport = (
  props: IRSPerfomenceReportProps & RouteComponentProps<RouteParams>
) => {
  const [loading, setLoading] = useState<boolean>(true);

  const {
    pageTitle,
    service,
    columns,
    fetchDistricts,
    tableData,
    breadCrumbs,
    currentPage,
  } = props;

  const breadcrumbProps = {
    currentPage,
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      ...breadCrumbs,
    ],
  };

  /** async function to load the data */
  async function loadData() {
    try {
      await service('601').then(result => {
        fetchDistricts(result);
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
    data: tableData,
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

/** default props */
const defaultProps: IRSPerfomenceReportProps = {
  breadCrumbs: [],
  columns: [],
  currentPage: {
    label: IRS_PERFORMANCE_REPORTING_TITLE,
    url: PERFORMANCE_REPORT_IRS_PLAN_URL,
  },
  fetchDataCollectors: FetchIRSDataCollectors,
  fetchDistricts: FetchIRSDistricts,
  fetchSOPs: FetchIRSSOPs,
  fetchSopByDate: FetchIRSSOPByDate,
  pageTitle: IRS_PERFORMANCE_REPORTING_TITLE,
  service: supersetFetch,
  tableData: [],
};

IRSPerfomenceReport.defaultProps = defaultProps;
export { IRSPerfomenceReport };

/** Connect the component to the store */
/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  breadCrumbs: Page[];
  columns: Array<DrillDownColumn<Dictionary<{}>>>;
  currentPage: Page;
  pageTitle: string;
  tableData: Array<Dictionary<any>>;
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const { params } = ownProps.match;
  const { planId } = params;
  const plan = getPlanByIdSelector(state, planId || '');
  // this should be generated dynamically
  const breadCrumbs: Page[] = [defaultProps.currentPage];
  // this should be generated dynamically
  const currentPage = {
    label: (plan && plan.plan_title) || '',
    url: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/${planId}`,
  };
  const columns = getColumnsToUse(params);
  // this should be generated dynamically
  const tableData = IRSDistrictsArraySelector(state, {
    plan_id: planId,
  });
  const pageTitle = `${IRS_PERFORMANCE_REPORTING_TITLE}: ${currentPage.label}`;
  return {
    breadCrumbs,
    columns,
    currentPage,
    pageTitle,
    tableData,
  };
};

/** map dispatch to props */
const mapDispatchToProps = {
  fetchDataCollectors: FetchIRSDataCollectors,
  fetchDistricts: FetchIRSDistricts,
  fetchSOPs: FetchIRSSOPs,
  fetchSopByDate: FetchIRSSOPByDate,
};

/** Connected IRSPerfomenceReport component */
const ConnectedIRSPerfomenceReport = connect(
  mapStateToProps,
  mapDispatchToProps
)(IRSPerfomenceReport);

export default ConnectedIRSPerfomenceReport;
