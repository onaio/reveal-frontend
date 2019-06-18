import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { NavLink } from 'react-router-dom';
import { Store } from 'redux';
import GisidaWrapper from '../../../../../components/GisidaWrapper';
import Loading from '../../../../../components/page/Loading';
import {
  SUPERSET_GOALS_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_PLANS_SLICE,
  SUPERSET_STRUCTURES_SLICE,
} from '../../../../../configs/env';
import {
  FI_SINGLE_MAP_URL,
  FOCUS_INVESTIGATION,
  MEASURE,
  OF,
  RESPONSE,
  TARGET,
} from '../../../../../constants';
import { FlexObject, RouteParams } from '../../../../../helpers/utils';
import supersetFetch from '../../../../../services/superset';
import goalsReducer, {
  fetchGoals,
  getGoalsByPlanAndJurisdiction,
  Goal,
  reducerName as goalsReducerName,
} from '../../../../../store/ducks/goals';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import plansReducer, {
  fetchPlans,
  getPlanById,
  getPlansArray,
  getPlansIdArray,
  Plan,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';
import tasksReducer, {
  fetchTasks,
  getTasksByPlanAndGoalAndJurisdiction,
  getTasksByPlanAndJurisdiction,
  reducerName as tasksReducerName,
  Task,
} from '../../../../../store/ducks/tasks';
import './style.css';

/** register reducers */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(goalsReducerName, goalsReducer);
reducerRegistry.register(plansReducerName, plansReducer);
reducerRegistry.register(tasksReducerName, tasksReducer);

/** interface to describe props for ActiveFI Map component */
export interface MapSingleFIProps {
  currentGoal: string | null;
  fetchGoalsActionCreator: typeof fetchGoals;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchPlansActionCreator: typeof fetchPlans;
  fetchTasksActionCreator: typeof fetchTasks;
  goals: Goal[] | null;
  jurisdiction: Jurisdiction | null;
  plan: Plan | null;
  tasks: Task[] | null;
}

/** default props for ActiveFI Map component */
export const defaultMapSingleFIProps: MapSingleFIProps = {
  currentGoal: null,
  fetchGoalsActionCreator: fetchGoals,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
  fetchTasksActionCreator: fetchTasks,
  goals: null,
  jurisdiction: null,
  plan: null,
  tasks: null,
};
/** Map View for Single Active Focus Investigation */
class SingleActiveFIMap extends React.Component<
  RouteComponentProps<RouteParams> & MapSingleFIProps,
  FlexObject
> {
  public static defaultProps = defaultMapSingleFIProps;
  constructor(props: RouteComponentProps<RouteParams> & MapSingleFIProps) {
    super(props);
  }

  public async componentDidMount() {
    const {
      fetchGoalsActionCreator,
      fetchJurisdictionsActionCreator,
      fetchPlansActionCreator,
      fetchTasksActionCreator,
    } = this.props;

    await supersetFetch(SUPERSET_JURISDICTIONS_SLICE).then((result: Jurisdiction[]) =>
      fetchJurisdictionsActionCreator(result)
    );
    await supersetFetch(SUPERSET_PLANS_SLICE).then((result2: Plan[]) =>
      fetchPlansActionCreator(result2)
    );
    await supersetFetch(SUPERSET_GOALS_SLICE).then((result3: Goal[]) =>
      fetchGoalsActionCreator(result3)
    );
    await supersetFetch(SUPERSET_STRUCTURES_SLICE).then((result4: Task[]) =>
      fetchTasksActionCreator(result4)
    );
  }

  public render() {
    const { jurisdiction, plan, goals, tasks, currentGoal } = this.props;
    if (!jurisdiction || !plan) {
      return <Loading />;
    }
    return (
      <div>
        <h2 className="page-title mt-4 mb-4">
          {FOCUS_INVESTIGATION}: {plan && plan.jurisdiction_name ? plan.jurisdiction_name : null}
        </h2>
        <div className="row no-gutters">
          <div className="col-9">
            <div className="map">
              <GisidaWrapper
                handlers={this.buildHandlers()}
                geoData={jurisdiction}
                goal={goals}
                tasks={tasks}
                currentGoal={currentGoal}
              />
            </div>
          </div>
          <div className="col-3">
            <div className="mapSidebar">
              <h5>{RESPONSE}</h5>
              <hr />
              {goals &&
                goals.map((item: Goal) => {
                  return (
                    <div className="responseItem" key={item.goal_id}>
                      <NavLink
                        to={`${FI_SINGLE_MAP_URL}/${plan.id}/${item.goal_id}`}
                        className="task-link"
                        style={{ textDecoration: 'none' }}
                      >
                        <h6>{item.action_code}</h6>
                      </NavLink>
                      <div className="targetItem">
                        <p>
                          {MEASURE}: {item.measure}
                        </p>
                        <p>
                          {TARGET}: {item.task_count} {OF} {item.goal_value}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /** event handlers */
  private buildHandlers() {
    const id = this.props && this.props.plan && this.props.plan.id;
    const self = this;
    const handlers = [
      {
        /**
         * @param {any} synthetic event a wrapper event around native events
         */
        method: function drillDownClick(e: any) {
          const features = e.target.queryRenderedFeatures(e.point);

          if (features[0] && Number(features[0].id) !== Number(self.props.match.params.id)) {
            const url =
              features && features[0] && features[0].id
                ? features[0].id
                : self.props.match.params.id;
            self.props.history.push(`/focus-investigation/map/${url}`);
          }
        },
        name: 'drillDownClick',
        type: 'click',
      },
    ];
    return handlers;
  }
}
/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - the props
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any) => {
  // pass in the plan id to get plan the get the jurisdicytion_id from the plan
  const plan = getPlanById(state, ownProps.match.params.id);
  let goals = null;
  let jurisdiction = null;
  let tasks = null;
  let currentGoal = null;
  if (plan) {
    jurisdiction = getJurisdictionById(state, plan.jurisdiction_id);
    goals = getGoalsByPlanAndJurisdiction(state, plan.plan_id, plan.jurisdiction_id);
  }
  if (plan && jurisdiction && (goals && goals.length > 1)) {
    tasks = getTasksByPlanAndGoalAndJurisdiction(
      state,
      plan.plan_id,
      ownProps.match.params.goalId,
      plan.jurisdiction_id
    );
    currentGoal = ownProps.match.params.goalId;
  }
  return {
    currentGoal,
    goals,
    jurisdiction,
    plan,
    plansArray: getPlansArray(state),
    plansIdArray: getPlansIdArray(state),
    tasks,
  };
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchGoalsActionCreator: fetchGoals,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
  fetchTasksActionCreator: fetchTasks,
};

/** Create connected SingleActiveFIMAP */
const ConnectedMapSingleFI = connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleActiveFIMap);

export default ConnectedMapSingleFI;
