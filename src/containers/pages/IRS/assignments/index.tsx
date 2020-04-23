import ListView from '@onaio/list-view';
import reducerRegistry, { Registry } from '@onaio/redux-reducer-registry';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { AsyncRenderer, AsyncRendererProps } from '../../../../components/AsyncRenderer';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  ASSIGN_PLANS,
  END_DATE,
  HOME,
  INTERVENTION,
  NO_PLANS_LOADED_MESSAGE,
  PLAN_STATUS,
  START_DATE,
  TITLE,
} from '../../../../configs/lang';
import { planStatusDisplay } from '../../../../configs/settings';
import {
  ASSIGN_PLAN_URL,
  HOME_URL,
  PLAN_RECORD_BY_ID,
  REPORT_IRS_PLAN_URL,
} from '../../../../constants';
import {
  asyncGetPlanRecords,
  AsyncGetPlanRecordsOptions,
} from '../../../../helpers/dataLoadingUtils/plansService';
import { OpenSRPService } from '../../../../services/opensrp';
import IRSPlansReducer, {
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/generic/plans';
import {
  fetchPlanRecords,
  InterventionType,
  makePlansArraySelector,
  PlanRecord,
  PlanStatus,
} from '../../../../store/ducks/plans';

/** register the plan definitions reducer */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);

/** Plans filter selector */
const plansArraySelector = makePlansArraySelector(PLAN_RECORD_BY_ID);

/** interface for PlanAssignmentsListProps props */
interface PlanAssignmentsListProps {
  fetchPlans: typeof fetchPlanRecords;
  plans: PlanRecord[];
  service: typeof OpenSRPService;
}

/** Simple component that loads plans and allows you to manage plan-jurisdiciton-organization assignments */
const IRSAssignmentPlansList = (props: PlanAssignmentsListProps) => {
  const { fetchPlans, plans } = props;

  const pageTitle: string = `${ASSIGN_PLANS}`;

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

  const listViewProps = {
    data: plans.map(planObj => {
      return [
        <Link to={`${ASSIGN_PLAN_URL}/${planObj.plan_id}`} key={planObj.plan_id}>
          {planObj.plan_title}
        </Link>,
        planObj.plan_intervention_type,
        planObj.plan_effective_period_start,
        planObj.plan_effective_period_end,
        planStatusDisplay[planObj.plan_status] || planObj.plan_status,
      ];
    }),
    headerItems: [TITLE, INTERVENTION, START_DATE, END_DATE, PLAN_STATUS],
    tableClass: 'table table-bordered plans-list',
  };

  const asyncRendererProps: AsyncRendererProps<PlanRecord, AsyncGetPlanRecordsOptions> = {
    data: plans,
    ifFulfilledRender: () => (
      <Row>
        <Col>
          {plans.length < 1 ? (
            <span>{NO_PLANS_LOADED_MESSAGE}</span>
          ) : (
            <ListView {...listViewProps} />
          )}
        </Col>
      </Row>
    ),
    ifLoadingRender: () => <Loading />,
    promiseFn: asyncGetPlanRecords,
    promiseFnProps: {
      fetchPlansCreator: fetchPlans,
      service: props.service,
    },
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
      <AsyncRenderer<PlanRecord, AsyncGetPlanRecordsOptions> {...asyncRendererProps} />
    </div>
  );
};

/** Declare default props for IRSAssignmentPlansList */
const defaultProps: PlanAssignmentsListProps = {
  fetchPlans: fetchPlanRecords,
  plans: [],
  service: OpenSRPService,
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
  const fiPlans = plansArraySelector(state as Registry, {
    interventionType: InterventionType.FI,
    statusList: planStatus,
  });
  const irsPlans = plansArraySelector(state as Registry, {
    interventionType: InterventionType.IRS,
    statusList: planStatus,
  });
  const mdaPlans = plansArraySelector(state as Registry, {
    interventionType: InterventionType.MDA,
    statusList: planStatus,
  });
  const plans = [...fiPlans, ...irsPlans, ...mdaPlans].sort(
    (a: PlanRecord, b: PlanRecord) => Date.parse(b.plan_date) - Date.parse(a.plan_date)
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
