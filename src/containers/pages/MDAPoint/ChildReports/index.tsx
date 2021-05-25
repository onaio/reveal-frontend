import reducerRegistry from '@onaio/redux-reducer-registry';
import superset, { SupersetAdhocFilterOption } from '@onaio/superset-connector';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { buildBreadCrumbs } from '../../../../components/GenericSupersetDataTable/helpers';
import HeaderBreadcrumb, {
  Page,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  SUPERSET_MAX_RECORDS,
  SUPERSET_MDA_POINT_CHILD_REPORT_DATA_SLICE,
  SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_DATA_SLICES,
} from '../../../../configs/env';
import {
  ADR_REPORTED,
  ALB_TABLETS_DISTRIBUTED,
  CHILDS_NAME,
  ENROLLED_IN_SCHOOL,
  HOME,
  MDA_POINT_CHILD_REPORT_TITLE,
  MDA_POINT_PLANS,
  MMA_DRUGS_ADMINISTRED,
  NATIONAL_ID,
  NO,
  PZQ_DISTRIBUTED,
  SACS_REFUSED,
  SACS_SICK,
  YES,
} from '../../../../configs/lang';
import {
  CONTRAINDICATED,
  HOME_URL,
  MDA_POINT_CHILD_REPORT_URL,
  PREGNANT,
  REFUSED,
  REPORT_MDA_POINT_PLAN_URL,
  SICK,
} from '../../../../constants';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import { getGenericJurisdictionsArray } from '../../../../store/ducks/generic/jurisdictions';
import MDAPointChildReportReducer, {
  ChildReport,
  FetchMDAPointChildReportAction,
  makeMDAPointChildReportsArraySelector,
  reducerName as MDAPointChildReportReducerName,
} from '../../../../store/ducks/generic/MDAChildReport';
import { getPlanByIdSelector } from '../../../../store/ducks/generic/plans';
import { ChildSupersetDataTable, ChildSupersetDataTableProps } from './ChildSupersetDataTable';
/** register the MDA point child report definitions reducer */
reducerRegistry.register(MDAPointChildReportReducerName, MDAPointChildReportReducer);

const slices = SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_DATA_SLICES.split(',');

interface ChildReportsProps extends ChildSupersetDataTableProps {
  pageTitle: string | null;
  pageUrl: string;
  prevPage: Page[] | null;
  jurisdictionId?: string;
  planId?: string;
}

const tableHeaders = [
  CHILDS_NAME,
  NATIONAL_ID,
  ENROLLED_IN_SCHOOL,
  MMA_DRUGS_ADMINISTRED,
  SACS_REFUSED,
  SACS_SICK,
  ADR_REPORTED,
  PZQ_DISTRIBUTED,
  ALB_TABLETS_DISTRIBUTED,
];

/**
 * get value to be displayed on SACs columns
 * @param {string | null} value - reason why drug was not administered
 * @param {boolean} isRefusedColumn - indicates which column is being checked
 */
export const getSACsColumnsValues = (value: string | null, isRefusedColumn: boolean) => {
  if (value === REFUSED) {
    return isRefusedColumn ? YES : NO;
  }
  if ([PREGNANT, SICK, CONTRAINDICATED].includes(value as string)) {
    return isRefusedColumn ? NO : YES;
  }
  return '';
};

/*
 * returns list of childrens
 * @param {ChildReport[]} props
 * @return - extracted list of child data
 */
export const extractChildData = (data: ChildReport[]) => {
  const returnRowValue = (value: any) => {
    let valueOfInterest;
    if (value === null || value === undefined) {
      valueOfInterest = '';
    } else if (+value === 0) {
      valueOfInterest = NO;
    } else {
      valueOfInterest = YES;
    }
    return valueOfInterest;
  };

  return data.map((sch: ChildReport) => {
    return [
      `${sch.client_first_name} ${sch.client_last_name}`,
      sch.sactanationalid ? sch.sactanationalid : '',
      returnRowValue(sch.sactacurrenroll),
      returnRowValue(sch.mmadrugadmin),
      getSACsColumnsValues(sch.mmanodrugadminreason as string, true),
      getSACsColumnsValues(sch.mmanodrugadminreason as string, false),
      returnRowValue(sch.mmaadr),
      sch.mmapzqdosagegiven,
      sch.mmaalbgiven,
    ];
  });
};

