import { ProgressBar } from '@onaio/progress-indicators';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { NavLink } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { format } from 'util';
import { MemoizedGisidaLite } from '../../../../../components/GisidaLite';
import { getCenter } from '../../../../../components/GisidaLite/helpers';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';
import SelectComponent from '../../../../../components/SelectPlan/';
import { SUPERSET_MAX_RECORDS, SUPERSET_PLANS_SLICE } from '../../../../../configs/env';
import {
  AN_ERROR_OCCURRED,
  FOCUS_INVESTIGATION,
  FOCUS_INVESTIGATIONS,
  HOME,
  INVESTIGATION,
  MEASURE,
  NUMERATOR_OF_DENOMINATOR_UNITS,
  PLAN_OR_JURISDICTION_NOT_FOUND,
  PLAN_SELECT_PLACEHOLDER,
  PROGRESS,
  REACTIVE_INVESTIGATION,
  ROUTINE_INVESTIGATION_TITLE,
} from '../../../../../configs/lang';
import { FIReasons, indicatorThresholdsFI } from '../../../../../configs/settings';
import {
  CASE_CONFIRMATION_CODE,
  CASE_CONFIRMATION_GOAL_ID,
  CASE_TRIGGERED,
  CURRENT_INDEX_CASES,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_URL,
  HISTORICAL_INDEX_CASES,
  HOME_URL,
  MULTI_POLYGON,
  POINT,
  POLYGON,
  RACD_REGISTER_FAMILY_ID,
} from '../../../../../constants';
import { displayError } from '../../../../../helpers/errors';
import { getGoalReport } from '../../../../../helpers/indicators';
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
import {
  buildGsLiteLayers,
  buildGsLiteSymbolLayers,
  buildJurisdictionLayers,
  buildOnClickHandler,
  buildStructureLayers,
  fetchData,
  getDetailViewPlanInvestigationContainer,
  getMapBounds,
  setMapViewPortZoomFactory,
  supersetCall,
} from './helpers/utils';
import './style.css';

import { ErrorPage } from '../../../../../components/page/ErrorPage';
import { supersetFIPlansParamFilters } from '../../../../../helpers/dataLoading/plans';
import indexCasesReducer, {
  fetchIndexCaseDetails,
  reducerName as indexCasesReducerName,
} from '../../../../../store/ducks/opensrp/indexCasesDetails';

/** register reducers */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(goalsReducerName, goalsReducer);
reducerRegistry.register(structuresReducerName, structuresReducer);
reducerRegistry.register(plansReducerName, plansReducer);
reducerRegistry.register(tasksReducerName, tasksReducer);
reducerRegistry.register(indexCasesReducerName, indexCasesReducer);

/** interface to describe props for ActiveFI Map component */
export interface MapSingleFIProps {
  currentGoal: string | null;
  setCurrentGoalActionCreator: typeof setCurrentGoal;
  fetchGoalsActionCreator: typeof fetchGoals;
  fetchIndexCaseActionCreator: typeof fetchIndexCaseDetails;
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
  historicalPointIndexCases: FeatureCollection<TaskGeoJSON> | null;
  historicalPolyIndexCases: FeatureCollection<TaskGeoJSON> | null;
  currentPointIndexCases: FeatureCollection<TaskGeoJSON> | null;
  currentPolyIndexCases: FeatureCollection<TaskGeoJSON> | null;
}

/** default value for feature Collection */
const defaultFeatureCollection: FeatureCollection<TaskGeoJSON> = {
  features: [],
  type: 'FeatureCollection',
};

