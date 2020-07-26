import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DrillDownColumn, DrillDownTableProps } from '@onaio/drill-down-table';
import { getOnadataUserInfo, getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { getUser, SessionState } from '@onaio/session-reducer';
import { Dictionary, percentage } from '@onaio/utils';
import { Color } from 'csstype';
import { GisidaMap } from 'gisida';
import { Location } from 'history';
import { findKey, trimStart, uniq } from 'lodash';
import { FitBoundsOptions, Layer, LngLatBoundsLike, LngLatLike, Map, Style } from 'mapbox-gl';
import querystring from 'querystring';
import { MouseEvent } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Cell } from 'react-table';
import { toast, ToastOptions } from 'react-toastify';
import SeamlessImmutable from 'seamless-immutable';
import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import { TASK_YELLOW } from '../colors';
import DrillDownTableLinkedCell from '../components/DrillDownTableLinkedCell';
import { FIReasonType, FIStatusType } from '../components/forms/PlanForm/types';
import NewRecordBadge from '../components/NewRecordBadge';
import { DIGITAL_GLOBE_CONNECT_ID, ONADATA_OAUTH_STATE, OPENSRP_OAUTH_STATE } from '../configs/env';
import {
  ACTION,
  FAILED_TO_EXTRACT_PLAN_RECORD,
  FOCUS_AREA_HEADER,
  JURISDICTION_ID,
  JURISDICTION_METADATA,
  JURISDICTION_NAME,
  NAME,
  NO_OPTIONS,
} from '../configs/lang';
import {
  FIReasons,
  FIStatuses,
  imgArr,
  locationHierarchy,
  LocationItem,
  PlanAction,
  planActivities,
  PlanDefinition,
  PlanGoal,
  UseContext,
} from '../configs/settings';
import {
  BEDNET_DISTRIBUTION_CODE,
  BLOOD_SCREENING_CODE,
  CASE_CONFIRMATION_CODE,
  CASE_TRIGGERED,
  FEATURE_COLLECTION,
  FI_FILTER_URL,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  IRS_CODE,
  LARVAL_DIPPING_CODE,
  MAP_ID,
  MOSQUITO_COLLECTION_CODE,
  RACD_REGISTER_FAMILY_CODE,
  SETTINGS_CONFIGURATION,
} from '../constants';
import store from '../store';
import {
  InterventionType,
  Plan,
  PlanPayload,
  PlanRecord,
  PlanRecordResponse,
  PlanStatus,
} from '../store/ducks/plans';
import { InitialTask } from '../store/ducks/tasks';
import { displayError } from './errors';
import { colorMaps, ColorMapsTypes } from './structureColorMaps';

/** Interface for an object that is allowed to have any property */

/** Route params interface */
export interface RouteParams {
  goalId?: string;
  id?: string;
  jurisdictionId?: string;
  planId?: string;
  type?: string;
}

/** Geometry object interface */
export interface Geometry {
  coordinates: number[][][] | number[];
  type: string;
}

/** GeoJSON object interface */
export interface GeoJSON {
  geometry: Geometry | null;
  id: string;
  properties: Dictionary;
  type: string;
}

/** Gets react table columns from the location hierarchy in configs */
export function getLocationColumns(
  locations: LocationItem[] = locationHierarchy,
  padHeader: boolean = false
): Array<DrillDownColumn<Dictionary>> {
  // sort locations using the level field and then remove duplicates
  const locationSet = uniq(locations.sort((a, b) => (a.level > b.level ? 1 : -1)));

  if (padHeader === true) {
    return locationSet.map(el => {
      return {
        Header: el.name,
        columns: [
          {
            Header: '',
            accessor: el.identifier,
          },
        ],
      };
    });
  }

  return locationSet.map(el => {
    return {
      Header: el.name,
      accessor: el.identifier,
    };
  });
}