/*
 * Renders a table list of child report
 * @param {ChildReportsProps} props
 */
const ChildReportList = (props: ChildReportsProps) => {
  const {
    pageTitle,
    pageUrl,
    supersetSliceId,
    fetchItems,
    service,
    data,
    headerItems,
    tableClass,
    prevPage,
    jurisdictionId,
    planId,
  } = props;

  const homePage = [
    {
      label: HOME,
      url: HOME_URL,
    },
    {
      label: MDA_POINT_PLANS,
      url: REPORT_MDA_POINT_PLAN_URL,
    },
  ];

  const pages = prevPage ? [...homePage, ...prevPage] : [...homePage];
  const breadcrumbProps = {
    currentPage: {
      label: pageTitle || MDA_POINT_CHILD_REPORT_TITLE,
      url: pageUrl,
    },
    pages,
  };

  const filters: SupersetAdhocFilterOption[] = [];
  if (jurisdictionId) {
    filters.push({ comparator: jurisdictionId, operator: '==', subject: 'jurisdiction_id' });
  }
  if (planId) {
    filters.push({ comparator: planId, operator: '==', subject: 'plan_id' });
  }

  const supersetFetchParams = superset.getFormData(SUPERSET_MAX_RECORDS, filters);

  const listViewProps: ChildSupersetDataTableProps = {
    data,
    fetchItems,
    headerItems,
    service,
    supersetFetchParams,
    supersetSliceId,
    tableClass,
  };
  const fullTitle = `${MDA_POINT_CHILD_REPORT_TITLE}: ${pageTitle}`;

  return (
    <div>
      <Helmet>
        <title>{fullTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{fullTitle}</h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <ChildSupersetDataTable {...listViewProps} />
        </Col>
      </Row>
    </div>
  );
};

/** Declare default props for MDAPointPlansList */
const defaultProps: ChildReportsProps = {
  data: [],
  fetchItems: FetchMDAPointChildReportAction,
  headerItems: tableHeaders,
  pageTitle: null,
  pageUrl: MDA_POINT_CHILD_REPORT_URL,
  prevPage: [],
  service: supersetFetch,
  supersetSliceId: SUPERSET_MDA_POINT_CHILD_REPORT_DATA_SLICE,
  tableClass: 'table table-striped table-bordered plans-list',
};

ChildReportList.defaultProps = defaultProps;

export { ChildReportList };

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): ChildReportsProps => {
  const { planId, jurisdictionId } = ownProps.match.params;

  let pageUrl = MDA_POINT_CHILD_REPORT_URL;
  let childData: ChildReport[] = [];
  let pageTitle = null;
  let prevPage: Page[] = [];
  const supersetSliceId = SUPERSET_MDA_POINT_CHILD_REPORT_DATA_SLICE;
  const fetchItems = FetchMDAPointChildReportAction;
  const service = supersetFetch;
  const headerItems = tableHeaders;
  const tableClass = 'table table-striped table-bordered plans-list';

  if (planId && jurisdictionId) {
    // get parent jurisdiction id and name
    const jurisdictions = slices.map((slice: string) =>
      getGenericJurisdictionsArray(state, slice, planId)
    );
    // build page bread crumbs
    const { pTitle, prevPages } = buildBreadCrumbs(jurisdictions, planId, jurisdictionId);
    pageTitle = pTitle;
    prevPage = prevPages;
    const plan = getPlanByIdSelector(state, planId);
    if (plan) {
      prevPage.unshift({ label: plan.plan_name, url: `${REPORT_MDA_POINT_PLAN_URL}/${planId}` });
    }

    // build page url
    pageUrl = `${MDA_POINT_CHILD_REPORT_URL}/${planId}/${jurisdictionId}`;
    // get child reporting data
    childData = makeMDAPointChildReportsArraySelector(planId)(state, {
      jurisdiction_id: jurisdictionId,
    });
  }

  const data = extractChildData(childData);

  return {
    data,
    fetchItems,
    headerItems,
    jurisdictionId,
    pageTitle,
    pageUrl,
    planId,
    prevPage,
    service,
    supersetSliceId,
    tableClass,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchItems: FetchMDAPointChildReportAction };

const ConnectedChildReports = connect(mapStateToProps, mapDispatchToProps)(ChildReportList);

export default ConnectedChildReports;