/** default props for ActiveFI Map component */
export const defaultMapSingleFIProps: MapSingleFIProps = {
  currentGoal: null,
  currentPointIndexCases: null,
  currentPolyIndexCases: null,
  fetchGoalsActionCreator: fetchGoals,
  fetchIndexCaseActionCreator: fetchIndexCaseDetails,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
  fetchStructuresActionCreator: setStructures,
  fetchTasksActionCreator: fetchTasks,
  goals: null,
  historicalPointIndexCases: null,
  historicalPolyIndexCases: null,
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
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!props.plan) {
      /**
       * Fetch plans incase the plan is not available e.g when page is refreshed
       */
      setIsLoading(true);
      const { supersetService, fetchPlansActionCreator, match } = props;
      if (match.params.id) {
        supersetFIPlansParamFilters.push({
          comparator: match.params.id,
          operator: '==',
          subject: 'id',
        });
      }
      const supersetParams = superset.getFormData(
        SUPERSET_MAX_RECORDS,
        supersetFIPlansParamFilters
      );

      /** TODO:// huge data set fetching to tasks slice */

      supersetCall<FetchPlansAction>(
        SUPERSET_PLANS_SLICE,
        fetchPlansActionCreator,
        supersetService,
        supersetParams
      )
        // tslint:disable-next-line: no-floating-promises
        .catch(() => displayError(new Error(AN_ERROR_OCCURRED)))
        .finally(() => setIsLoading(false));
    }
    /**
     * We do not need to re-run since this effect doesn't depend on any values from props or state
     */
  }, []);

  React.useEffect(() => {
    if (props.plan) {
      /**
       * Plans present in state e.g when accessing this view from a list of plans or
       * when the plans are explicitly fetched as in the above if block
       */
      setIsLoading(true);
      fetchData(
        props.fetchGoalsActionCreator,
        props.fetchJurisdictionsActionCreator,
        props.fetchPlansActionCreator,
        props.fetchStructuresActionCreator,
        props.fetchTasksActionCreator,
        props.fetchIndexCaseActionCreator,
        props.plan,
        props.supersetService
      )
        // tslint:disable-next-line: no-floating-promises
        .catch((_: Error) => displayError(new Error(AN_ERROR_OCCURRED)))
        .finally(() => setIsLoading(false));
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
    jurisdiction,
    plan,
    goals,
    currentGoal,
    pointFeatureCollection,
    polygonFeatureCollection,
    structures,
    plansByFocusArea,
    historicalPolyIndexCases,
    historicalPointIndexCases,
    currentPointIndexCases,
    currentPolyIndexCases,
  } = props;
  if (isLoading) {
    return <Loading />;
  }

  if (!plan || !jurisdiction) {
    return <ErrorPage errorMessage={PLAN_OR_JURISDICTION_NOT_FOUND} />;
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

  const jurisdictionLayers = buildJurisdictionLayers(jurisdiction);
  const structureLayers = buildStructureLayers(structures);

  /** Build line and fill layers */
  const historicalIndexLayers = buildGsLiteLayers(
    CASE_CONFIRMATION_GOAL_ID,
    historicalPointIndexCases,
    historicalPolyIndexCases,
    { useId: HISTORICAL_INDEX_CASES }
  );
  const currentIndexLayers = buildGsLiteLayers(
    CASE_CONFIRMATION_GOAL_ID,
    currentPointIndexCases,
    currentPolyIndexCases,
    { useId: CURRENT_INDEX_CASES }
  );
  const otherLayers = buildGsLiteLayers(
    currentGoal,
    pointFeatureCollection,
    polygonFeatureCollection,
    {}
  );

  /** Build symbol layers */
  const historicalIndexSymbolLayers = buildGsLiteSymbolLayers(
    CASE_CONFIRMATION_GOAL_ID,
    historicalPointIndexCases,
    historicalPolyIndexCases,
    { useId: HISTORICAL_INDEX_CASES }
  );
  const currentIndexSymbolLayers = buildGsLiteSymbolLayers(
    CASE_CONFIRMATION_GOAL_ID,
    currentPointIndexCases,
    currentPolyIndexCases,
    { useId: CURRENT_INDEX_CASES }
  );
  const otherSymbolLayers = buildGsLiteSymbolLayers(
    currentGoal,
    pointFeatureCollection,
    polygonFeatureCollection,
    {}
  );

  /** Symbol layers should appear over fill and line so we make sure symbol layers are last
   * in the array
   */
  const gsLayers = [
    ...jurisdictionLayers,
    ...structureLayers,
    ...historicalIndexLayers,
    ...currentIndexLayers,
    ...otherLayers,
    ...otherSymbolLayers,
    ...historicalIndexSymbolLayers,
    ...currentIndexSymbolLayers,
  ];

  const mapCenter = jurisdiction.geojson
    ? getCenter({
        features: [jurisdiction.geojson as any],
        type: 'FeatureCollection',
      })
    : undefined;

  const mapBounds = getMapBounds(jurisdiction);
  const setMapViewPortZoom = setMapViewPortZoomFactory(mapBounds);

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
            <MemoizedGisidaLite
              layers={gsLayers}
              mapCenter={mapCenter}
              mapBounds={mapBounds}
              onClickHandler={buildOnClickHandler(plan.plan_id)}
              onLoad={setMapViewPortZoom}
            />
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
                          (currentGoal === RACD_REGISTER_FAMILY_ID || currentGoal === null)
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
                      <ProgressBar
                        value={goalReport.percentAchieved}
                        max={1}
                        lineColorThresholds={indicatorThresholdsFI}
                      />
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

type MapStateToProps = Pick<
  MapSingleFIProps,
  | 'currentGoal'
  | 'currentPointIndexCases'
  | 'currentPolyIndexCases'
  | 'goals'
  | 'jurisdiction'
  | 'plan'
  | 'plansByFocusArea'
  | 'structures'
  | 'historicalPointIndexCases'
  | 'pointFeatureCollection'
  | 'historicalPolyIndexCases'
  | 'polygonFeatureCollection'
>;

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - the props
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any): MapStateToProps => {
  // pass in the plan id to get plan the get the jurisdiction_id from the plan
  const getTasksFCSelector = tasksFCSelectorFactory();
  const currentGoal = ownProps.match.params.goalId || RACD_REGISTER_FAMILY_ID;
  const plan = getPlanById(state, ownProps.match.params.id);
  let goals = null;
  let jurisdiction = null;
  let pointFeatureCollection = defaultFeatureCollection;
  let polygonFeatureCollection = defaultFeatureCollection;
  let structures = null;
  let plansByFocusArea: Plan[] = [];
  let historicalPointIndexCases = null;
  let historicalPolyIndexCases = null;
  let currentPointIndexCases = null;
  let currentPolyIndexCases = null;
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

  if (plan && jurisdiction) {
    historicalPointIndexCases = getTasksFCSelector(state, {
      actionCode: CASE_CONFIRMATION_CODE,
      excludePlanId: plan.plan_id,
      jurisdictionId: plan.jurisdiction_id,
      structureType: [POINT],
      taskBusinessStatus: 'Complete',
    });
    historicalPolyIndexCases = getTasksFCSelector(state, {
      actionCode: CASE_CONFIRMATION_CODE,
      excludePlanId: plan.plan_id,
      jurisdictionId: plan.jurisdiction_id,
      structureType: [POLYGON, MULTI_POLYGON],
      taskBusinessStatus: 'Complete',
    });
  }

  if (plan && jurisdiction && goals && goals.length > 0) {
    /** include all complete index cases including current index case */
    currentPointIndexCases = getTasksFCSelector(state, {
      actionCode: CASE_CONFIRMATION_CODE,
      jurisdictionId: plan.jurisdiction_id,
      planId: plan.plan_id,
      structureType: [POINT],
      taskBusinessStatus: 'Complete',
    });
    currentPolyIndexCases = getTasksFCSelector(state, {
      actionCode: CASE_CONFIRMATION_CODE,
      jurisdictionId: plan.jurisdiction_id,
      planId: plan.plan_id,
      structureType: [POLYGON, MULTI_POLYGON],
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
    currentPointIndexCases,
    currentPolyIndexCases,
    goals,
    historicalPointIndexCases,
    historicalPolyIndexCases,
    jurisdiction,
    plan,
    plansByFocusArea,
    pointFeatureCollection,
    polygonFeatureCollection,
    structures,
  };
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchGoalsActionCreator: fetchGoals,
  fetchIndexCaseActionCreator: fetchIndexCaseDetails,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
  fetchStructuresActionCreator: setStructures,
  fetchTasksActionCreator: fetchTasks,
  setCurrentGoalActionCreator: setCurrentGoal,
};

/** Create connected SingleActiveFIMAP */
const ConnectedMapSingleFI = connect(mapStateToProps, mapDispatchToProps)(SingleActiveFIMap);

export default ConnectedMapSingleFI;
