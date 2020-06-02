import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { SearchForm } from '../../../../components/forms/Search';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { SUPERSET_IRS_REPORTING_PLANS_SLICE } from '../../../../configs/env';
import {
  DATE_CREATED,
  END_DATE,
  HOME,
  IRS_PLANS,
  START_DATE,
  STATUS_HEADER,
  TITLE,
} from '../../../../configs/lang';
import { planStatusDisplay } from '../../../../configs/settings';
import { HOME_URL, QUERY_PARAM_TITLE, REPORT_IRS_PLAN_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { getQueryParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import { fetchMDAPointPlans } from '../../../../store/ducks/generic/MDAPointPlan';
import IRSPlansReducer, {
  fetchIRSPlans,
  IRSPlan,
  makeIRSPlansArraySelector,
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/generic/plans';

/** register the plan definitions reducer */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);

type NewFetchPlans = typeof fetchMDAPointPlans | null;
/** interface for PlanList props */
interface PlanListProps {
  fetchPlans: typeof fetchIRSPlans;
  newFetchPlans: NewFetchPlans;
  pageTitle: string;
  pageUrl: string;
  plans: IRSPlan[];
  service: typeof supersetFetch;
  supersetReportingSlice: string;
}

/** Simple component that loads the new plan form and allows you to create a new plan */
const IRSPlansList = (props: PlanListProps & RouteComponentProps) => {
  const {
    fetchPlans,
    plans,
    service,
    pageUrl,
    pageTitle,
    supersetReportingSlice,
    newFetchPlans,
  } = props;
  const [loading, setLoading] = useState<boolean>(false);

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
    ],
  };

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(plans.length < 1); // only set loading when there are no plans
      await service(supersetReportingSlice).then((result: IRSPlan[]) => {
        newFetchPlans ? newFetchPlans(result) : fetchPlans(result);
      });
    } catch (e) {
      // do something with the error?
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(error => displayError(error));
  }, []);

  const listViewData = (planList: IRSPlan[]) =>
    planList.map(planObj => {
      return [
        <Link to={`${pageUrl}/${planObj.plan_id}`} key={planObj.plan_id}>
          {planObj.plan_title}
        </Link>,
        planObj.plan_date,
        planObj.plan_effective_period_start,
        planObj.plan_effective_period_end,
        planStatusDisplay[planObj.plan_status] || planObj.plan_status,
      ];
    });

  if (loading === true) {
    return <Loading />;
  }

  const listViewProps = {
    data: listViewData(plans),
    headerItems: [TITLE, DATE_CREATED, START_DATE, END_DATE, STATUS_HEADER],
    tableClass: 'table table-bordered plans-list',
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
      <hr />
      <SearchForm history={props.history} location={props.location} />

      <Row>
        <Col>
          <ListView {...listViewProps} />
        </Col>
      </Row>
    </div>
  );
};

/** Declare default props for IRSPlansList */
const defaultProps: PlanListProps = {
  fetchPlans: fetchIRSPlans,
  newFetchPlans: null,
  pageTitle: IRS_PLANS,
  pageUrl: REPORT_IRS_PLAN_URL,
  plans: [],
  service: supersetFetch,
  supersetReportingSlice: SUPERSET_IRS_REPORTING_PLANS_SLICE,
};

IRSPlansList.defaultProps = defaultProps;

export { IRSPlansList };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  newFetchPlans: NewFetchPlans;
  pageTitle: string;
  pageUrl: string;
  plans: IRSPlan[];
  supersetReportingSlice: string;
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const IRSPlansArray =
    ownProps.plans || makeIRSPlansArraySelector()(state, { plan_title: searchedTitle });
  const newFetchPlans: NewFetchPlans = ownProps.fetchPlans || null;
  const pageTitle = ownProps.pageTitle || defaultProps.pageTitle;
  const pageUrl = ownProps.pageUrl || defaultProps.pageUrl;
  const supersetReportingSlice =
    ownProps.supersetReportingSlice || defaultProps.supersetReportingSlice;

  return {
    newFetchPlans,
    pageTitle,
    pageUrl,
    plans: IRSPlansArray,
    supersetReportingSlice,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: fetchIRSPlans };

/** Connected ActiveFI component */
const ConnectedIRSPlansList = connect(mapStateToProps, mapDispatchToProps)(IRSPlansList);

export default ConnectedIRSPlansList;
