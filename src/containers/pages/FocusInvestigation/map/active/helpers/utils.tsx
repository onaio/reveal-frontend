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
  CURRENT_INDEX_CASES,
  FEATURE_COLLECTION,
  JURISDICTION_ID,
  LARVAL_DIPPING_ID,
  MAIN_PLAN,
  MOSQUITO_COLLECTION_ID,
  PLAN_ID,
  REACT_MAPBOX_GL_ICON_IMAGE,
  REACT_MAPBOX_GL_ICON_SIZE,
  STRUCTURES_FILL,
  STRUCTURES_LINE,
} from '../../../../../../constants';
import { ROUTINE } from '../../../../../../constants';
import { displayError } from '../../../../../../helpers/errors';
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

import GeojsonExtent from '@mapbox/geojson-extent';
import { Dictionary } from '@onaio/utils';
import {
  Feature,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
} from 'geojson';
import { EventData, LngLat, Map } from 'mapbox-gl';
import { FeatureCollection } from '../../../../../../helpers/utils';
import './handlers.css';

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

/** returns the layers for FI structures
 * @param {FeatureCollection<StructureGeoJSON> | null} structs - the structures
 * @param isJurisdiction - param to determine whether we need to build FI or jurisdiction assignment layers
 */
export const buildStructureLayers = (
  structs: FeatureCollection<StructureGeoJSON> | null,
  isJurisdiction?: boolean
): JSX.Element[] => {
  const structureLayers: JSX.Element[] = [];
  if (structs && structs.features && structs.features.length) {
    structureLayers.push(
      <GeoJSONLayer
        {...lineLayerTemplate}
        linePaint={{
          ...lineLayerTemplate.linePaint,
          'line-color': isJurisdiction ? ['get', 'lineColor'] : GREY,
          'line-opacity': 1,
          'line-width': isJurisdiction ? 6 : 2,
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
          'fill-color': isJurisdiction ? ['get', 'fillColor'] : GREY,
          'fill-opacity': isJurisdiction ? 0.5 : 1,
          'fill-outline-color': isJurisdiction ? ['get', 'fillOutlineColor'] : GREY,
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

/** Build symbol layers for all other points , polygons and multi-polygons
 * @param {string | null} currentGoal - goal id for the layer that is being built
 * @param {FeatureCollection<TaskGeoJSON>} pointFeatureCollection- feature collection for points
 * @param {FeatureCollection<TaskGeoJSON>} polygonFeatureCollection - feature collection for polygons and multi-polygons
 * @param {ExtraVars} - some vars to help in if branches within the function
 */
export const buildGsLiteSymbolLayers = (
  currentGoal: string | null,
  pointFeatureCollection: FeatureCollection<TaskGeoJSON> | null,
  polygonFeatureCollection: FeatureCollection<TaskGeoJSON> | null,
  extraVars: ExtraVars
) => {
  const idToUse = extraVars.useId ? extraVars.useId : currentGoal;
  const gsLayers = [];

  // define which goal ids will also include the symbols.
  const goalsWithSymbols = [MOSQUITO_COLLECTION_ID, CASE_CONFIRMATION_GOAL_ID, LARVAL_DIPPING_ID];
  const goalIsWithSymbol = goalsWithSymbols.includes(currentGoal || '');

  // define the icon for goals with symbols

  let iconGoal: string = 'case-confirmation';
  if (idToUse === CURRENT_INDEX_CASES) {
    iconGoal = 'current-case-confirmation';
  }
  switch (currentGoal) {
    case MOSQUITO_COLLECTION_ID:
      iconGoal = 'mosquito';
      break;
    case LARVAL_DIPPING_ID:
      iconGoal = 'larval';
      break;
  }

  const geojsonLayerProps = {
    ...symbolLayerTemplate,
    symbolLayout: {
      ...symbolLayerTemplate.symbolLayout,
      ...{ [REACT_MAPBOX_GL_ICON_IMAGE]: iconGoal },
      [REACT_MAPBOX_GL_ICON_SIZE]: currentGoal === CASE_CONFIRMATION_GOAL_ID ? 0.045 : 0.03,
    },
  };

  if (pointFeatureCollection && pointFeatureCollection.features.length && goalIsWithSymbol) {
    gsLayers.push(
      <GeoJSONLayer
        {...geojsonLayerProps}
        id={`${idToUse}-point-symbol`}
        key={`${idToUse}-point-symbol`}
        data={pointFeatureCollection}
      />
    );
  }

  if (polygonFeatureCollection && polygonFeatureCollection.features.length && goalIsWithSymbol) {
    gsLayers.push(
      <GeoJSONLayer
        {...geojsonLayerProps}
        id={`${idToUse}-poly-symbol`}
        key={`${idToUse}-poly-symbol`}
        data={polygonFeatureCollection}
      />
    );
  }

  return gsLayers;
};

/** build fill and line layers for all other points , polygons and multi-polygons
 * @param {string | null} currentGoal - goal id for the layer that is being built
 * @param {FeatureCollection<TaskGeoJSON>} pointFeatureCollection- feature collection for points
 * @param {FeatureCollection<TaskGeoJSON>} polygonFeatureCollection - feature collection for polygons and multi-polygons
 * @param {ExtraVars} - some vars to help in if branches within the function
 */
export const buildGsLiteLayers = (
  currentGoal: string | null,
  pointFeatureCollection: FeatureCollection<TaskGeoJSON> | null,
  polygonFeatureCollection: FeatureCollection<TaskGeoJSON> | null,
  extraVars: ExtraVars
) => {
  const idToUse = extraVars.useId ? extraVars.useId : currentGoal;
  const gsLayers = [];

  if (pointFeatureCollection && pointFeatureCollection.features.length) {
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
  if (polygonFeatureCollection && polygonFeatureCollection.features.length) {
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

/** returns bounds for the map derived from the jurisdiction
 * @param Jurisdiction - the jurisdiction
 */
export const getMapBounds = (jurisdiction: Jurisdiction | null) => {
  let mapBounds;
  if (jurisdiction && jurisdiction.geojson) {
    const jurisdictionFC = {
      features: [
        {
          ...jurisdiction.geojson,
          type: 'Feature',
        },
      ],
      type: FEATURE_COLLECTION,
    };
    mapBounds = GeojsonExtent(jurisdictionFC);
  }
  mapBounds = mapBounds === null ? undefined : mapBounds;
  return mapBounds;
};

/**
 * Geometry type is a union of seven types.
 * For union type we can only access members that are common to all types in the union.
 * Unfortunately, not all of those types include the coordinates property
 * Let's narrow dow n GeometryCollection which has no coordinates for our case when extending Feature
 * Let's also add layer prop which is missing on Feature
 */
export interface FeatureWithLayer
  extends Feature<Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon> {
  layer: Dictionary;
}

/**
 * Build mapbox component onclick event handler
 */
export const buildOnClickHandler = (currentPlanId: string) => {
  function clickHandler(map: Map, event: EventData) {
    /** differentiate between current index cases and historical index cases by use of plan_id
     * current_case will be index_case belonging to this plan
     */
    const features = event.target.queryRenderedFeatures(event.point) as Dictionary[];
    let description: string = '';
    /** currentGoal is currently not being used but we  may  use it in the future  */
    const goalIds: string[] = [];
    features.forEach((feature: any) => {
      if (
        feature &&
        feature.geometry &&
        feature.geometry.coordinates &&
        feature.properties &&
        feature.properties.action_code &&
        feature.layer.type !== 'line' &&
        feature.layer.id &&
        !goalIds.includes(feature.properties.goal_id)
      ) {
        if (feature.properties.goal_id) {
          goalIds.push(feature.properties.goal_id);
        }
        if (
          feature.properties.action_code === CASE_CONFIRMATION_CODE &&
          feature.properties.plan_id !== currentPlanId
        ) {
          description += '<p class="heading">historical index cases </b></p>';
          description += '<p></p><br/><br/>';
          return;
        }
        // Splitting into two lines to fix breaking tests
        description += `<p class="heading">${feature.properties.action_code}</b></p>`;
        description += `<p>${feature.properties.task_business_status}</p><br/><br/>`;
      }
    });
    if (description.length) {
      description = '<div>' + description + '</div>';
      const coordinates: LngLat = event.lngLat;
      /** Ensure that if the map is zoomed out such that multiple
       * copies of the feature are visible,
       * the popup appears over the copy being pointed to
       */

      while (Math.abs(event.lngLat.lng - coordinates.lng) > 180) {
        coordinates.lng += event.lngLat.lng > coordinates.lng ? 360 : -360;
      }
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    }
  }
  return clickHandler;
};

/**
 * Map component popup handler
 * @param map - mapbox map instance
 * @param event - map event object
 */

export const buildMouseMoveHandler = () => {
  function mouseHoverHandler(map: Map, event: EventData) {
    const popup = new mapboxgl.Popup({
      closeButton: false,
    });
    // Added this part to remove duplicate popup containers showing on map when hovering
    const nodes: any = document.getElementsByClassName('mapboxgl-popup');
    let node: HTMLDivElement;
    if (nodes && nodes.length) {
      for (node of nodes) {
        if (node.style) {
          node.style.display = 'none';
        }
      }
    }
    let content: string = '';
    let feature: Feature | any = {};
    popup.remove();
    // grab underlying features from map
    const features: any = event.target.queryRenderedFeatures(event.point) as Dictionary[];
    //
    if (!features.length) {
      return;
    }
    // loop through features, setting the name property to content var
    for (feature of features) {
      if (feature && feature.properties && feature.properties.name) {
        content += `<div class="jurisdiction-name"><center>${feature.properties.name}</center></div>`;
      }
      /**
       * Break out of loop once content is set
       * This helps in a case where we could have 2 or more identical features
       */
      if (content) {
        break;
      }
    }
    /**
     * Add popup to map after content is set
     */
    if (content.length) {
      popup
        .setLngLat(map.unproject(event.point))
        .setHTML(content)
        .addTo(map);
    } else {
      // clear existing popups if content is empty
      popup.remove();
      return;
    }
    return true;
  }
  return mouseHoverHandler;
};