/** Custom function to get oAuth user info depending on the oAuth2 provider
 * It compares the value of the `state` param in the oAuth2 provider config
 * to the one received from the oAuth2 provider in order to return the correct
 * user info getter function
 * @param {{[key: string]: any }} apiResponse - the API response object
 */
export function oAuthUserInfoGetter(apiResponse: { [key: string]: any }): SessionState | void {
  if (Object.keys(apiResponse).includes('oAuth2Data')) {
    switch (apiResponse.oAuth2Data.state) {
      case OPENSRP_OAUTH_STATE:
        return getOpenSRPUserInfo(apiResponse);
      case ONADATA_OAUTH_STATE:
        return getOnadataUserInfo(apiResponse);
    }
  }
}

/** interface to describe Gisida map configuration */
export interface SiteConfigAppMapconfig {
  bounds?: number[];
  boxZoom?: boolean;
  center?: number[];
  container: string;
  fitBoundsOptions?: FitBoundsOptions;
  style: string | Style;
  zoom?: number;
}
/** Interface for MapIcons */
export interface MapIcons {
  id: string;
  imageUrl: string;
}

/** interface to describe Gisida site app configuration object */
export interface SiteConfigApp {
  accessToken: string;
  apiAccessToken: string;
  appName: string;
  mapConfig: SiteConfigAppMapconfig;
  mapIcons?: MapIcons[];
}

/** interface to describe Gisida site configuration */
export interface SiteConfig {
  APP: SiteConfigApp;
  LAYERS: Layer[];
}

/** Creates a Gisida site configuration object
 * @param {Dictionary} options - map options
 * @param {string} GISIDA_MAPBOX_TOKEN - mapbox token
 * @param {string} GISIDA_ONADATA_API_TOKEN - Onadata API token
 * @param {string} LayerStore - map layers
 * @return {SiteConfig} - Gisida site configuration
 */
export const ConfigStore = (
  options: Dictionary,
  GISIDA_MAPBOX_TOKEN: string,
  GISIDA_ONADATA_API_TOKEN: string,
  LayerStore: Dictionary
) => {
  // Define basic config properties
  const { accessToken, apiAccessToken, appName, boxZoom, mapConfig: mbConfig, layers } = options;
  // Define flattened APP.mapConfig properties
  const {
    mapConfigBoxZoom,
    mapConfigCenter,
    mapConfigContainer,
    mapConfigStyle,
    mapConfigZoom,
    mapConfigBounds,
    mapConfigFitBoundsOptions,
  } = options;
  // Define non-flattened APP.Config properties
  const { center, container, style, zoom, bounds, fitBoundsOptions } = mbConfig || options;

  // Build options for mapbox-gl-js initialization
  let mapConfig: SiteConfigAppMapconfig = {
    boxZoom: boxZoom || mapConfigBoxZoom,
    container: container || mapConfigContainer || 'map',
    style:
      style ||
      mapConfigStyle ||
      (DIGITAL_GLOBE_CONNECT_ID
        ? {
            layers: [
              {
                id: 'earthwatch-basemap',
                maxzoom: 22,
                minzoom: 0,
                source: 'diimagery',
                type: 'raster',
              },
            ],
            sources: {
              diimagery: {
                scheme: 'tms',
                tileSize: 256,
                tiles: [
                  `https://access.maxar.com/earthservice/tmsaccess/tms/1.0.0/DigitalGlobe:ImageryTileService@EPSG:3857@png/{z}/{x}/{y}.png?connectId=${DIGITAL_GLOBE_CONNECT_ID}`,
                ],
                type: 'raster',
              },
            },
            version: 8,
          }
        : 'mapbox://styles/mapbox/satellite-v9'),
  };
  if (bounds || mapConfigBounds) {
    mapConfig = {
      ...mapConfig,
      bounds: bounds || mapConfigBounds,
      fitBoundsOptions: fitBoundsOptions || mapConfigFitBoundsOptions || { padding: 20 },
    };
  } else {
    mapConfig = {
      ...mapConfig,
      center: center || mapConfigCenter || [0, 0],
      zoom: zoom || mapConfigZoom || 0,
    };
  }

  // Build APP options for Gisida
  const APP: SiteConfigApp = {
    accessToken: accessToken || GISIDA_MAPBOX_TOKEN,
    apiAccessToken: apiAccessToken || GISIDA_ONADATA_API_TOKEN,
    appName,
    mapConfig,
    mapIcons: imgArr,
  };

  // Build SiteConfig
  const config: SiteConfig = {
    APP,
    LAYERS: layers.map(LayerStore),
  };
  return config;
};
/** utility method ror getting a Gisida Mapbox Map from the reference saved in window.maps
 * @param {string} mapId - The id string of the map to be returned
 * @return {Map|null} - The Mapbox-gl object of the Map or null if not found
 */
