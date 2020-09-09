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
import DataCollectorreducer, {
  FetchIRSDataCollectors,
  makeIRSCollectorArraySelector,
  reducerName as CollectorReducerName,
} from '../../../../../store/ducks/opensrp/performanceReports/IRS/dataCollectorReport';
import DistrictReducer, {
  FetchIRSDistricts,
  makeIRSDistrictArraySelector,
  reducerName as DistrictReducerName,
} from '../../../../../store/ducks/opensrp/performanceReports/IRS/districtReport';
import SOPByDateReducer, {
  FetchIRSSOPByDate,
  makeIRSSOByDatePArraySelector,
  reducerName as SOPByDateReducerName,
} from '../../../../../store/ducks/opensrp/performanceReports/IRS/sopByDateReport';
import SOPReducer, {
  FetchIRSSOPs,
  makeIRSSOPArraySelector,
  reducerName as SOPReducerName,
} from '../../../../../store/ducks/opensrp/performanceReports/IRS/sopReport';
import { getColumnsToUse, IRSPerformanceTableCell } from './helpers';

/** register the reducers */
reducerRegistry.register(DistrictReducerName, DistrictReducer);
reducerRegistry.register(CollectorReducerName, DataCollectorreducer);
reducerRegistry.register(SOPReducerName, SOPReducer);
reducerRegistry.register(SOPByDateReducerName, SOPByDateReducer);

/** selectors */
const IRSDistrictsArraySelector = makeIRSDistrictArraySelector();
const dataCollectorArraySelector = makeIRSCollectorArraySelector();
const SOPArraySelector = makeIRSSOPArraySelector();
const SOPByDateArraySelector = makeIRSSOByDatePArraySelector(true);

/** generic IRSPerfomenceReport props */
export interface IRSPerfomenceReportProps {
  linkerField: string;
  keyToUse: string | null;
  breadCrumbs: Page[];
  cellComponent: React.ElementType;
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
  const [data, setData] = useState<Array<Dictionary<any>>>([]);
  const [dataLinkerField, setDataLinkerField] = useState<string>(props.linkerField);
  const { planId, jurisdictionId, dataCollector, sop } = props.match.params;

  const {
    pageTitle,
    service,
    columns,
    fetchDataCollectors,
    fetchDistricts,
    fetchSOPs,
    fetchSopByDate,
    tableData,
    breadCrumbs,
    currentPage,
    cellComponent,
    keyToUse,
    linkerField,
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
    setLoading(tableData.length < 1);
    try {
      if (planId) {
        await service('601').then(result => {
          fetchDistricts(result);
        });
      }
      if (jurisdictionId) {
        await service('602').then(result => {
          fetchDataCollectors(result);
        });
      }
      if (dataCollector) {
        await service('604').then(result => {
          fetchSOPs(result);
        });
      }
      if (sop) {
        await service('605').then(result => {
          fetchSopByDate(result);
        });
      }
    } catch (e) {
      // todo - handle error https://github.com/onaio/reveal-frontend/issues/300
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(err => displayError(err));
  }, [planId, jurisdictionId, dataCollector, sop]);

  const tableProps = {
    columns,
    data: tableData,
    extraCellProps: { urlPath: currentPage.url, keyToUse, linkerField },
    CellComponent: cellComponent,
    identifierField: 'id',
    linkerField,
    paginate: false,
    renderNullDataComponent: () => <NoDataComponent />,
    resize: true,
    useDrillDown: false,
  };

  if (loading) {
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
  linkerField: 'district_name',
  keyToUse: null,
  breadCrumbs: [],
  cellComponent: IRSPerformanceTableCell,
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
  linkerField: string;
  keyToUse: string | null;
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
  const { planId, jurisdictionId, dataCollector, sop } = params;
  let tableData: Array<Dictionary<any>> = [];
  const plan = getPlanByIdSelector(state, planId || '');
  const districts = IRSDistrictsArraySelector(state, {
    plan_id: planId,
  });
  const breadCrumbs: Page[] = [defaultProps.currentPage];

  let linkerField = 'district_name';
  let keyToUse: string | null = 'district_id';
  let currentLabel = (plan && plan.plan_title) || '';
  let currentUrl = `${PERFORMANCE_REPORT_IRS_PLAN_URL}/${planId}`;

  const columns = getColumnsToUse(params);
  tableData = districts;
  if (jurisdictionId) {
    keyToUse = 'data_collector';
    linkerField = 'data_collector';
    breadCrumbs.push({ label: currentLabel, url: currentUrl });
    tableData = dataCollectorArraySelector(state, {
      district_id: jurisdictionId,
      plan_id: planId,
    });
    currentLabel = districts.length ? districts[0].district_name : currentLabel;
    currentUrl = `${PERFORMANCE_REPORT_IRS_PLAN_URL}/${planId}/${jurisdictionId}`;
  }

  if (jurisdictionId && dataCollector) {
    keyToUse = 'sop';
    linkerField = 'sop';
    breadCrumbs.push({ label: currentLabel, url: currentUrl });
    currentUrl = `${PERFORMANCE_REPORT_IRS_PLAN_URL}/${planId}/${jurisdictionId}/${dataCollector}`;
    currentLabel = dataCollector;
    tableData = SOPArraySelector(state, {
      data_collector: dataCollector,
      district_id: jurisdictionId,
      plan_id: planId,
    });
  }

  if (jurisdictionId && dataCollector && sop) {
    keyToUse = null;
    linkerField = 'event_date';
    breadCrumbs.push({ label: currentLabel, url: currentUrl });
    currentUrl = `${PERFORMANCE_REPORT_IRS_PLAN_URL}/${planId}/${jurisdictionId}/${dataCollector}/${sop}`;
    currentLabel = sop;
    tableData = SOPByDateArraySelector(state, {
      data_collector: dataCollector,
      district_id: jurisdictionId,
      plan_id: planId,
      sop,
    });
  }

  const currentPage: Page = {
    label: currentLabel,
    url: currentUrl,
  };

  const pageTitle = `${IRS_PERFORMANCE_REPORTING_TITLE}: ${currentLabel}`;
  return {
    linkerField,
    keyToUse,
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
