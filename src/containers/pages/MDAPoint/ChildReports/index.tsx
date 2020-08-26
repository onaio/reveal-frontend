import reducerRegistry from '@onaio/redux-reducer-registry';
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
  HOME_URL,
  MDA_POINT_CHILD_REPORT_URL,
  REPORT_MDA_POINT_PLAN_URL,
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

  const listViewProps: ChildSupersetDataTableProps = {
    data,
    fetchItems,
    headerItems,
    service,
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

  const data = childData.map(sch => {
    return [
      `${sch.client_first_name} ${sch.client_last_name}`,
      sch.sactanationalid === 0 ? '' : sch.sactanationalid,
      sch.sactacurrenroll === 0 ? NO : YES,
      sch.mmadrugadmin === 0 ? NO : YES,
      sch.mmanodrugadminreason === 0 ? NO : YES,
      sch.mmanodrugadminreason === 0 ? NO : YES,
      sch.mmaadr === 0 ? NO : YES,
      sch.mmapzqdosagegiven,
      sch.mmaalbgiven,
    ];
  });

  return {
    data,
    fetchItems,
    headerItems,
    pageTitle,
    pageUrl,
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
