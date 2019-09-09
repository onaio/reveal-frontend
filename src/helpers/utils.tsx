import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getOnadataUserInfo, getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { SessionState } from '@onaio/session-reducer';
import { Color } from 'csstype';
import { GisidaMap } from 'gisida';
import { findKey, uniq } from 'lodash';
import { FitBoundsOptions, Layer, LngLatBoundsLike, LngLatLike, Map, Style } from 'mapbox-gl';
import React from 'react';
import { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { CellInfo, Column } from 'react-table';
import SeamlessImmutable from 'seamless-immutable';
import uuidv5 from 'uuid/v5';
import { TASK_YELLOW } from '../colors';
import DrillDownTableLinkedCell from '../components/DrillDownTableLinkedCell';
import NewRecordBadge from '../components/NewRecordBadge';
import { DIGITAL_GLOBE_CONNECT_ID, ONADATA_OAUTH_STATE, OPENSRP_OAUTH_STATE } from '../configs/env';
import { imgArr, locationHierarchy, LocationItem } from '../configs/settings';
import {
  BEDNET_DISTRIBUTION_CODE,
  BLOOD_SCREENING_CODE,
  CASE_CONFIRMATION_CODE,
  CASE_TRIGGERED_PLAN,
  FEATURE_COLLECTION,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FOCUS_AREA_HEADER,
  IRS_CODE,
  LARVAL_DIPPING_CODE,
  MAP_ID,
  MOSQUITO_COLLECTION_CODE,
  NAME,
  RACD_REGISTER_FAMILY_CODE,
} from '../constants';
import { Plan } from '../store/ducks/plans';
import { InitialTask } from '../store/ducks/tasks';
import { colorMaps, ColorMapsTypes } from './structureColorMaps';
/** Interface for an object that is allowed to have any property */
export interface FlexObject {
  [key: string]: any;
}

/** Route params interface */
export interface RouteParams {
  goalId?: string;
  id?: string;
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
  properties: FlexObject;
  type: string;
}

/** Returns a number as a decimal e.g. 0.18 becomes 18% */
export function percentage(num: number, decimalPoints: number = 0) {
  return `${(num * 100).toFixed(decimalPoints)}%`;
}

/** Gets react table columns from the location hierarchy in configs */
export function getLocationColumns(
  locations: LocationItem[] = locationHierarchy,
  padHeader: boolean = false
): Column[] {
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
 * @param {FlexObject} options - map options
 * @param {string} GISIDA_MAPBOX_TOKEN - mapbox token
 * @param {string} GISIDA_ONADATA_API_TOKEN - Onadata API token
 * @param {string} LayerStore - map layers
 * @return {SiteConfig} - Gisida site configuration
 */
export const ConfigStore = (
  options: FlexObject,
  GISIDA_MAPBOX_TOKEN: string,
  GISIDA_ONADATA_API_TOKEN: string,
  LayerStore: FlexObject
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
                  `https://earthwatch.digitalglobe.com/earthservice/tmsaccess/tms/1.0.0/DigitalGlobe:ImageryTileService@EPSG:3857@png/{z}/{x}/{y}.png?connectId=${DIGITAL_GLOBE_CONNECT_ID}`,
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
    caseNotificationDate: plan.plan_fi_reason === CASE_TRIGGERED_PLAN ? plan.plan_date : null,
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
/** Transforms values of certain keys to the specified value
 * {T} obj - object where changes will be made
 * {string[]} propertyNames - list of property names in obj whose values will change
 * {any} newValue - the value to be assigned the property names
 * {any[]} old_value - replace property name if old_value is among specified here
 */
export function transformValues<T>(
  obj: T,
  propertyNames: string[],
  newValue: string = '',
  oldValue = [0, '0', null, 'null']
): T {
  const thisObj: T = { ...obj };
  propertyNames.forEach(propertyName => {
    let preOldValue = (thisObj as any)[propertyName];
    // preprocess received old value: trim and ensure lower case
    if (typeof preOldValue === 'string') {
      preOldValue = preOldValue.toLowerCase().trim();
    }
    if ((thisObj as any)[propertyName] !== undefined && oldValue.indexOf(preOldValue) > -1) {
      (thisObj as any)[propertyName] = newValue;
    }
  });
  return thisObj;
}
/** Generic Type for any object to be updated
 *  where T is the base interface and Y is the interface
 * to extend the base
 */
export type UpdateType<T extends any, Y> = T & Y;

/** Interface for FeatureCollection */
export interface FeatureCollection<T> {
  type: FEATURE_COLLECTION;
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
export function toggleLayer(allLayers: FlexObject, currentGoal: string, store: any, Actions: any) {
  let layer;
  let eachLayer: string;
  for (eachLayer of Object.keys(allLayers)) {
    layer = allLayers[eachLayer];
    /** Toggle layers to show on the map */
    if (layer.visible && (layer.id.includes(currentGoal) || layer.id.includes('main-plan-layer'))) {
      store.dispatch((Actions as any).toggleLayer(MAP_ID, layer.id, true));
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

/** Returns Table columns Which require external dependencies (Cell, Link, CellInfo)
 * the columns being built include focusarea, name and action
 * @param {colType} accessor column
 */
export const jsxColumns = (colType: string): Column[] | [] => {
  if (colType === 'focusarea') {
    return [
      {
        Header: FOCUS_AREA_HEADER,
        columns: [
          {
            Cell: (cell: CellInfo) => {
              return (
                <div>
                  {cell.original.focusArea.trim() && cell.value}
                  &nbsp;&nbsp;
                  {cell.original.focusArea.trim() && (
                    <Link to={`${FI_SINGLE_URL}/${cell.original.id}`}>
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
            Cell: (cell: CellInfo) => {
              return (
                <div>
                  {cell.original.focusArea.trim() && (
                    <Link to={`${FI_SINGLE_MAP_URL}/${cell.original.id}`}>{cell.value}</Link>
                  )}
                  &nbsp;
                  <NewRecordBadge recordDate={cell.original.plan_date} />
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
        Header: 'Action',
        columns: [
          {
            Cell: (cell: CellInfo) => {
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

/** Default table props config */
export const defaultTableProps = {
  CellComponent: DrillDownTableLinkedCell,
  columns: [],
  data: [],
  identifierField: 'id',
  linkerField: 'id',
  minRows: 0,
  parentIdentifierField: 'parent',
  rootParentId: null,
  showPageSizeOptions: false,
  showPagination: false,
  useDrillDownTrProps: false,
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
