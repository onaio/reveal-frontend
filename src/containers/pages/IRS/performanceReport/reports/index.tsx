import { DrillDownColumn, DrillDownTable } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
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
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../../components/Table/NoDataComponent';
import { SUPERSET_MAX_RECORDS } from '../../../../../configs/env';
import { HOME, IRS_PERFORMANCE_REPORTING_TITLE } from '../../../../../configs/lang';
import {
  HOME_URL,
  PERFORMANCE_REPORT_IRS_PLAN_URL,
  QUERY_PARAM_DATE,
  QUERY_PARAM_TITLE,
} from '../../../../../constants';
import { displayError } from '../../../../../helpers/errors';
import { getQueryParams, RouteParams } from '../../../../../helpers/utils';
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
import './index.css';

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
  breadCrumbs: Page[];
  cellComponent: React.ElementType;
  columns: Array<DrillDownColumn<Dictionary<{}>>>;
  currentPage: Page;
  fetchDataCollectors: typeof FetchIRSDataCollectors;
  fetchDistricts: typeof FetchIRSDistricts;
  fetchSOPs: typeof FetchIRSSOPs;
  fetchSopByDate: typeof FetchIRSSOPByDate;
  linkerField: string;
  pageTitle: string;
  service: typeof supersetFetch;
  tableData: Array<Dictionary<any>>;
  urlParamField: string | null;
}

const IRSPerfomenceReport = (
  props: IRSPerfomenceReportProps & RouteComponentProps<RouteParams>
) => {
  const [loading, setLoading] = useState<boolean>(false);
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
    urlParamField,
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
        const fetchPlansParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
          { comparator: planId, operator: '==', subject: 'plan_id' },
        ]);
        await service('601', fetchPlansParams).then(result => {
          fetchDistricts(result);
        });
      }
      if (planId && jurisdictionId) {
        const fetchPlansParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
          { comparator: planId, operator: '==', subject: 'plan_id' },
          { comparator: jurisdictionId, operator: '==', subject: 'district_id' },
        ]);
        await service('602', fetchPlansParams).then(result => {
          fetchDataCollectors(result);
        });
      }
      if (planId && jurisdictionId && dataCollector) {
        const fetchPlansParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
          { comparator: planId, operator: '==', subject: 'plan_id' },
          { comparator: jurisdictionId, operator: '==', subject: 'district_id' },
          { comparator: dataCollector, operator: '==', subject: 'data_collector' },
        ]);
        await service('604', fetchPlansParams).then(result => {
          fetchSOPs(result);
        });
      }
      if (planId && jurisdictionId && dataCollector && sop) {
        const fetchPlansParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
          { comparator: planId, operator: '==', subject: 'plan_id' },
          { comparator: jurisdictionId, operator: '==', subject: 'district_id' },
          { comparator: dataCollector, operator: '==', subject: 'data_collector' },
          { comparator: dataCollector, operator: '==', subject: 'data_collector' },
        ]);
        await service('609', fetchPlansParams).then(result => {
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
    CellComponent: cellComponent,
    columns,
    data: tableData || [],
    extraCellProps: { urlPath: currentPage.url, urlParamField },
    identifierField: 'id',
    linkerField,
    paginate: false,
    renderInBottomFilterBar: renderInFilterFactory({
      showColumnHider: false,
      showFilters: false,
      showPagination: true,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderInTopFilterBar: renderInFilterFactory({
      ...defaultOptions,
      componentProps: props,
      queryParam: sop ? QUERY_PARAM_DATE : QUERY_PARAM_TITLE,
    }),
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
  linkerField: 'district_name',
  pageTitle: IRS_PERFORMANCE_REPORTING_TITLE,
  service: supersetFetch,
  tableData: [],
  urlParamField: null,
};

IRSPerfomenceReport.defaultProps = defaultProps;
export { IRSPerfomenceReport };

/** Connect the component to the store */
/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  breadCrumbs: Page[];
  columns: Array<DrillDownColumn<Dictionary<{}>>>;
  currentPage: Page;
  linkerField: string;
  pageTitle: string;
  tableData: Array<Dictionary<any>>;
  urlParamField: string | null;
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const { params } = ownProps.match;
  const { planId, jurisdictionId, dataCollector, sop } = params;
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const searchedDate = getQueryParams(ownProps.location).date as string;

  let tableData: Array<Dictionary<any>> = [];
  const plan = getPlanByIdSelector(state, planId || '');
  const districts = IRSDistrictsArraySelector(state, {
    district_name: searchedTitle,
    plan_id: planId,
  });
  const breadCrumbs: Page[] = [defaultProps.currentPage];

  let linkerField = 'district_name';
  let urlParamField: string | null = 'district_id';
  let currentLabel = (plan && plan.plan_title) || 'plan';
  let currentUrl = `${PERFORMANCE_REPORT_IRS_PLAN_URL}/${planId}`;

  const columns = getColumnsToUse(params);
  tableData = districts;
  if (jurisdictionId) {
    urlParamField = linkerField = 'data_collector';
    breadCrumbs.push({ label: currentLabel, url: currentUrl });
    tableData = dataCollectorArraySelector(state, {
      data_collector: searchedTitle,
      district_id: jurisdictionId,
      plan_id: planId,
    });
    currentLabel = districts.length ? districts[0].district_name : 'district';
    currentUrl = `${currentUrl}/${jurisdictionId}`;
  }

  if (jurisdictionId && dataCollector) {
    urlParamField = linkerField = 'sop';
    breadCrumbs.push({ label: currentLabel, url: currentUrl });
    currentUrl = `${currentUrl}/${dataCollector}`;
    currentLabel = dataCollector;
    tableData = SOPArraySelector(state, {
      data_collector: dataCollector,
      district_id: jurisdictionId,
      plan_id: planId,
      sop: searchedTitle,
    });
  }

  if (jurisdictionId && dataCollector && sop) {
    urlParamField = null;
    linkerField = 'event_date';
    breadCrumbs.push({ label: currentLabel, url: currentUrl });
    currentUrl = `${currentUrl}/${sop}`;
    currentLabel = sop;
    tableData = SOPByDateArraySelector(state, {
      // data_collector: dataCollector,
      date: searchedDate,
      // district_id: jurisdictionId,
      // plan_id: planId,
      // sop,
    });
  }

  const currentPage: Page = {
    label: currentLabel,
    url: currentUrl,
  };

  const pageTitle = `${IRS_PERFORMANCE_REPORTING_TITLE}: ${currentLabel}`;
  return {
    breadCrumbs,
    columns,
    currentPage,
    linkerField,
    pageTitle,
    tableData,
    urlParamField,
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