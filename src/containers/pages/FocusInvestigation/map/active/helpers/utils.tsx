import superset, { SupersetFormData } from '@onaio/superset-connector';
import * as React from 'react';
import { GeoJSONLayer } from 'react-mapbox-gl';
import { ActionCreator } from 'redux';
import { GREY } from '../../../../../../colors';
import {
  circleLayerTemplate,
  fillLayerTemplate,
  lineLayerTemplate,
  symbolLayerTemplate,
} from '../../../../../../components/GisidaLite/helpers';
import {
  SUPERSET_GOALS_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_MAX_RECORDS,
  SUPERSET_PLANS_SLICE,
  SUPERSET_STRUCTURES_SLICE,
  SUPERSET_TASKS_SLICE,
} from '../../../../../../configs/env';
import { AN_ERROR_OCCURRED } from '../../../../../../configs/lang';
import { CASE_CLASSIFICATION_LABEL, END_DATE, START_DATE } from '../../../../../../configs/lang';
import {
  ACTION_CODE,
  CASE_CONFIRMATION_CODE,
  CASE_CONFIRMATION_GOAL_ID,
  JURISDICTION_ID,
  LARVAL_DIPPING_ID,
  MAIN_PLAN,
  MOSQUITO_COLLECTION_ID,
  PLAN_ID,
  STRUCTURES_FILL,
  STRUCTURES_LINE,
} from '../../../../../../constants';
import { ROUTINE } from '../../../../../../constants';
import { displayError } from '../../../../../../helpers/errors';
import { popupHandler } from '../../../../../../helpers/handlers';
import supersetFetch from '../../../../../../services/superset';
import { fetchGoals, FetchGoalsAction } from '../../../../../../store/ducks/goals';
import { fetchJurisdictions, Jurisdiction } from '../../../../../../store/ducks/jurisdictions';
import { fetchPlans, FetchPlansAction, Plan } from '../../../../../../store/ducks/plans';
import {
  setStructures,
  SetStructuresAction,
  StructureGeoJSON,
} from '../../../../../../store/ducks/structures';
import { fetchTasks, FetchTasksAction, TaskGeoJSON } from '../../../../../../store/ducks/tasks';

import { FeatureCollection } from '../../../../../../helpers/utils';

/** abstracts code that actually makes the superset Call since it is quite similar */
export async function supersetCall<TAction>(
  supersetSlice: string,
  actionCreator: ActionCreator<TAction>,
  supersetService: typeof supersetFetch = supersetFetch,
  supersetOptions: SupersetFormData | null = null
) {
  const asyncOperation = supersetOptions
    ? supersetService(supersetSlice, supersetOptions)
    : supersetService(supersetSlice);
  return asyncOperation
    .then((result: Jurisdiction[]) => {
      if (result) {
        actionCreator(result);
      } else {
        throw new Error(AN_ERROR_OCCURRED);
      }
    })
    .catch(error => {
      throw error;
    });
}

/**
 * Fetch data for the plan
 * @param fetchGoalsActionCreator Fetch goals action creator
 * @param fetchJurisdictionsActionCreator Fetch jurisdiction action creator
 * @param fetchPlansActionCreator Fetch plans action creator
 * @param fetchStructuresActionCreator Fetch structures action creator
 * @param fetchTasksActionCreator Fetch tasks action creator
 * @param plan Plan object
 * @param supersetService Fetch superset promise
 */
