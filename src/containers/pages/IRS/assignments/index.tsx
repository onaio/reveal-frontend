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
      OpenSrpPlanService.list()
        .then(planResults => {
          // filter for IRS plans
          const irsPlans = planResults.filter((p: PlanPayload) => {
            for (const u of p.useContext) {
              if (u.code === useContextCodes[0]) {
                if (u.valueCodableConcept === IRS_PLAN_TYPE) {
                  return true;
                } else {
                  return false;
                }
              }
            }
            return false;
          });
          const irsPlanRecords: PlanRecordResponse[] = irsPlans.map(
            extractPlanRecordResponseFromPlanPayload
          );
          return fetchPlans(irsPlanRecords);
        })
        .catch(err => {
          // console.log('ERR', err)
        });
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
      const path =
        planObj.plan_status === PlanStatus.DRAFT ? DRAFT_IRS_PLAN_URL : ASSIGN_IRS_PLAN_URL;
      return [
        <Link to={`${path}/${planObj.plan_id}`} key={planObj.plan_id}>
          {planObj.plan_title}
        </Link>,
        planObj.plan_effective_period_start,
        planObj.plan_effective_period_end,
        planObj.plan_status,
      ];
    }),
    headerItems: ['Title', 'Start Date', 'End Date', 'Plan Status'],
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
  const plans = getPlanRecordsArray(state, InterventionType.IRS, planStatus);
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
