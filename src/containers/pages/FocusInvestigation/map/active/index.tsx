import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { GeoJSONLayer } from 'react-mapbox-gl';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { NavLink } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { format } from 'util';
import { GREY } from '../../../../../colors';
import { GisidaLite } from '../../../../../components/GisidaLite';
import {
  circleLayerTemplate,
  fillLayerTemplate,
  getCenter,
  lineLayerTemplate,
} from '../../../../../components/GisidaLite/helpers';
// import GisidaWrapper from '../../../../../components/GisidaWrapper';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';
import SelectComponent from '../../../../../components/SelectPlan/';
import { SUPERSET_PLANS_SLICE } from '../../../../../configs/env';
import {
  AN_ERROR_OCCURRED,
  FOCUS_INVESTIGATION,
  FOCUS_INVESTIGATIONS,
  HOME,
  INVESTIGATION,
  MEASURE,
  NUMERATOR_OF_DENOMINATOR_UNITS,
  PLAN_SELECT_PLACEHOLDER,
  PROGRESS,
  REACTIVE_INVESTIGATION,
  ROUTINE_INVESTIGATION_TITLE,
} from '../../../../../configs/lang';
import { FIReasons } from '../../../../../configs/settings';
import {
  CASE_CONFIRMATION_CODE,
  CASE_TRIGGERED,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_URL,
  HOME_URL,
  MULTI_POLYGON,
  POINT,
  POLYGON,
  RACD_REGISTER_FAMILY_ID,
} from '../../../../../constants';
import { PLAN_INTERVENTION_TYPE } from '../../../../../constants';
import { displayError } from '../../../../../helpers/errors';
import { getGoalReport } from '../../../../../helpers/indicators';
import ProgressBar from '../../../../../helpers/ProgressBar';
import {
  FeatureCollection,
  getFilteredFIPlansURL,
  RouteParams,
} from '../../../../../helpers/utils';
import supersetFetch from '../../../../../services/superset';
import goalsReducer, {
  fetchGoals,
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
  FetchPlansAction,
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
  StructureGeoJSON,
} from '../../../../../store/ducks/structures';
import tasksReducer, {
  fetchTasks,
  getFCByPlanAndGoalAndJurisdiction,
  reducerName as tasksReducerName,
  TaskGeoJSON,
  tasksFCSelectorFactory,
} from '../../../../../store/ducks/tasks';
import MarkCompleteLink, { MarkCompleteLinkProps } from './helpers/MarkCompleteLink';
import StatusBadge, { StatusBadgeProps } from './helpers/StatusBadge';
import { fetchData, getDetailViewPlanInvestigationContainer, supersetCall } from './helpers/utils';
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
  supersetService: typeof supersetFetch;
  plansByFocusArea: Plan[];
  historicalIndexCases: FeatureCollection<TaskGeoJSON> | null;
  currentIndexCases: FeatureCollection<TaskGeoJSON> | null;
}

/** default value for feature Collection */
const defaultFeatureCollection: FeatureCollection<TaskGeoJSON> = {
  features: [],
  type: 'FeatureCollection',
};

/** default props for ActiveFI Map component */
export const defaultMapSingleFIProps: MapSingleFIProps = {
  currentGoal: null,
  currentIndexCases: null,
  fetchGoalsActionCreator: fetchGoals,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
  fetchStructuresActionCreator: setStructures,
  fetchTasksActionCreator: fetchTasks,
  goals: null,
  historicalIndexCases: null,
  jurisdiction: null,
  plan: null,
  plansByFocusArea: [],
  pointFeatureCollection: defaultFeatureCollection,
  polygonFeatureCollection: defaultFeatureCollection,
  setCurrentGoalActionCreator: setCurrentGoal,
  structures: null,
  supersetService: supersetFetch,
};