export const fetchData = async (
  fetchGoalsActionCreator: typeof fetchGoals,
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions,
  fetchPlansActionCreator: typeof fetchPlans,
  fetchStructuresActionCreator: typeof setStructures,
  fetchTasksActionCreator: typeof fetchTasks,
  plan: Plan,
  supersetService: typeof supersetFetch
): Promise<void> => {
  if (plan && plan.plan_id) {
    /** define superset filter params for jurisdictions */
    const jurisdictionsParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
      { comparator: plan.jurisdiction_id, operator: '==', subject: JURISDICTION_ID },
    ]);

    /** define superset params for filtering by plan_id */
    const supersetParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
      { comparator: plan.plan_id, operator: '==', subject: PLAN_ID },
    ]);

    /** define superset params for goals */
    const goalsParams = superset.getFormData(
      SUPERSET_MAX_RECORDS,
      [{ comparator: plan.plan_id, operator: '==', subject: PLAN_ID }],
      { action_prefix: true }
    );

    /** filter caseConfirmation tasks by action code and jurisdiction_id */
    const tasksParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
      { comparator: plan.jurisdiction_id, operator: '==', subject: JURISDICTION_ID },
      { comparator: CASE_CONFIRMATION_CODE, operator: '==', subject: ACTION_CODE },
    ]);

    supersetCall(
      SUPERSET_JURISDICTIONS_SLICE,
      fetchJurisdictionsActionCreator,
      supersetService,
      jurisdictionsParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));

    supersetCall<SetStructuresAction>(
      SUPERSET_STRUCTURES_SLICE,
      fetchStructuresActionCreator,
      supersetService,
      jurisdictionsParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));

    supersetCall<FetchPlansAction>(
      SUPERSET_PLANS_SLICE,
      fetchPlansActionCreator,
      supersetService,
      jurisdictionsParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));

    supersetCall<FetchGoalsAction>(
      SUPERSET_GOALS_SLICE,
      fetchGoalsActionCreator,
      supersetService,
      goalsParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));

    supersetCall<FetchTasksAction>(
      SUPERSET_TASKS_SLICE,
      fetchTasksActionCreator,
      supersetService,
      supersetParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));

    supersetCall<FetchTasksAction>(
      SUPERSET_TASKS_SLICE,
      fetchTasksActionCreator,
      supersetService,
      tasksParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));
  }
};

/**
 * Build mapbox component event handlers
 * @param method  Event handler
 */
export const buildHandlers = (planId: string, method: any = popupHandler) => {
  const customMethod = (e: any) => method(e, planId);
  return [
    {
      method: customMethod,
      name: 'pointClick',
      type: 'click',
    },
  ];
};

/**
 * Build detail view for the map
 * @param plan
 * @returns {React.ReactElement[]} Detail View elements
 */
export const getDetailViewPlanInvestigationContainer = (plan: Plan): React.ReactElement[] => {
  const detailViewPlanInvestigationContainer: React.ReactElement[] = [];
  /** Array that holds keys of a plan object
   * Will be used to check plan_effective_period_end or plan_effective_period_start to build the detailview
   */
  const planKeysArray: string[] = Object.keys(plan);

  /** alias enables assigning keys dynamically used to populate the detailview  */
  const alias = {
    plan_effective_period_end: END_DATE,
    plan_effective_period_start: START_DATE,
  };

  if (plan.plan_fi_reason === ROUTINE) {
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
        <b>{CASE_CLASSIFICATION_LABEL}:</b>&nbsp;
        {plan && plan.plan_intervention_type ? plan.plan_intervention_type : null}
      </span>
    );
  }

  return detailViewPlanInvestigationContainer;
};

/** returns layer for the jurisdiction
 * @param {Jurisdiction | null} jurisdiction - the jurisdiction
 */
export const buildJurisdictionLayers = (jurisdiction: Jurisdiction | null) => {
  const jurisdictionLayer = [];
  if (jurisdiction) {
    jurisdictionLayer.push(
      <GeoJSONLayer
        {...lineLayerTemplate}
        id={`${MAIN_PLAN}-${jurisdiction.jurisdiction_id}`}
        data={jurisdiction.geojson}
        key={`${MAIN_PLAN}-${jurisdiction.jurisdiction_id}`}
      />
    );
  }
  return jurisdictionLayer;
};

/** returns the layers for the structures
 * @param {FeatureCollection<StructureGeoJSON> | null} structs - the structures
 */
export const buildStructureLayers = (
  structs: FeatureCollection<StructureGeoJSON> | null
): JSX.Element[] => {
  const structureLayers: JSX.Element[] = [];
  if (structs && structs.features && structs.features.length) {
    structureLayers.push(
      <GeoJSONLayer
        {...lineLayerTemplate}
        linePaint={{
          ...lineLayerTemplate.linePaint,
          'line-color': GREY,
          'line-opacity': 1,
          'line-width': 2,
        }}
        data={structs}
        id={STRUCTURES_LINE}
        key={STRUCTURES_LINE}
      />
    );
    structureLayers.push(
      <GeoJSONLayer
        {...fillLayerTemplate}
        fillPaint={{
          ...fillLayerTemplate.fillPaint,
          'fill-color': GREY,
          'fill-outline-color': GREY,
        }}
        data={structs}
        id={STRUCTURES_FILL}
        key={STRUCTURES_FILL}
      />
    );
  }
  return structureLayers;
};