export const getGisidaMapById = (mapId: string = MAP_ID): Map | null => {
  if (!window.maps || !Array.isArray(window.maps)) {
    return null;
  }
  return window.maps.find((e: Map) => (e as GisidaMap)._container.id === mapId) || null;
};

/** utility method for getting a rendered feature by matching property
 * @param {string} prop - The feature property name of the value to compair against
 * @param {string|number} val - The value to compair the feature property against
 * @param {string} layerType - The Mapbox layer type to query
 * @param {string} mapId - The id string of the map to query for features
 * @return {mapboxFeature|null} - The queried feature matching the prop/val or null if none found
 */
export const getFeatureByProperty = (
  prop: string,
  val: string | number,
  layerType: string = 'fill',
  mapId: string = MAP_ID
) => {
  const map: Map | null = getGisidaMapById(mapId);
  if (map) {
    const features = map.queryRenderedFeatures().filter(f => f.layer.type === layerType);
    for (const feature of features) {
      if (feature && feature.properties && typeof feature.properties[prop] !== 'undefined') {
        let propVal = feature.properties[prop];
        // Make sure feature propVal and val are the same type before compairing
        if (typeof val === 'string' && typeof propVal !== 'string') {
          propVal = propVal.toString();
        } else if (typeof val === 'number' && typeof propVal !== 'number') {
          propVal = Number(propVal);
        }
        if (propVal === val) {
          return feature;
        }
      }
    }
  }
  return null;
};

/** interface for setGisidaMapPosition `position` parameter */
export interface GisidaPositionType {
  bounds?: LngLatBoundsLike;
  boundsOptions?: FitBoundsOptions;
  lat?: number;
  lng?: number;
  zoom?: number;
}

/** utility method to update the position of a Gisida Mapbox Map
 * @param {GisidaPositionType} position - The config object describing the new map position
 * @param {string} mapId - The id string of the map to query for features
 * @returns {boolean} - Indicates the success or failure of updating the map position
 */
export const setGisidaMapPosition = (
  position: GisidaPositionType,
  mapId: string = MAP_ID
): boolean => {
  const map: Map | null = getGisidaMapById(mapId);

  if (!map) {
    return false;
  }

  if (position.bounds) {
    // set position with fitBounds
    try {
      map.fitBounds(position.bounds, position.boundsOptions || { padding: 20 });
    } catch {
      return false;
    }
  } else {
    // set position with l
    const { lat, lng, zoom } = position;
    const lngLat: LngLatLike | null = (lng && lat && [lng, lat]) || null;
    if (lngLat && typeof zoom !== 'undefined') {
      try {
        map.setCenter(lngLat);
        map.setZoom(zoom);
      } catch {
        return false;
      }
    }
  }

  return true;
};