/** Map View for Single Active Focus Investigation */
const SingleActiveFIMap = (props: MapSingleFIProps & RouteComponentProps<RouteParams>) => {
  React.useEffect(() => {
    if (!props.plan) {
      /**
       * Fetch plans incase the plan is not available e.g when page is refreshed
       */
      const { supersetService, fetchPlansActionCreator } = props;
      const supersetParams = superset.getFormData(2000, [
        { comparator: InterventionType.FI, operator: '==', subject: PLAN_INTERVENTION_TYPE },
      ]);

      supersetCall<FetchPlansAction>(
        SUPERSET_PLANS_SLICE,
        fetchPlansActionCreator,
        supersetService,
        supersetParams
      ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));
    }
    /**
     * We do not need to re-run since this effect doesn't depend on any values from props or state
     */
  }, []);

  React.useEffect(() => {
    if (props.plan) {
      /**
       * Plans present in state e.g when accesing this view from a list of plans or
       * when the plans are expilcity fetched as in the above if block
       */
      fetchData(
        props.fetchGoalsActionCreator,
        props.fetchJurisdictionsActionCreator,
        props.fetchPlansActionCreator,
        props.fetchStructuresActionCreator,
        props.fetchTasksActionCreator,
        props.plan,
        props.supersetService
      ).catch((error: Error) => displayError(error));
    }
    /**
     * Only re-run effect if props.plan.plan_id changes
     */
  }, [props.plan && props.plan.plan_id]);

  React.useEffect(() => {
    const { setCurrentGoalActionCreator, match } = props;

    setCurrentGoalActionCreator(match.params.goalId ? match.params.goalId : null);
    // /**
    //  * Only re-run effect if props.match.params.goalId changes
    //  */
  }, [props.match.params.goalId]);

  const {
    // historicalIndexCases,
    // currentIndexCases,
    jurisdiction,
    plan,
    goals,
    currentGoal,
    pointFeatureCollection,
    polygonFeatureCollection,
    structures,
    plansByFocusArea,
  } = props;
  if (!jurisdiction || !plan) {
    return <Loading />;
  }

  /** filter out this plan form plans by focusArea */
  const otherPlansByFocusArea = plansByFocusArea.filter(localPlan => localPlan.id !== plan.id);
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
    url: `${FI_SINGLE_URL}/${plan.jurisdiction_id}`,
  };
  const breadCrumbProps: BreadCrumbProps = {
    currentPage: {
      label: plan.plan_title,
      url: `${FI_SINGLE_MAP_URL}/${plan.id}`,
    },
    pages: [],
  };
  const namePaths = plan.jurisdiction_name_path instanceof Array ? plan.jurisdiction_name_path : [];
  const pages = namePaths.map((namePath, i) => {
    // return a page object for each name path
    return {
      label: namePath,
      url: getFilteredFIPlansURL(plan.jurisdiction_path[i], plan.id),
    };
  });
  breadCrumbProps.pages = [homePage, basePage, ...pages, secondLastPage];
  const statusBadgeProps: StatusBadgeProps = {
    plan,
  };
  const markCompleteLinkProps: MarkCompleteLinkProps = {
    plan,
  };

  // TODO: Redo these as GisidaLite layers
  // const fiLayers: FILayers[] = [];

  // if (currentIndexCases) {
  //   fiLayers.push({
  //     features: currentIndexCases,
  //     id: `current-index-cases-${jurisdiction.jurisdiction_id}-symbol`,
  //     layerType: 'symbol',
  //     visible: true,
  //   });
  //   fiLayers.push({
  //     features: currentIndexCases,
  //     // TODO: remove magic strings
  //     id: `current-index-cases-${jurisdiction.jurisdiction_id}-point`,
  //     layerType: 'circle',
  //     visible: true,
  //   });
  // }
  // if (historicalIndexCases) {
  //   fiLayers.push({
  //     features: historicalIndexCases,
  //     id: `historical-index-cases-${jurisdiction.jurisdiction_id}-symbol`,
  //     layerType: 'symbol',
  //     visible: true,
  //   });
  //   fiLayers.push({
  //     features: historicalIndexCases,
  //     // TODO: remove magic strings
  //     id: `historical-index-cases-${jurisdiction.jurisdiction_id}-point`,
  //     layerType: 'circle',
  //     visible: true,
  //   });
  // }

  const gsLayers = [];

  if (jurisdiction) {
    gsLayers.push(
      <GeoJSONLayer
        {...lineLayerTemplate}
        id="${MAIN_PLAN}-${jurisdiction.jurisdiction_id}"
        data={jurisdiction.geojson}
        key={'${MAIN_PLAN}-${jurisdiction.jurisdiction_id}'} // TODO: clean up
      />
    );
  }
  if (structures) {
    gsLayers.push([
      <GeoJSONLayer
        {...lineLayerTemplate}
        linePaint={{
          ...lineLayerTemplate.linePaint,
          'line-color': GREY,
          'line-opacity': 1,
          'line-width': 2,
        }}
        data={structures}
        id="structures-line"
        key="structures-line" // TODO: clean up
      />,
      <GeoJSONLayer
        {...fillLayerTemplate}
        fillPaint={{
          ...fillLayerTemplate.fillPaint,
          'fill-color': GREY,
          'fill-outline-color': GREY,
        }}
        data={structures}
        id="structures-fill"
        key="structures-fill" // TODO: clean up
      />,
    ]);
  }

  if (pointFeatureCollection) {
    gsLayers.push(
      <GeoJSONLayer
        {...circleLayerTemplate}
        circlePaint={{
          ...circleLayerTemplate.circlePaint,
          'circle-color': ['get', 'color'],
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-opacity': 1,
        }}
        id="${currentGoal}-point"
        key="${currentGoal}-point" // TODO: clean up
        data={pointFeatureCollection}
      />
    );
  }
  if (polygonFeatureCollection) {
    gsLayers.push([
      <GeoJSONLayer
        {...lineLayerTemplate}
        linePaint={{
          ...lineLayerTemplate.linePaint,
          'line-color': ['get', 'color'],
          'line-opacity': 1,
          'line-width': 2,
        }}
        data={polygonFeatureCollection}
        id="${currentGoal}-fill-line"
        key="${currentGoal}-fill-line" // TODO: clean up
      />,
      <GeoJSONLayer
        {...fillLayerTemplate}
        fillPaint={{
          ...fillLayerTemplate.fillPaint,
          'fill-color': ['get', 'color'],
          'fill-outline-color': ['get', 'color'],
        }}
        data={polygonFeatureCollection}
        id="${currentGoal}-fill"
        key="${currentGoal}-fill" // TODO: clean up
      />,
    ]);
  }

  const mapCenter = getCenter({
    features: [jurisdiction.geojson as any],
    type: 'FeatureCollection',
  });

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
              {plan && plan.plan_title} {INVESTIGATION}{' '}
              <p className="h5" style={{ display: 'inline' }}>
                <StatusBadge {...statusBadgeProps} />
              </p>
            </h2>
          </Col>
          <Col xs="4">
            <SelectComponent
              placeholder={PLAN_SELECT_PLACEHOLDER}
              plansArray={otherPlansByFocusArea}
            />
          </Col>
        </Row>
      </div>
      <div className="row no-gutters mb-5">
        <div className="col-9">
          <div className="map">
            <GisidaLite layers={gsLayers} mapCenter={mapCenter} mapHeight="78vh" />
          </div>
        </div>
        <div className="col-3">
          <div className="mapSidebar">
            <div>
              <h5>
                {plan.plan_fi_reason === CASE_TRIGGERED
                  ? REACTIVE_INVESTIGATION
                  : ROUTINE_INVESTIGATION_TITLE}
                &nbsp;
              </h5>
              {getDetailViewPlanInvestigationContainer(plan)}
            </div>
            <MarkCompleteLink {...markCompleteLinkProps} />
            <h6 />
            <hr />
            {goals &&
              goals.map((item: Goal) => {
                const goalReport = getGoalReport(item);
                return (
                  <div className="responseItem" key={item.goal_id}>
                    {item.action_code === CASE_CONFIRMATION_CODE ? (
                      <span className="task-link" style={{ color: '#57b446' }}>
                        <h6>{item.action_title}</h6>
                      </span>
                    ) : (
                      <NavLink
                        id={item.goal_id}
                        to={`${FI_SINGLE_MAP_URL}/${plan.id}/${item.goal_id}`}
                        className={`task-link ${
                          item.goal_id === RACD_REGISTER_FAMILY_ID &&
                          currentGoal === RACD_REGISTER_FAMILY_ID
                            ? 'active'
                            : ''
                        }`}
                        style={{ textDecoration: 'none' }}
                      >
                        <h6>{item.action_title}</h6>
                      </NavLink>
                    )}
                    <div className="targetItem">
                      <p>
                        {MEASURE}: {item.measure}
                      </p>
                      <p>
                        {PROGRESS}:{' '}
                        {format(
                          NUMERATOR_OF_DENOMINATOR_UNITS,
                          item.completed_task_count,
                          goalReport.targetValue,
                          goalReport.goalUnit
                        )}{' '}
                        ({goalReport.prettyPercentAchieved})
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
};

SingleActiveFIMap.defaultProps = defaultMapSingleFIProps;

export { SingleActiveFIMap };

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - the props
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any) => {
  // pass in the plan id to get plan the get the jurisdiction_id from the plan
  const getTasksFCSelector = tasksFCSelectorFactory();
  const currentGoal = ownProps.match.params.goalId || 'RACD_register_families';
  const plan = getPlanById(state, ownProps.match.params.id);
  let goals = null;
  let jurisdiction = null;
  let pointFeatureCollection = defaultFeatureCollection;
  let polygonFeatureCollection = defaultFeatureCollection;
  let structures = null;
  let plansByFocusArea: Plan[] = [];
  let historicalIndexCases = null;
  let currentIndexCases = null;
  if (plan) {
    jurisdiction = getJurisdictionById(state, plan.jurisdiction_id);
    goals = getGoalsByPlanAndJurisdiction(state, plan.plan_id, plan.jurisdiction_id);
    FIReasons.forEach(reason => {
      const plans = getPlansArray(
        state,
        InterventionType.FI,
        [PlanStatus.ACTIVE, PlanStatus.COMPLETE],
        reason,
        [plan.jurisdiction_id]
      );
      plansByFocusArea = plansByFocusArea.concat(plans);
    });
    plansByFocusArea.sort((a: Plan, b: Plan) => Date.parse(b.plan_date) - Date.parse(a.plan_date));
  }

  if (plan && jurisdiction && goals && goals.length > 1) {
    /** include all complete index cases including current index case */
    historicalIndexCases = getTasksFCSelector(state, {
      actionCode: CASE_CONFIRMATION_CODE,
      excludePlanId: plan.plan_id,
      jurisdictionId: plan.jurisdiction_id,
      structureType: [POINT, POLYGON],
      taskBusinessStatus: 'Complete',
    });

    currentIndexCases = getTasksFCSelector(state, {
      actionCode: CASE_CONFIRMATION_CODE,
      jurisdictionId: plan.jurisdiction_id,
      planId: plan.plan_id,
      structureType: [POINT, POLYGON],
      taskBusinessStatus: 'Complete',
    });

    /** point feature collection for selected goalId within */
    pointFeatureCollection = getFCByPlanAndGoalAndJurisdiction(
      state,
      plan.plan_id,
      [currentGoal],
      plan.jurisdiction_id,
      false,
      [POINT]
    );
    polygonFeatureCollection = getFCByPlanAndGoalAndJurisdiction(
      state,
      plan.plan_id,
      [currentGoal],
      plan.jurisdiction_id,
      false,
      [POLYGON, MULTI_POLYGON]
    );
    structures = getStructuresFCByJurisdictionId(state, jurisdiction.jurisdiction_id);
  }
  return {
    currentGoal,
    currentIndexCases,
    goals,
    historicalIndexCases,
    jurisdiction,
    plan,
    plansArray: getPlansArray(state, InterventionType.FI, [PlanStatus.ACTIVE, PlanStatus.COMPLETE]),
    plansByFocusArea,
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
const ConnectedMapSingleFI = connect(mapStateToProps, mapDispatchToProps)(SingleActiveFIMap);

export default ConnectedMapSingleFI;