/** describes the last arg to buildGsLiteLayers */
interface ExtraVars {
  useId?: string; // override the goalId to be used for the layer;
}

/** build layers for all other points , polygons and multi-polygons
 * @param {string | null} currentGoal - goal id for the layer that is being built
 * @param {FeatureCollection<TaskGeoJSON>} pointFeatureCollection- feature collection for points
 * @param {FeatureCollection<TaskGeoJSON>} polygonFeatureCollection - feature collection for polygons and multi-polygons
 * @param {ExtraVars} - some vars to help in if branches within the function
 */
export const buildGsLiteLayers = (
  currentGoal: string | null,
  pointFeatureCollection: FeatureCollection<TaskGeoJSON>,
  polygonFeatureCollection: FeatureCollection<TaskGeoJSON>,
  extraVars: ExtraVars
) => {
  const idToUse = extraVars.useId ? extraVars.useId : currentGoal;
  const gsLayers = [];

  // define which goal ids will also include the symbols.
  const goalsWithSymbols = [MOSQUITO_COLLECTION_ID, CASE_CONFIRMATION_GOAL_ID, LARVAL_DIPPING_ID];
  const goalIsWithSymbol = goalsWithSymbols.includes(currentGoal || '');

  // define the icon for goals with symbols

  let iconGoal: string = 'case-confirmation';
  switch (currentGoal) {
    case MOSQUITO_COLLECTION_ID:
      iconGoal = 'mosquito';
      break;
    case LARVAL_DIPPING_ID:
      iconGoal = 'larval';
      break;
  }

  if (pointFeatureCollection) {
    if (goalIsWithSymbol) {
      gsLayers.push(
        <GeoJSONLayer
          {...symbolLayerTemplate}
          symbolLayout={{
            ...symbolLayerTemplate.symbolLayout,
            'icon-image': iconGoal,
            'icon-size': currentGoal === CASE_CONFIRMATION_GOAL_ID ? 0.045 : 0.03,
          }}
          id={`${idToUse}-point-symbol`}
          key={`${idToUse}-point-symbol`}
          data={pointFeatureCollection}
        />
      );
    }
    gsLayers.push(
      <GeoJSONLayer
        {...circleLayerTemplate}
        circlePaint={{
          ...circleLayerTemplate.circlePaint,
          'circle-color': ['get', 'color'],
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-opacity': 1,
        }}
        id={`${idToUse}-point`}
        key={`${idToUse}-point`}
        data={pointFeatureCollection}
      />
    );
  }
  if (polygonFeatureCollection) {
    if (goalIsWithSymbol) {
      gsLayers.push(
        <GeoJSONLayer
          {...symbolLayerTemplate}
          symbolLayout={{
            ...symbolLayerTemplate.symbolLayout,
            'icon-image': iconGoal,
            'icon-size': currentGoal === CASE_CONFIRMATION_GOAL_ID ? 0.045 : 0.03,
          }}
          id={`${idToUse}-poly-symbol`}
          key={`${idToUse}-poly-symbol`}
          data={polygonFeatureCollection}
        />
      );
    }
    gsLayers.push(
      <GeoJSONLayer
        {...lineLayerTemplate}
        linePaint={{
          ...lineLayerTemplate.linePaint,
          'line-color': ['get', 'color'],
          'line-opacity': 1,
          'line-width': 2,
        }}
        data={polygonFeatureCollection}
        id={`${idToUse}-fill-line`}
        key={`${idToUse}-fill-line`}
      />
    );
    gsLayers.push(
      <GeoJSONLayer
        {...fillLayerTemplate}
        fillPaint={{
          ...fillLayerTemplate.fillPaint,
          'fill-color': ['get', 'color'],
          'fill-outline-color': ['get', 'color'],
        }}
        data={polygonFeatureCollection}
        id={`${idToUse}-fill`}
        key={`${idToUse}-fill`}
      />
    );
  }
  return gsLayers;
};
