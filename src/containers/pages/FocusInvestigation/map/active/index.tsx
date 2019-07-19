import reducerRegistry, { store } from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { NavLink } from 'react-router-dom';
import { Store } from 'redux';
import GisidaWrapper from '../../../../../components/GisidaWrapper';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';
import {
  SUPERSET_GOALS_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE,
  SUPERSET_PLANS_SLICE,
  SUPERSET_STRUCTURES_SLICE,
  SUPERSET_TASKS_SLICE,
} from '../../../../../configs/env';
import {
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_URL,
  FOCUS_INVESTIGATION,
  FOCUS_INVESTIGATIONS,
  HOME,
  HOME_URL,
  MEASURE,
  MULTI_POLYGON,
  OF,
  POINT,
  POLYGON,
  PROGRESS,
  RESPONSE,
  TARGET,
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
  Plan,
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
  pointFeatureCollection: FeatureCollection<TaskGeoJSON>;
  polygonFeatureCollection: FeatureCollection<TaskGeoJSON>;
  structures: FeatureCollection<StructureGeoJSON> | null /** we use this to get all structures */;
}

export interface Jurisdictions {
  id: string;
  jurisdiction_id: string;
  plan_id: string;
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
    const planId = plan && plan.plan_id;
    if (planId) {
      const pivotParams = superset.getFormData(3000, [
        { comparator: planId, operator: '==', subject: 'plan_id' },
      ]);
      // let sqlFilterExpression = '';
      let jurisdictionId;
      await supersetFetch(SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE, pivotParams).then(
        async relevantJurisdictions => {
          if (!relevantJurisdictions) {
            return new Promise(reject => {
              reject();
            });
          }
          jurisdictionId =
            relevantJurisdictions.length > 1
              ? relevantJurisdictions[0].jurisdiction_id
              : relevantJurisdictions.map((d: Jurisdictions) => d.jurisdiction_id).join(' ,');

          const planJurisdictionSupersetParams = superset.getFormData(1000, [
            { comparator: jurisdictionId, operator: 'in', subject: 'jurisdiction_id' },
          ]);
          const jurisdictionResults = await supersetFetch(
            SUPERSET_JURISDICTIONS_SLICE,
            planJurisdictionSupersetParams
          );
          fetchJurisdictionsActionCreator(jurisdictionResults);
        }
      );
      /** define superset params for structures */
      let structuresparams;
      if (jurisdictionId) {
        structuresparams = superset.getFormData(3000, [
          { comparator: jurisdictionId, operator: 'in', subject: 'jurisdiction_id' },
        ]);
      }
      /** define superset params for jurisdictions */
      const supersetParams = superset.getFormData(3000, [
        { comparator: planId, operator: '==', subject: 'plan_id' },
      ]);
      /** Implement Ad hoc Queris since jurisdictions have no plan_id */
      await supersetFetch(SUPERSET_STRUCTURES_SLICE, structuresparams).then(
        (structuresResults: Structure[]) => {
          fetchStructuresActionCreator(structuresResults);
        }
      );
      await supersetFetch(SUPERSET_PLANS_SLICE, supersetParams).then((result2: Plan[]) => {
        fetchPlansActionCreator(result2);
      });
      await supersetFetch(SUPERSET_GOALS_SLICE, supersetParams).then((result3: Goal[]) => {
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
    const pages = namePaths.map(namePath =>
      // return a page object for each name path
      ({
        label: namePath,
        url: '',
      })
    );
    breadCrumbProps.pages = [homePage, basePage, ...pages, secondLastPage];

    return (
      <div>
        <Helmet>
          <title>{`${FOCUS_INVESTIGATION}: ${plan && plan.plan_title}`}</title>
        </Helmet>
        <HeaderBreadcrumb {...breadCrumbProps} />
        <h2 className="page-title mt-4 mb-4">
          {FOCUS_INVESTIGATION}: {plan && plan.plan_title}
        </h2>
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
              <h5>{RESPONSE}</h5>
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
                        <h6>{item.action_code}</h6>
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
    plansArray: getPlansArray(state),
    plansIdArray: getPlansIdArray(state),
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
