import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { NavLink } from 'react-router-dom';
import { Badge, Button, Col, Row } from 'reactstrap';
import { Store } from 'redux';
import GisidaWrapper from '../../../../../components/GisidaWrapper';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';
import SelectComponent from '../../../../../components/SelectPlan/';
import {
  SUPERSET_GOALS_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_PLANS_SLICE,
  SUPERSET_STRUCTURES_SLICE,
  SUPERSET_TASKS_SLICE,
} from '../../../../../configs/env';
import {
  CASE_TRIGGERED_PLAN,
  END_DATE,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_URL,
  FOCUS_INVESTIGATION,
  FOCUS_INVESTIGATIONS,
  HOME,
  HOME_URL,
  INVESTIGATION,
  MEASURE,
  MULTI_POLYGON,
  OF,
  POINT,
  POLYGON,
  PROGRESS,
  REACTIVE,
  ROUTINE_PLAN,
  START_DATE,
} from '../../../../../constants';
import { popupHandler } from '../../../../../helpers/handlers';
import { getGoalReport } from '../../../../../helpers/indicators';
import ProgressBar from '../../../../../helpers/ProgressBar';
import { FeatureCollection, FlexObject, RouteParams } from '../../../../../helpers/utils';
import supersetFetch from '../../../../../services/superset';
import goalsReducer, {
  fetchGoals,
  getCurrentGoal,
  getGoalsByPlanAndJurisdiction,
  Goal,
  reducerName as goalsReducerName,
  setCurrentGoal,
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
  InterventionType,
  Plan,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';
import structuresReducer, {
  getStructuresFCByJurisdictionId,
  reducerName as structuresReducerName,
  setStructures,
  Structure,
  StructureGeoJSON,
} from '../../../../../store/ducks/structures';
import tasksReducer, {
  fetchTasks,
  getFCByPlanAndGoalAndJurisdiction,
  reducerName as tasksReducerName,
  Task,
  TaskGeoJSON,
} from '../../../../../store/ducks/tasks';
import './style.css';
/** register reducers */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(goalsReducerName, goalsReducer);
reducerRegistry.register(structuresReducerName, structuresReducer);
reducerRegistry.register(plansReducerName, plansReducer);
reducerRegistry.register(tasksReducerName, tasksReducer);

/** interface to describe props for ActiveFI Map component */
export interface MapSingleFIProps {
  currentGoal: string | null;
  setCurrentGoalActionCreator: typeof setCurrentGoal;
  fetchGoalsActionCreator: typeof fetchGoals;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchPlansActionCreator: typeof fetchPlans;
  fetchStructuresActionCreator: typeof setStructures;
  fetchTasksActionCreator: typeof fetchTasks;
  goals: Goal[] | null;
  jurisdiction: Jurisdiction | null;
  plan: Plan | null;
  plansArray: Plan[];
  pointFeatureCollection: FeatureCollection<TaskGeoJSON>;
  polygonFeatureCollection: FeatureCollection<TaskGeoJSON>;
  structures: FeatureCollection<StructureGeoJSON> | null /** we use this to get all structures */;
}

/** default value for feature Collection */
const defaultFeatureCollection: FeatureCollection<TaskGeoJSON> = {
  features: [],
  type: 'FeatureCollection',
};

/** default props for ActiveFI Map component */
export const defaultMapSingleFIProps: MapSingleFIProps = {
  currentGoal: null,
  fetchGoalsActionCreator: fetchGoals,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
  fetchStructuresActionCreator: setStructures,
  fetchTasksActionCreator: fetchTasks,
  goals: null,
  jurisdiction: null,
  plan: null,
  plansArray: [],
  pointFeatureCollection: defaultFeatureCollection,
  polygonFeatureCollection: defaultFeatureCollection,
  setCurrentGoalActionCreator: setCurrentGoal,
  structures: null,
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
      fetchStructuresActionCreator,
      fetchTasksActionCreator,
      plan,
    } = this.props;

    if (plan && plan.plan_id) {
      /** define superset filter params for jurisdictions */
      const jurisdictionsParams = superset.getFormData(3000, [
        { comparator: plan.jurisdiction_id, operator: '==', subject: 'jurisdiction_id' },
      ]);
      await supersetFetch(SUPERSET_JURISDICTIONS_SLICE, jurisdictionsParams).then(
        (result: Jurisdiction[]) => fetchJurisdictionsActionCreator(result)
      );
      /** define superset params for filtering by plan_id */
      const supersetParams = superset.getFormData(3000, [
        { comparator: plan.plan_id, operator: '==', subject: 'plan_id' },
      ]);
      /** define superset params for goals */
      const goalsParams = superset.getFormData(
        3000,
        [{ comparator: plan.plan_id, operator: '==', subject: 'plan_id' }],
        { action_prefix: true }
      );
      /** Implement Ad hoc Queries since jurisdictions have no plan_id */
      await supersetFetch(SUPERSET_STRUCTURES_SLICE, jurisdictionsParams).then(
        (structuresResults: Structure[]) => {
          fetchStructuresActionCreator(structuresResults);
        }
      );
      await supersetFetch(SUPERSET_PLANS_SLICE, jurisdictionsParams).then((result2: Plan[]) => {
        fetchPlansActionCreator(result2);
      });
      await supersetFetch(SUPERSET_GOALS_SLICE, goalsParams).then((result3: Goal[]) => {
        fetchGoalsActionCreator(result3);
      });
      await supersetFetch(SUPERSET_TASKS_SLICE, supersetParams).then((result4: Task[]) => {
        fetchTasksActionCreator(result4);
      });
    }
  }
  public componentWillReceiveProps(nextProps: any) {
    const { setCurrentGoalActionCreator, match } = this.props;

    if (match.params.goalId !== nextProps.match.params.goalId) {
      setCurrentGoalActionCreator(
        nextProps.match.params.goalId ? nextProps.match.params.goalId : null
      );
    }
  }

  public render() {
    const {
      jurisdiction,
      plan,
      goals,
      currentGoal,
      plansArray,
      pointFeatureCollection,
      polygonFeatureCollection,
      structures,
    } = this.props;
    if (!jurisdiction || !plan) {
      return <Loading />;
    }
    const homePage = {
      label: HOME,
      url: HOME_URL,
    };
    const basePage = {
      label: FOCUS_INVESTIGATIONS,
      url: FI_URL,
    };
    const secondLastPage = {
      label: plan.jurisdiction_name,
      url: `${FI_SINGLE_URL}/${plan.id}`,
    };
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: plan.plan_title,
        url: `${FI_SINGLE_MAP_URL}/${plan.id}`,
      },
      pages: [],
    };
    const namePaths =
      plan.jurisdiction_name_path instanceof Array ? plan.jurisdiction_name_path : [];
    const pages = namePaths.map(namePath => {
      // return a page object for each name path
      return {
        label: namePath,
        url: '',
      };
    });
    breadCrumbProps.pages = [homePage, basePage, ...pages, secondLastPage];
    const statusBadge =
      plan && plan.plan_status === (PlanStatus.ACTIVE || PlanStatus.DRAFT) ? (
        <Badge color="warning" pill={true}>
          {plan.plan_status}
        </Badge>
      ) : (
        <Badge color="success" pill={true}>
          {plan.plan_status}
        </Badge>
      );
    const markCompleteButton =
      plan && plan.plan_status === PlanStatus.ACTIVE ? (
        <Button color="primary" size="lg" block={true}>
          Mark as Complete
        </Button>
      ) : null;
    /** Array that holds keys of a plan object
     * Will be used to check plan_effective_period_end or plan_effective_period_start to build the detailview
     */
    const planKeysArray: string[] = Object.keys(plan);

    /** alias enables asigning keys dynamically used to populate the detailview  */

    const alias = {
      plan_effective_period_end: END_DATE,
      plan_effective_period_start: START_DATE,
    };

    const detailViewPlanInvestigationContainer: React.ReactElement[] = [];
    if (plan.plan_fi_reason === ROUTINE_PLAN) {
      planKeysArray.forEach((column: string) => {
        if (column === 'plan_effective_period_end' || column === 'plan_effective_period_start') {
          detailViewPlanInvestigationContainer.push(
            <span key={column} className="detailview">
              <b>{alias[column]}:</b> &nbsp;
              {plan && plan[column]}
            </span>
          );
        }
      });
    } else {
      detailViewPlanInvestigationContainer.push(
        <span key={plan && plan.plan_id}>
          <b>Case Classification:</b>&nbsp;
          {plan && plan.plan_intervention_type ? plan.plan_intervention_type : null}
        </span>
      );
    }
    return (
      <div>
        <Helmet>
          <title>{`${FOCUS_INVESTIGATION}: ${plan && plan.plan_title}`}</title>
        </Helmet>
        <HeaderBreadcrumb {...breadCrumbProps} />
        <div>
          <Row>
            <Col xs="8">
              <h2 className="page-title mt-4 mb-4">
                {plan && plan.plan_title} {INVESTIGATION} {statusBadge}
              </h2>
            </Col>
            <Col xs="4">
              <SelectComponent plansArray={plansArray} />
            </Col>
          </Row>
        </div>
        <div className="row no-gutters mb-5">
          <div className="col-9">
            <div className="map">
              <GisidaWrapper
                handlers={this.buildHandlers()}
                geoData={jurisdiction}
                goal={goals}
                structures={structures}
                currentGoal={currentGoal}
                pointFeatureCollection={pointFeatureCollection}
                polygonFeatureCollection={polygonFeatureCollection}
              />
            </div>
          </div>
          <div className="col-3">
            <div className="mapSidebar">
              <div>
                <h5>
                  {plan.plan_fi_reason === CASE_TRIGGERED_PLAN ? REACTIVE : ROUTINE_PLAN}&nbsp;
                  {INVESTIGATION}
                </h5>
                {detailViewPlanInvestigationContainer}
              </div>
              {markCompleteButton}
              <h6 />
              <hr />
              {goals &&
                goals.map((item: Goal) => {
                  const goalReport = getGoalReport(item);
                  return (
                    <div className="responseItem" key={item.goal_id}>
                      <NavLink
                        to={`${FI_SINGLE_MAP_URL}/${plan.id}/${item.goal_id}`}
                        className="task-link"
                        style={{ textDecoration: 'none' }}
                      >
                        <h6>{item.action_title}</h6>
                      </NavLink>
                      <div className="targetItem">
                        <p>
                          {MEASURE}: {item.measure}
                        </p>
                        <p>
                          {PROGRESS}: {item.completed_task_count} {OF} {goalReport.targetValue}{' '}
                          {goalReport.goalUnit} ({goalReport.prettyPercentAchieved})
                        </p>
                        <br />
                        <ProgressBar value={goalReport.percentAchieved} max={1} />
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
    const handlers = [
      {
        method: popupHandler,
        name: 'pointClick',
        type: 'click',
      },
    ];
    return handlers;
  }
}

export { SingleActiveFIMap };

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - the props
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any) => {
  // pass in the plan id to get plan the get the jurisdicytion_id from the plan
  const plan = getPlanById(state, ownProps.match.params.id);
  let goals = null;
  let jurisdiction = null;
  let currentGoal;
  let pointFeatureCollection = defaultFeatureCollection;
  let polygonFeatureCollection = defaultFeatureCollection;
  let structures = null;
  if (plan) {
    jurisdiction = getJurisdictionById(state, plan.jurisdiction_id);
    goals = getGoalsByPlanAndJurisdiction(state, plan.plan_id, plan.jurisdiction_id);
  }

  if (plan && jurisdiction && (goals && goals.length > 1)) {
    currentGoal = getCurrentGoal(state);
    pointFeatureCollection = getFCByPlanAndGoalAndJurisdiction(
      state,
      plan.plan_id,
      ownProps.match.params.goalId,
      plan.jurisdiction_id,
      false,
      [POINT]
    );
    polygonFeatureCollection = getFCByPlanAndGoalAndJurisdiction(
      state,
      plan.plan_id,
      ownProps.match.params.goalId,
      plan.jurisdiction_id,
      false,
      [POLYGON, MULTI_POLYGON]
    );
    structures = getStructuresFCByJurisdictionId(
      state,
      jurisdiction && jurisdiction.jurisdiction_id
    );
  }
  return {
    currentGoal,
    goals,
    jurisdiction,
    plan,
    plansArray: getPlansArray(
      state,
      InterventionType.FI,
      [PlanStatus.ACTIVE, PlanStatus.COMPLETE],
      null
    ),
    plansIdArray: getPlansIdArray(
      state,
      InterventionType.FI,
      [PlanStatus.ACTIVE, PlanStatus.DRAFT],
      null
    ),
    pointFeatureCollection,
    polygonFeatureCollection,
    structures,
  };
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchGoalsActionCreator: fetchGoals,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
  fetchStructuresActionCreator: setStructures,
  fetchTasksActionCreator: fetchTasks,
  setCurrentGoalActionCreator: setCurrentGoal,
};

/** Create connected SingleActiveFIMAP */
const ConnectedMapSingleFI = connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleActiveFIMap);

export default ConnectedMapSingleFI;
