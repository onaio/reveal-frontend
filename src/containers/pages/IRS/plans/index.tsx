import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { SUPERSET_IRS_REPORTING_PLANS_SLICE } from '../../../../configs/env';
import { HOME, HOME_URL, IRS_PLANS, REPORT_IRS_PLAN_URL } from '../../../../constants';
import supersetFetch from '../../../../services/superset';
import IRSPlansReducer, {
  fetchIRSPlans,
  getIRSPlansArray,
  IRSPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/generic/plans';

/** register the plan definitions reducer */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);

/** interface for PlanList props */
interface PlanListProps {
  fetchPlans: typeof fetchIRSPlans;
  plans: IRSPlan[];
  service: typeof supersetFetch;
}

/** Simple component that loads the new plan form and allows you to create a new plan */
const IRSPlansList = (props: PlanListProps) => {
  const { fetchPlans, plans, service } = props;
  const [loading, setLoading] = useState<boolean>(true);

  const pageTitle: string = IRS_PLANS;

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: REPORT_IRS_PLAN_URL,
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
      await service(SUPERSET_IRS_REPORTING_PLANS_SLICE).then((result: IRSPlan[]) =>
        fetchPlans(result)
      );
    } catch (e) {
      // do something with the error?
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading === true) {
    return <Loading />;
  }

  const listViewProps = {
    data: plans.map(planObj => {
      return [
        <Link to={`${REPORT_IRS_PLAN_URL}/${planObj.plan_id}`} key={planObj.plan_id}>
          {planObj.plan_title}
        </Link>,
        planObj.plan_date,
        planObj.plan_effective_period_start,
        planObj.plan_effective_period_end,
        planObj.plan_status,
      ];
    }),
    headerItems: ['Title', 'Date Created', 'Start Date', 'End Date', 'Status'],
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
  plans: [],
  service: supersetFetch,
};

IRSPlansList.defaultProps = defaultProps;

export { IRSPlansList };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plans: IRSPlan[];
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>): DispatchedStateProps => {
  const planDefinitionsArray = getIRSPlansArray(state);

  return {
    plans: planDefinitionsArray,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: fetchIRSPlans };

/** Connected ActiveFI component */
const ConnectedIRSPlansList = connect(
  mapStateToProps,
  mapDispatchToProps
)(IRSPlansList);

export default ConnectedIRSPlansList;