/** utility method to extract plan from superset response object */
export function extractPlan(plan: Plan) {
  const result: { [key: string]: any } = {
    ...plan,
    canton: null,
    caseClassification: null,
    caseNotificationDate: plan.plan_fi_reason === CASE_TRIGGERED ? plan.plan_date : null,
    district: null,
    focusArea: plan.jurisdiction_name,
    jurisdiction_id: plan.jurisdiction_id,
    jurisdiction_parent_id: plan.jurisdiction_parent_id,
    province: null,
    reason: plan.plan_fi_reason,
    status: plan.plan_fi_status,
    village: null,
  };

  const locationNames: SeamlessImmutable.ImmutableArray<string> = SeamlessImmutable(
    plan.jurisdiction_name_path
  );

  let mutableLocationNames: SeamlessImmutable.ImmutableArray<string>;
  if (locationNames instanceof Array) {
    const locations = locationNames.asMutable().reverse();
    mutableLocationNames = SeamlessImmutable(locations);
  } else {
    mutableLocationNames = SeamlessImmutable([]);
  }

  if (mutableLocationNames) {
    for (let i = 0; i < 4; i++) {
      const locationName = mutableLocationNames[i];
      if (locationName) {
        if (i === 0) {
          result.village = mutableLocationNames[i];
        }
        if (i === 1) {
          result.canton = mutableLocationNames[i];
        }
        if (i === 2) {
          result.district = mutableLocationNames[i];
        }
        if (i === 3) {
          result.province = mutableLocationNames[i];
        }
      }
    }
  }

  return result;
}
/**gets the key whose value contains the string in code
 * @param {ColorMapsTypes} obj - the object to search the key in
 * @param {string} status - task business status to filter, used as predicate filter
 * @return {string} - a hexadecimal color code
 */
export function getColorByValue(obj: ColorMapsTypes, status: string): Color {
  // @param o - obj[key] for key in iterate
  const key = findKey(obj, o => o.indexOf(status) >= 0);
  return key ? key : TASK_YELLOW;
}
/** Given a task object , retrieves the contextual coloring
 * of structures based on two tasks' geojson properties i.e.
 * the action code and the task_business_status_code
 * @param {InitialTask}  taskObject - Task as received from the fetch request / superset
 * @return {string} - a hexadecimal color string
 */
export function getColor(taskObject: InitialTask): Color {
  const properties = taskObject.geojson.properties;
  switch (properties.action_code) {
    case RACD_REGISTER_FAMILY_CODE: {
      return getColorByValue(colorMaps.RACD_REGISTER_FAMILY, properties.task_business_status);
    }
    case MOSQUITO_COLLECTION_CODE: {
      return getColorByValue(colorMaps.MOSQUITO_COLLECTION, properties.task_business_status);
    }
    case LARVAL_DIPPING_CODE: {
      return getColorByValue(colorMaps.LARVAL_DIPPING, properties.task_business_status);
    }
    case IRS_CODE: {
      return getColorByValue(colorMaps.IRS, properties.task_business_status);
    }
    case BEDNET_DISTRIBUTION_CODE: {
      return getColorByValue(colorMaps.BEDNET_DISTRIBUTION, properties.task_business_status);
    }
    case BLOOD_SCREENING_CODE: {
      return getColorByValue(colorMaps.BLOOD_SCREENING, properties.task_business_status);
    }
    case CASE_CONFIRMATION_CODE: {
      return getColorByValue(colorMaps.CASE_CONFIRMATION, properties.task_business_status);
    }
    default: {
      return TASK_YELLOW;
    }
  }
}

/** filters out plans whose jurisdiction id is null
 * @param {Plan []} plansArray - a list of pre-filtered plans
 *
 * @return {Plan []} - A list of filtered plans
 */
export const removeNullJurisdictionPlans = (plansArray: Plan[]): Plan[] => {
  return plansArray.filter((plan: Plan) => {
    const jurisdictionID = plan.jurisdiction_id.toLowerCase().trim();
    return !jurisdictionID.includes('null');
  });
};

/** Generic Type for any object to be updated
 *  where T is the base interface and Y is the interface
 * to extend the base
 */
export type UpdateType<T extends any, Y> = T & Y;

