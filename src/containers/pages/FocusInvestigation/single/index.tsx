// this is the FocusInvestigation "active" page component
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row, Table } from 'reactstrap';
import { Store } from 'redux';
import NotFound from '../../../../components/NotFound';
import Loading from '../../../../components/page/Loading';
import { SUPERSET_GOALS_SLICE, SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import { FOCUS_AREA_INFO, FOCUS_INVESTIGATION } from '../../../../constants';
import ProgressBar from '../../../../helpers/ProgressBar';
import { extractPlan, RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import goalsReducer, {
  fetchGoals,
  getGoalsArrayByPlanId,
  Goal,
  reducerName as goalsReducerName,
} from '../../../../store/ducks/goals';
import plansReducer, {
  fetchPlans,
  getPlanById,
  getPlansArray,
  getPlansIdArray,
  Plan,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import * as fixtures from '../../../../store/ducks/tests/fixtures';
import './single.css';

/** register the goals reducer */
reducerRegistry.register(goalsReducerName, goalsReducer);
/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

/** interface to describe props for ActiveFI component */
export interface SingleFIProps {
  fetchGoalsActionCreator: typeof fetchGoals;
  fetchPlansActionCreator: typeof fetchPlans;
  goalsArray: Goal[];
  planById: Plan;
  plansArray: Plan[];
  plansIdArray: string[];
}

/** default props for ActiveFI component */
export const defaultSingleFIProps: SingleFIProps = {
  fetchGoalsActionCreator: fetchGoals,
  fetchPlansActionCreator: fetchPlans,
  goalsArray: [],
  planById: fixtures.plan1,
  plansArray: [],
  plansIdArray: [],
};

/** Reporting for Single Active Focus Investigation */
class SingleFI extends React.Component<RouteComponentProps<RouteParams> & SingleFIProps, {}> {
  public static defaultProps = defaultSingleFIProps;
  constructor(props: RouteComponentProps<RouteParams> & SingleFIProps) {
    super(props);
  }

  public async componentDidMount() {
    const { fetchGoalsActionCreator, fetchPlansActionCreator } = this.props;
    await supersetFetch(SUPERSET_PLANS_SLICE).then((result: Plan[]) =>
      fetchPlansActionCreator(result)
    );
    await supersetFetch(SUPERSET_GOALS_SLICE).then((result2: Goal[]) =>
      fetchGoalsActionCreator(result2)
    );
  }

  public render() {
    const { goalsArray, planById, plansIdArray } = this.props;

    const planObjectIds = plansIdArray;
    const theGoals = goalsArray;

    if (!planById || !theGoals) {
      return <Loading />;
    }

    const theObject = extractPlan(planById);

    return (
      <div>
        <h2 className="page-title mt-4 mb-5">
          {FOCUS_INVESTIGATION} in {theObject.focusArea}
        </h2>
        <Row>
          <Col className="col-6">
            <h4 className="mb-4">{FOCUS_AREA_INFO}</h4>
            <div style={{ background: 'lightgrey', height: '200px' }} />
            <dl className="row mt-3">
              <dt className="col-5">District</dt>
              <dd className="col-7">{theObject.district}</dd>
              <dt className="col-5">Canton</dt>
              <dd className="col-7">{theObject.canton}</dd>
              <dt className="col-5">FI Reason</dt>
              <dd className="col-7">{theObject.reason}</dd>
              <dt className="col-5">FI Status</dt>
              <dd className="col-7">{theObject.status}</dd>
            </dl>
            <hr />
          </Col>
          <Col className="col-6">
            <div className="fi-active">
              <h5 className="mb-4 mt-1">Active Investigation</h5>
              <dl className="row mt-3">
                <dt className="col-5">Complete</dt>
                <dd className="col-7">No</dd>
              </dl>
              <hr />
              <h5 className="mb-4 mt-4">Response</h5>

              {/** loop through the goals */
              theGoals.map((item: Goal) => {
                return (
                  <div className="responseItem" key={item.goal_id}>
                    <h6>{item.action_code}</h6>
                    <div className="targetItem">
                      <p>Measure: {item.measure}</p>
                      <p>
                        Target: {item.task_count} of {item.goal_value}
                      </p>
                      <ProgressBar value={item.task_count} max={item.goal_value} />
                    </div>
                  </div>
                );
              })}
              {/* <Row className="mt-5">
                <Col className="col-6 offset-md-3">
                  <button type="button" className="btn btn-outline-primary btn-block">
                    Mark as complete
                  </button>
                </Col>
              </Row> */}
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export { SingleFI };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plansArray: Plan[];
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const plan = getPlanById(state, ownProps.match.params.id);
  let goalsArray = null;
  if (plan) {
    goalsArray = getGoalsArrayByPlanId(state, plan.plan_id);
  }
  const result = {
    goalsArray,
    planById: plan,
    plansArray: getPlansArray(state),
    plansIdArray: getPlansIdArray(state),
  };
  return result;
};

const mapDispatchToProps = {
  fetchGoalsActionCreator: fetchGoals,
  fetchPlansActionCreator: fetchPlans,
};

/** create connected component */

/** Connected SingleFI component */
const ConnectedSingleFI = connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleFI);

export default ConnectedSingleFI;
