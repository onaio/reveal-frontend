import { getOnadataUserInfo, getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { SessionState } from '@onaio/session-reducer';
import { Color } from 'csstype';
import { findKey, uniq } from 'lodash';
import { FitBoundsOptions, Layer, Style } from 'mapbox-gl';
import { Column } from 'react-table';
import SeamlessImmutable from 'seamless-immutable';
import * as colors from '../colors';
import { DIGITAL_GLOBE_CONNECT_ID, ONADATA_OAUTH_STATE, OPENSRP_OAUTH_STATE } from '../configs/env';
import { locationHierarchy, LocationItem } from '../configs/settings';
import {
  BEDNET_DISTRIBUTION_CODE,
  BLOOD_SCREENING_CODE,
  CASE_CONFIRMATION_CODE,
  IRS_CODE,
  LARVAL_DIPPING_CODE,
  MOSQUITO_COLLECTION_CODE,
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
  center?: number[];
  container: string;
  fitBoundsOptions?: FitBoundsOptions;
  style: string | Style;
  zoom?: number;
}

/** interface to describe Gisida site app configuration object */
export interface SiteConfigApp {
  accessToken: string;
  apiAccessToken: string;
  appName: string;
  mapConfig: SiteConfigAppMapconfig;
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
  const { accessToken, apiAccessToken, appName, mapConfig: mbConfig, layers } = options;
  // Define flattened APP.mapConfig properties
  const {
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
  };

  // Build SiteConfig
  const config: SiteConfig = {
    APP,
    LAYERS: layers.map(LayerStore),
  };
  return config;
};

/** utility method to extract plan from superset response object */
export function extractPlan(plan: Plan) {
  const result: { [key: string]: any } = {
    canton: null,
    caseClassification: null,
    caseNotificationDate: null,
    district: null,
    focusArea: plan.jurisdiction_name,
    id: plan.id,
    jurisdiction_id: plan.jurisdiction_parent_id,
    jurisdiction_parent_id: plan.jurisdiction_parent_id,
    plan_id: plan.plan_id,
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
  return key ? key : colors.YELLOW;
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
      return colors.YELLOW;
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
  type: 'FeatureCollection';
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
    type: 'FeatureCollection',
  };
}