/** Interface for FeatureCollection */
export interface FeatureCollection<T> {
  type: typeof FEATURE_COLLECTION;
  features: T[];
}
/** creates an object that wraps geojson features around
 * a standard FeatureCollection format and returns it as the FeatureCollection
 * @param {T[]} objFeatureCollection - a list of features objects
 * @return {FeatureCollection<T>} - a geoJSON Feature Collection object
 */
export function wrapFeatureCollection<T>(objFeatureCollection: T[]): FeatureCollection<T> {
  return {
    features: objFeatureCollection,
    type: FEATURE_COLLECTION,
  };
}
export function toggleLayer(allLayers: Dictionary, currentGoal: string, stores: any, Actions: any) {
  let layer;
  let eachLayer: string;
  for (eachLayer of Object.keys(allLayers)) {
    layer = allLayers[eachLayer];
    /** Toggle layers to show on the map */
    if (layer.visible && (layer.id.includes(currentGoal) || layer.id.includes('main-plan-layer'))) {
      stores.dispatch(Actions.toggleLayer(MAP_ID, layer.id, true));
    }
  }
}
/** Rounds a floating point number to a given precision
 *
 * @param n - A number of type double to be rounded of
 * @param precision - the number of decimals to be in the mantissa
 *
 * @return - a number that is rounded off the given precision
 */
export function roundToPrecision(n: number, precision: number = 0): number {
  const factor = Math.pow(10, precision);
  return Math.round(n * factor) / factor;
}
/**
 * I think the main/original use case for having the below 3 functions:
 * PreventDefault, stopPropagation, and stopPropagationAndPreventDefault
 * is feeding them directly into component handler attributes:
 *
 * <Button onClick={preventDefault} />
 *
 * which was intended to be a bit DRYer than:
 *
 * function handleSpecificButtonClick(e) { e.preventDefault() }
 * <Button onClick={handleButtonClick} />
 *
 * and to avoid the linting error Lambdas are forbidden in JSX attributes due
 * to their rendering performance impact when doing:
 *
 * <Button onClick={(e) => { e.preventDefault() } />
 *
 *
 */

/** click handler that cancels an event's default behavior
 *
 * @param {Event | MouseEvent} e - a synthetic event wrapper around native dom events
 */
export function preventDefault(e: MouseEvent) {
  e.preventDefault();
}

/** click handler that cancels an event's default behavior
 *
 * @param {MouseEvent} e - a synthetic event wrapper around native dom events
 */
export function stopPropagation(e: MouseEvent) {
  e.stopPropagation();
}

/** click handler that cancels both an event propagation and its default behavior
 *
 * @param {MouseEvent} e - a synthetic event wrapper around native dom events
 */
