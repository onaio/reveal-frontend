import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import {
  GenericSupersetDataTable,
  GenericSupersetDataTableProps,
} from '../../../../components/GenericSupersetDataTable';
import HeaderBreadcrumb, {
  Page,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { SUPERSET_MDA_POINT_SCHOOL_REPORT_DATA } from '../../../../configs/env';
import { HOME, MDA_POINT_SCHOOL_REPORT_TITLE } from '../../../../configs/lang';
import { HOME_URL, MDA_POINT_SCHOOL_REPORT_URL } from '../../../../constants';
import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import MDAPointSchoolReportReducer, {
  FetchMDAPointSchoolReportAction,
  makeMDAPointSchoolReportsArraySelector,
  reducerName as MDAPointSchoolReportReducerName,
  SchoolReport,
} from '../../../../store/ducks/generic/MDASchoolReport';
import { getPrevPageAndTitle } from './helpers';

/** register the MDA point school report definitions reducer */
reducerRegistry.register(MDAPointSchoolReportReducerName, MDAPointSchoolReportReducer);

interface SchoolReportsProps extends GenericSupersetDataTableProps {
  pageTitle: typeof MDA_POINT_SCHOOL_REPORT_TITLE;
  pageUrl: string;
  prevPage: Page;
}

const tableHeaders = [
  'Age Range',
  'Total SACs Registered',
  'MMA coverage',
  'MMA Coverage (%)',
  'SACs refused',
  'SACs sick/pregnant/contraindicated',
  'ADR reported (%)',
  'ADR severe (%)',
  'Alb tablets distributed',
];

const SchoolReportsList = (props: SchoolReportsProps) => {
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

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: pageUrl,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      prevPage,
    ],
  };

  const listViewProps: GenericSupersetDataTableProps = {
    data,
    fetchItems,
    headerItems,
    service,
    supersetSliceId,
    tableClass,
  };

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{pageTitle}</h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <GenericSupersetDataTable {...listViewProps} />
        </Col>
      </Row>
    </div>
  );
};

/** Declare default props for MDAPointPlansList */
const defaultProps: SchoolReportsProps = {
  data: [],
  fetchItems: FetchMDAPointSchoolReportAction,
  headerItems: tableHeaders,
  pageTitle: MDA_POINT_SCHOOL_REPORT_TITLE,
  pageUrl: MDA_POINT_SCHOOL_REPORT_URL,
  prevPage: { label: '' },
  service: supersetFetch,
  supersetSliceId: SUPERSET_MDA_POINT_SCHOOL_REPORT_DATA,
  tableClass: 'table table-striped table-bordered plans-list',
};

SchoolReportsList.defaultProps = defaultProps;

export { SchoolReportsList };

interface DispatchedStateProps {
  data: React.ReactNode[][];
  pageUrl: string;
  pageTitle: string;
  prevPage: Page;
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): DispatchedStateProps => {
  const { planId, jurisdictionId } = ownProps.match.params;
  let pageUrl = MDA_POINT_SCHOOL_REPORT_URL;
  let schoolData: SchoolReport[] = [];

  if (planId && jurisdictionId) {
    pageUrl = `${MDA_POINT_SCHOOL_REPORT_URL}/${planId}/${jurisdictionId}`;
    schoolData = makeMDAPointSchoolReportsArraySelector(planId)(state, {
      jurisdiction_id: jurisdictionId,
    });
  }

  const data = schoolData.map(sch => {
    return [
      sch.client_age_category,
      sch.sacregistered,
      sch.mmacov,
      sch.mmacovper,
      sch.sacrefused,
      sch.sacrefmedreason,
      sch.mmaadr,
      sch.mmaadrsev,
      sch.albdist,
    ];
  });

  let pageTitle = MDA_POINT_SCHOOL_REPORT_TITLE;
  let prevPage: Page = { label: '', url: '' };
  if (schoolData) {
    const pageData = getPrevPageAndTitle(schoolData[0]);
    pageTitle = pageData.pageTitle;
    prevPage = pageData.prevPage;
  }

  return {
    data,
    pageTitle,
    pageUrl,
    prevPage,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchItems: FetchMDAPointSchoolReportAction };

/** Connected ActiveFI component */
const ConnectedSchoolReports = connect(mapStateToProps, mapDispatchToProps)(SchoolReportsList);

export default ConnectedSchoolReports;
