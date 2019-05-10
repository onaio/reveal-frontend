// this is the FocusInvestigation "active" page component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row, Table } from 'reactstrap';
import { Store } from 'redux';
import NotFound from '../../../../components/NotFound';
import Loading from '../../../../components/page/Loading';
import {
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FOCUS_AREA_INFO,
  FOCUS_INVESTIGATION,
} from '../../../../constants';
import { get137Value } from '../../../../helpers/indicators';
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
import { dataByID, dataIds } from '../active/tests/fixtures';
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
    await supersetFetch('223').then((result: Plan[]) => fetchPlansActionCreator(result));
    await supersetFetch('375').then((result2: Goal[]) => fetchGoalsActionCreator(result2));
  }

  public render() {
    let id: number | string | null = null;

    const { goalsArray, planById, plansIdArray } = this.props;

    // const planObjectIds = fixtures.plansIdArray;
    const planObjectIds = plansIdArray;
    const theGoals = goalsArray;

    if (this.props.match && this.props.match.params && this.props.match.params.id) {
      id = String(this.props.match.params.id);
    }

    // if (id === null || !planObjectIds.includes(id)) {
    //   return <NotFound />;
    // }

    // const theObject = extractPlan(fixtures.plan1);
    // const theGoals = fixtures.plan1Goals;

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
              {/* <dt className="col-5">Province</dt>
              <dd className="col-7">{theObject.province}</dd> */}
              <dt className="col-5">District</dt>
              <dd className="col-7">{theObject.district}</dd>
              <dt className="col-5">Canton</dt>
              <dd className="col-7">{theObject.canton}</dd>
              {/* <dt className="col-5">Village</dt>
              <dd className="col-7">{theObject.village}</dd> */}
              <dt className="col-5">FI Reason</dt>
              <dd className="col-7">{theObject.reason}</dd>
              <dt className="col-5">FI Status</dt>
              <dd className="col-7">{theObject.status}</dd>
              {/* <dt className="col-5">Last Visit</dt>
              <dd className="col-7">{theObject.caseNotificationDate}</dd> */}
              {/* <dt className="col-5">FI Response Adherence</dt>
              <dd className="col-7">Yes</dd> */}
            </dl>
            <hr />
            {/* <h5 className="mb-4 mt-4">Past Investigations</h5>
            <Table>
              <tbody>
                <tr>
                  <td>
                    <a href={`${FI_SINGLE_MAP_URL}/13`}>
                      <FontAwesomeIcon icon={['fas', 'map']} />
                    </a>
                    &nbsp;&nbsp;
                    <a href={`${FI_SINGLE_URL}/13`}>{theObject.caseNotificationDate}</a>
                  </td>
                </tr>
              </tbody>
            </Table> */}
          </Col>
          <Col className="col-6">
            <div className="fi-active">
              <h5 className="mb-4 mt-1">
                {/* <a href={`${FI_SINGLE_MAP_URL}/13`}>
                  <FontAwesomeIcon icon={['fas', 'map']} />
                </a>
                &nbsp;&nbsp;
                <a href={`${FI_SINGLE_URL}/13`}>
                  Active Investigation: {theObject.caseNotificationDate}
                </a> */}
                Active Investigation
              </h5>
              <dl className="row mt-3">
                {/* <dt className="col-5">Reveal User</dt>
                <dd className="col-7">username</dd>
                <dt className="col-5">Case Notification Date</dt>
                <dd className="col-7">{theObject.caseNotificationDate}</dd>
                <dt className="col-5">Case Classification</dt>
                <dd className="col-7">{theObject.caseClassification}</dd>
                <dt className="col-5">1-3-7 Adherence</dt>
                <dd className="col-7">
                  {get137Value(theObject.adherence1)},&nbsp;
                  {get137Value(theObject.adherence3)},&nbsp;
                  {get137Value(theObject.adherence7)} days to go
                </dd> */}
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
  const result = {
    goalsArray: getGoalsArrayByPlanId(state, ownProps.match.params.id),
    planById: getPlanById(state, ownProps.match.params.id),
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