export function stopPropagationAndPreventDefault(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export function getFilteredFIPlansURL(jurisdictionPath: string, planId: string): string {
  return `${FI_FILTER_URL}/${jurisdictionPath}/${planId}`;
}

/** Returns Table columns Which require external dependencies (Cell, Link, Cell)
 * the columns being built include focusarea, name and action
 * @param {colType} accessor column
 */
export const jsxColumns = (colType: string): Array<DrillDownColumn<Dictionary>> | [] => {
  if (colType === 'focusarea') {
    return [
      {
        Header: FOCUS_AREA_HEADER,
        columns: [
          {
            Cell: (cell: Cell) => {
              const original: Dictionary = cell.row.original;
              return (
                <div>
                  {original.focusArea.trim() && cell.value}
                  &nbsp;&nbsp;
                  {original.focusArea.trim() && (
                    <Link to={`${FI_SINGLE_URL}/${original.jurisdiction_id}`}>
                      <FontAwesomeIcon icon={['fas', 'external-link-square-alt']} />
                    </Link>
                  )}
                </div>
              );
            },
            Header: '',
            accessor: 'focusArea',
            minWidth: 150,
          },
        ],
      },
    ];
  } else if (colType === 'name') {
    return [
      {
        Header: NAME,
        columns: [
          {
            Cell: (cell: Cell) => {
              const original: Dictionary = cell.row.original;
              return (
                <div>
                  {original.focusArea.trim() && (
                    <Link to={`${FI_SINGLE_MAP_URL}/${original.id}`}>{cell.value}</Link>
                  )}
                  &nbsp;
                  <NewRecordBadge recordDate={original.plan_date} />
                </div>
              );
            },
            Header: '',
            accessor: 'plan_title',
            minWidth: 160,
          },
        ],
      },
    ];
  } else if ('action') {
    return [
      {
        // Not clear on what it should show
        Header: ACTION,
        columns: [
          {
            Cell: () => {
              return null;
            },
            Header: '',
            accessor: 'plan_status',
            minWidth: 70,
          },
        ],
      },
    ];
  } else {
    return [];
  }
};

export type TablePropsType = Pick<
  DrillDownTableProps<Dictionary>,
  | 'CellComponent'
  | 'columns'
  | 'data'
  | 'identifierField'
  | 'linkerField'
  | 'paginate'
  | 'parentIdentifierField'
  | 'rootParentId'
  | 'useDrillDown'
>;

/** Default table props config */
export const defaultTableProps: TablePropsType = {
  CellComponent: DrillDownTableLinkedCell,
  columns: [],
  data: [],
  identifierField: 'id',
  linkerField: 'id',
  paginate: false,
  parentIdentifierField: 'parent',
  rootParentId: null,
  useDrillDown: false,
};

/**
 * Generate a namespaced uuid using uuidv5
 * @param {string} seedString - the string to be used to generate the uuid. It should
 * be unique per namespace
 * @param {string} namespace - the namespace
 * @returns {string} - the uuid
 */
export function generateNameSpacedUUID(seedString: string, namespace: string) {
  return uuidv5(seedString, namespace);
}

/** creates a cleaner interface for invoking toast functions and
 * adds the required bootstrap classes
 * @param {string} message - text to displayed in growl
 * @param {ToastOptions} options - customizations options
 */
export function growl(message: string, options: ToastOptions = {}) {
  let className = 'alert alert-';
  let progressClassName = '';
  switch (options.type) {
    case toast.TYPE.SUCCESS:
      className = `${className}success`;
      progressClassName = 'success-toast-progress';
      break;
    case toast.TYPE.INFO:
      className = `${className}info`;
      progressClassName = 'info-toast-progress';
      break;
    case toast.TYPE.WARNING:
      className = `${className}warning`;
      progressClassName = 'warning-toast-progress';
      break;
    case toast.TYPE.ERROR:
      className = `${className}danger`;
      progressClassName = 'danger-toast-progress';
      break;
    default:
      className = `${className}light`;
      progressClassName = 'light-toast-progress';
      break;
  }
  toast(message, { ...options, className, progressClassName });
}

/** Send a growl success message
 * @param message - the success message
 */
export const successGrowl = (message: string) =>
  growl(message, {
    type: toast.TYPE.SUCCESS,
  });

/**
 * Creates a key with an empty array if it didn't exist
 * @param {Dictionary} target - object to be
 * @param {string} prop
 */
export const setDefaultValues = (target: Dictionary, prop: string) => {
  if (prop in target) {
    return target;
  }
  target[prop] = [];
  return target;
};
/**
 * Sorts plans in descending order based on field provided
 * @param arr
 * @param sortField
 */
export function descendingOrderSort<T extends object>(arr: T[], sortField: string) {
  const mutableArray = ([] as T[]).concat(arr);
  // check if the provided field exists in the plans else return plansArray
  if (arr.every((plan: any) => Object.keys(plan).includes(sortField))) {
    return mutableArray.sort((firstEl: Dictionary, secondEl: Dictionary) => {
      return Date.parse(secondEl[sortField]) - Date.parse(firstEl[sortField]);
    });
  }
  return arr;
}

/** extractPlanPayloadFromPlanRecord */
export const extractPlanPayloadFromPlanRecord = (planRecord: PlanRecord): PlanPayload | null => {
  const {
    plan_date: date,
    plan_id: identifier,
    plan_effective_period_end: end,
    plan_effective_period_start: start,
    plan_jurisdictions_ids,
    plan_status: status,
    plan_title: title,
    plan_intervention_type: interventionType,
    plan_version,
  } = planRecord;
  if (plan_jurisdictions_ids) {
    const planPayload: PlanPayload = {
      action: [],
      date,
      effectivePeriod: {
        end,
        start,
      },
      goal: [],
      identifier,
      jurisdiction: plan_jurisdictions_ids.map(id => ({ code: id })),
      name: title.trim().replace(/ /g, '-'),
      serverVersion: 0,
      status,
      title,
      useContext: [
        {
          code: 'interventionType',
          valueCodableConcept: interventionType,
        },
      ],
      version: plan_version || '1',
    };

    // build PlanActions and PlanGoals
    let planAction: PlanAction;
    let planGoal: PlanGoal;
    if (interventionType === InterventionType.IRS) {
      const { action, goal } = planActivities[InterventionType.IRS];
      planAction = {
        ...action,
        identifier: uuidv4(),
        timingPeriod: {
          end,
          start,
        },
      };
      planGoal = {
        ...goal,
        target: [
          {
            ...goal.target[0],
            due: end,
          },
        ],
      };
      planPayload.action.push(planAction);
      planPayload.goal.push(planGoal);
    }

    return planPayload;
  }
  return null;
};

/** extracts a planRecord from the planPayload which is the object received from the opensrp service
 * @param {PlanPayload} planPayload - payload used when creating/updating a plan via OpenSRP plans Endpoint
 *
 * @return {PlanRecordResponse | null} the extracted plan details or null if the plan wasn't valid
 */
export const extractPlanRecordResponseFromPlanPayload = (
  planPayload: PlanPayload
): PlanRecordResponse | null => {
  const {
    date,
    effectivePeriod,
    identifier,
    status,
    title,
    useContext,
    version,
    name,
  } = planPayload;
  if (useContext && effectivePeriod) {
    const { end, start } = effectivePeriod;
    let planInterventionType = InterventionType.FI;
    let planFiReason: FIReasonType = FIReasons[0];
    let planFiStatus: FIStatusType = FIStatuses[0];
    for (const context of useContext) {
      switch (context.code) {
        case 'interventionType': {
          planInterventionType = context.valueCodableConcept as InterventionType;
          break;
        }
        case 'fiReason': {
          planFiReason = context.valueCodableConcept as FIReasonType;
          break;
        }
        case 'fiStatus': {
          planFiStatus = context.valueCodableConcept as FIStatusType;
          break;
        }
      }
    }
    const planRecordResponse: PlanRecordResponse = {
      date,
      effective_period_end: end,
      effective_period_start: start,
      fi_reason: planFiReason,
      fi_status: planFiStatus,
      identifier,
      intervention_type: planInterventionType,
      name,
      status,
      title,
      useContext,
      version,
    };
    if (planPayload.jurisdiction) {
      planRecordResponse.jurisdictions = planPayload.jurisdiction.map(j => j.code);
    }
    return planRecordResponse;
  }
  displayError(new Error(FAILED_TO_EXTRACT_PLAN_RECORD));
  return null;
};

/** a util to check if plan of type PlanDefinition is of the specified intervention type(s)
 * @param {PlanDefinition} plan - the plan of interest
 * @param {InterventionType} interventionType if plan is of specified intervention type we return true
 *
 * @return {boolean} Returns true if plan is of specified intervention type else returns false
 */
export const isPlanDefinitionOfType = (
  plan: PlanDefinition,
  interventionType: InterventionType | InterventionType[]
) => {
  // if plan intervention is in intervention Types
  const allowedTypes = Array.isArray(interventionType) ? interventionType : [interventionType];
  const plansType = plan.useContext
    .filter((f: UseContext) => f.code === 'interventionType')
    .map(context => context.valueCodableConcept)[0];
  return allowedTypes.includes(plansType as InterventionType);
};

/**
 * If error exists return item and error message else return percentage value
 * Research on Declaring number only within certain range e.g in decimalPoints case (0 - 100)
 * @param number item
 * @param number decimalPoints
 */
export const IndicatorThresholdItemPercentage = (item: number, decimalPoints?: number) => {
  return percentage(item, decimalPoints).error === null
    ? percentage(item, decimalPoints).value
    : `${item}${percentage(item).error}`;
};

export const reactSelectNoOptionsText = () => NO_OPTIONS;

/**
 * Get query params from URL
 * @param {Location} location from props
 */
export const getQueryParams = (location: Location) => {
  return querystring.parse(trimStart(location.search, '?'));
};

export interface PapaResult {
  data: JurisdictionMetadata[];
  errors?: any;
  meta?: any;
}

export interface JurisdictionMetadata {
  jurisdiction_id: string;
  [property: string]: string;
}

export interface Setting {
  description: string;
  label: string;
  value: string | unknown;
  key: string;
}

export interface SettingConfiguration {
  type: string;
  identifier: string;
  providerId: string;
  locationId: string;
  settings: Setting[];
  teamId: string;
}

/**
 * Create payload for sending settings to OpenSRP v1 Settings endpoint
 */
export const creatSettingsPayloads = (result: PapaResult): SettingConfiguration[] => {
  const payloads: SettingConfiguration[] = [];
  const { data } = result;
  // check if jurisdiction_id exists
  if (data.length > 0 && data[0].jurisdiction_id) {
    // get the metadata items
    const headers = Object.keys(data[0]);
    const filteredHeaders = headers.filter(f => ![JURISDICTION_ID, JURISDICTION_NAME].includes(f));
    for (const header of filteredHeaders) {
      const settings: Setting[] = [];
      // add the metadata values with jurisdiction as the key
      for (const item of data) {
        const entries = Object.entries(item);
        for (const [key, value] of entries) {
          if (key === header) {
            const setting: Setting = {
              description: `${JURISDICTION_METADATA} for ${item.jurisdiction_name} id ${item.jurisdiction_id}`,
              key: item.jurisdiction_id,
              label: `${
                item.jurisdiction_name ? item.jurisdiction_name : item.jurisdiction_id
              } metadata`,
              value,
            };
            settings.push(setting);
          }
        }
      }
      const username = getUser(store.getState()).username;
      const payload: SettingConfiguration = {
        identifier: `jurisdiction_metadata-${header}`,
        locationId: '',
        providerId: username,
        settings,
        teamId: '',
        type: SETTINGS_CONFIGURATION,
      };
      payloads.push(payload);
    }
  }
  return payloads;
};

/** Function to download data to a file
 * @param {string} data - data to be written to file
 * @param {string} filename - name of the file to be saved
 * @param {string} type - MIME type for the file
 */
export const downloadFile = (data: string, filename: string, type: string) => {
  const file = new Blob([data], { type });
  if (window.navigator.msSaveOrOpenBlob) {
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  } else {
    // Others
    const docElement = document.createElement('a');
    const url = URL.createObjectURL(file);
    docElement.href = url;
    docElement.download = filename;
    document.body.appendChild(docElement);
    docElement.click();
    setTimeout(() => {
      document.body.removeChild(docElement);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
};

/** type of drill down props commonly used */
export type DefaultDrillDownPropsType = Pick<
  DrillDownTableProps<Dictionary>,
  | 'columns'
  | 'data'
  | 'loading'
  | 'loadingComponent'
  | 'renderInBottomFilterBar'
  | 'renderInTopFilterBar'
  | 'useDrillDown'
  | 'renderNullDataComponent'
>;

/**
 * Eliminates provided status and returns a list of remaining plans
 * @param {string[]} planStatuses  - array of plans status to be eliminated
 */
export const getPlanStatusToDisplay = (planStatuses: string[]): string[] => {
  return Object.values(PlanStatus).filter(status => !planStatuses.includes(status));
};
