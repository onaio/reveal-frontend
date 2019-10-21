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
import { useContextCodes } from '../../../../configs/settings';
import {
  ASSIGN_IRS_PLAN_URL,
  DRAFT_IRS_PLAN_URL,
  HOME,
  HOME_URL,
  IRS_PLAN_TYPE,
  IRS_PLANS,
  NO_PLANS_LOADED_MESSAGE,
  REPORT_IRS_PLAN_URL,
} from '../../../../constants';
import { OpenSRPService } from '../../../../services/opensrp';
import IRSPlansReducer, {
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/generic/plans';
import {
  extractPlanRecordResponseFromPlanPayload,
  fetchPlanRecords,
  getPlanRecordsArray,
  InterventionType,
  PlanPayload,
  PlanRecord,
  PlanRecordResponse,
  PlanStatus,
} from '../../../../store/ducks/plans';

/** register the plan definitions reducer */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);

const OpenSrpPlanService = new OpenSRPService('plans');

/** interface for PlanAssignmentsListProps props */
interface PlanAssignmentsListProps {
  fetchPlans: typeof fetchPlanRecords;
  plans: PlanRecord[];
}

/** Simple component that loads plans and allows you to manage plan-jurisdiciton-organization assignments */
const IRSAssignmentPlansList = (props: PlanAssignmentsListProps) => {
  const { fetchPlans, plans } = props;
  const [loading, setLoading] = useState<boolean>(plans.length < 1);

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
      await OpenSrpPlanService.list()
        .then(planResults => {
          if (planResults) {
            const planRecords: PlanRecordResponse[] =
              planResults.map(extractPlanRecordResponseFromPlanPayload) || [];
            return fetchPlans(planRecords);
          }
        })
        .catch(err => {
          // console.log('ERR', err)
        });
      setLoading(false);
    } catch (e) {
      // do something with the error?
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const listViewProps = {
    data: plans.map(planObj => {
      return [
        <Link to={`${ASSIGN_IRS_PLAN_URL}/${planObj.plan_id}`} key={planObj.plan_id}>
          {planObj.plan_title}
        </Link>,
        planObj.plan_intervention_type,
        planObj.plan_effective_period_start,
        planObj.plan_effective_period_end,
        planObj.plan_status,
      ];
    }),
    headerItems: ['Title', 'Intervention', 'Start Date', 'End Date', 'Plan Status'],
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
          {plans.length < 1 ? (
            <span>{NO_PLANS_LOADED_MESSAGE}</span>
          ) : (
            <ListView {...listViewProps} />
          )}
        </Col>
      </Row>
    </div>
  );
};

/** Declare default props for IRSAssignmentPlansList */
const defaultProps: PlanAssignmentsListProps = {
  fetchPlans: fetchPlanRecords,
  plans: [],
};

IRSAssignmentPlansList.defaultProps = defaultProps;

export { IRSAssignmentPlansList };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plans: PlanRecord[];
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>): DispatchedStateProps => {
  const planStatus = [PlanStatus.ACTIVE];
  const fiPlans = getPlanRecordsArray(state, InterventionType.FI, planStatus);
  const irsPlans = getPlanRecordsArray(state, InterventionType.IRS, planStatus);
  const plans = [...fiPlans, ...irsPlans].sort(
    (a: PlanRecord, b: PlanRecord) => Date.parse(a.plan_date) - Date.parse(b.plan_date)
  );
  return {
    plans,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: fetchPlanRecords };

/** Connected ConnectedIRSAssignmentPlansList component */
const ConnectedIRSAssignmentPlansList = connect(
  mapStateToProps,
  mapDispatchToProps
)(IRSAssignmentPlansList);

export default ConnectedIRSAssignmentPlansList;
