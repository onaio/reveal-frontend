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
import { SUPERSET_MDA_POINT_REPORTING_PLANS_SLICE } from '../../../../configs/env';
import {
  DATE_CREATED,
  END_DATE,
  HOME,
  MDA_POINT_PLANS,
  START_DATE,
  STATUS_HEADER,
  TITLE,
} from '../../../../configs/lang';
import { planStatusDisplay } from '../../../../configs/settings';
import { HOME_URL, QUERY_PARAM_TITLE, REPORT_MDA_POINT_PLAN_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { getQueryParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import MDAPointPlansReducer, {
  fetchMDAPointPlans,
  makeMDAPointPlansArraySelector,
  MDAPointPlan,
  reducerName as MDAPointPlansReducerName,
} from '../../../../store/ducks/generic/mdaPointPlan';

/** register the plan definitions reducer */
reducerRegistry.register(MDAPointPlansReducerName, MDAPointPlansReducer);

/** interface for PlanList props */
interface PlanListProps {
  fetchPlans: typeof fetchMDAPointPlans;
  plans: MDAPointPlan[];
  service: typeof supersetFetch;
}

/** Simple component that loads the new plan form and allows you to create a new plan */
const MDAPointPlansList = (props: PlanListProps & RouteComponentProps) => {
  const { fetchPlans, plans, service } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const pageTitle: string = MDA_POINT_PLANS;
  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: REPORT_MDA_POINT_PLAN_URL,
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
      await service(SUPERSET_MDA_POINT_REPORTING_PLANS_SLICE).then((result: MDAPointPlan[]) =>
        fetchPlans(result)
      );
    } catch (e) {
      // do something with the error?
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(error => displayError(error));
  }, []);

  const listViewData = (planList: MDAPointPlan[]) =>
    planList.map(planObj => {
      return [
        <Link to={`${REPORT_MDA_POINT_PLAN_URL}/${planObj.plan_id}`} key={planObj.plan_id}>
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

/** Declare default props for MDAPointPlansList */
const defaultProps: PlanListProps = {
  fetchPlans: fetchMDAPointPlans,
  plans: [],
  service: supersetFetch,
};

MDAPointPlansList.defaultProps = defaultProps;

export { MDAPointPlansList };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plans: MDAPointPlan[];
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const MDAPointPlansArray = makeMDAPointPlansArraySelector()(state, { plan_title: searchedTitle });

  return {
    plans: MDAPointPlansArray,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: fetchMDAPointPlans };

/** Connected ActiveFI component */
const ConnectedMDAPointPlansList = connect(mapStateToProps, mapDispatchToProps)(MDAPointPlansList);

export default ConnectedMDAPointPlansList;
