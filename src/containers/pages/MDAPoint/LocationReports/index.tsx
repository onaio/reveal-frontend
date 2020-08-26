import reducerRegistry from '@onaio/redux-reducer-registry';
import { percentage } from '@onaio/utils';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import {
  GenericSupersetDataTable,
  GenericSupersetDataTableProps,
} from '../../../../components/GenericSupersetDataTable';
import { buildBreadCrumbs } from '../../../../components/GenericSupersetDataTable/helpers';
import HeaderBreadcrumb, {
  Page,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  SHOW_MDA_SCHOOL_REPORT_LABEL,
  SUPERSET_MDA_POINT_LOCATION_REPORT_DATA_SLICE,
  SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_DATA_SLICES,
} from '../../../../configs/env';
import {
  ADR_REPORTED,
  ADR_SEVERE,
  AGE_RANGE,
  ALB_TABLETS_DISTRIBUTED,
  HOME,
  MDA_POINT_LOCATION_REPORT_TITLE,
  MDA_POINT_PLANS,
  MDA_POINT_SCHOOL_REPORT_TITLE,
  MMA_COVERAGE,
  SACS_REFUSED,
  SACS_SICK,
  TOTAL_SACS_REGISTERED,
} from '../../../../configs/lang';
import {
  HOME_URL,
  MDA_POINT_CHILD_REPORT_URL,
  MDA_POINT_LOCATION_REPORT_URL,
  REPORT_MDA_POINT_PLAN_URL,
} from '../../../../constants';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import { getGenericJurisdictionsArray } from '../../../../store/ducks/generic/jurisdictions';
import MDAPointLocationReportReducer, {
  FetchMDAPointLocationReportAction,
  LocationReport,
  makeMDAPointLocationReportsArraySelector,
  reducerName as MDAPointLocationReportReducerName,
} from '../../../../store/ducks/generic/MDALocationsReport';
import { getPlanByIdSelector } from '../../../../store/ducks/generic/plans';

/** register the MDA point school report definitions reducer */
reducerRegistry.register(MDAPointLocationReportReducerName, MDAPointLocationReportReducer);

const slices = SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_DATA_SLICES.split(',');

interface LocationReportsProps extends GenericSupersetDataTableProps {
  childUrl: string;
  pageTitle: string | null;
  pageUrl: string;
  prevPage: Page[] | null;
}

const tableHeaders = [
  AGE_RANGE,
  TOTAL_SACS_REGISTERED,
  MMA_COVERAGE,
  `${MMA_COVERAGE} (%)`,
  SACS_REFUSED,
  SACS_SICK,
  `${ADR_REPORTED} (%)`,
  `${ADR_SEVERE} (%)`,
  ALB_TABLETS_DISTRIBUTED,
];

/**
 * Renders a table list of location report
 * @param {LocationReportsProps} props
 */
const LocationReportsList = (props: LocationReportsProps) => {
  const {
    childUrl,
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

  const useSchoolLabel = SHOW_MDA_SCHOOL_REPORT_LABEL
    ? MDA_POINT_SCHOOL_REPORT_TITLE
    : MDA_POINT_LOCATION_REPORT_TITLE;
  const pages = prevPage ? [...homePage, ...prevPage] : [...homePage];
  const breadcrumbProps = {
    currentPage: {
      label: pageTitle || useSchoolLabel,
      url: pageUrl,
    },
    pages,
  };

  const listViewProps: GenericSupersetDataTableProps = {
    data,
    fetchItems,
    headerItems,
    service,
    supersetSliceId,
    tableClass,
  };

  const fullTitle = `${useSchoolLabel}: ${pageTitle}`;
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
          <GenericSupersetDataTable {...listViewProps} />
          <Link to={childUrl}>See all children</Link>
        </Col>
      </Row>
    </div>
  );
};

/** Declare default props for MDAPointPlansList */
const defaultProps: LocationReportsProps = {
  childUrl: MDA_POINT_CHILD_REPORT_URL,
  data: [],
  fetchItems: FetchMDAPointLocationReportAction,
  headerItems: tableHeaders,
  pageTitle: null,
  pageUrl: MDA_POINT_LOCATION_REPORT_URL,
  prevPage: [],
  service: supersetFetch,
  supersetSliceId: SUPERSET_MDA_POINT_LOCATION_REPORT_DATA_SLICE,
  tableClass: 'table table-striped table-bordered plans-list',
};

LocationReportsList.defaultProps = defaultProps;

export { LocationReportsList };

interface DispatchedStateProps {
  childUrl: string;
  data: React.ReactNode[][];
  pageUrl: string;
  pageTitle: string | null;
  prevPage: Page[];
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const { planId, jurisdictionId } = ownProps.match.params;
  let childUrl = MDA_POINT_CHILD_REPORT_URL;
  let pageUrl = MDA_POINT_LOCATION_REPORT_URL;
  let locationData: LocationReport[] = [];
  let pageTitle = null;
  let prevPage: Page[] = [];

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
    pageUrl = `${MDA_POINT_LOCATION_REPORT_URL}/${planId}/${jurisdictionId}`;

    childUrl = `${MDA_POINT_CHILD_REPORT_URL}/${planId}/${jurisdictionId}`;
    // get school reporting data
    locationData = makeMDAPointLocationReportsArraySelector(planId)(state, {
      jurisdiction_id: jurisdictionId,
    });
  }

  const data = locationData.map(sch => {
    return [
      sch.client_age_category,
      sch.sacregistered,
      sch.mmacov,
      percentage(sch.mmacovper, 2).value,
      sch.sacrefused,
      sch.sacrefmedreason,
      percentage(sch.mmaadr, 2).value,
      percentage(sch.mmaadrsev, 2).value,
      sch.albdist,
    ];
  });

  return {
    childUrl,
    data,
    pageTitle,
    pageUrl,
    prevPage,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchItems: FetchMDAPointLocationReportAction };

/** Connected ActiveFI component */
const ConnectedSchoolReports = connect(mapStateToProps, mapDispatchToProps)(LocationReportsList);

export default ConnectedSchoolReports;
