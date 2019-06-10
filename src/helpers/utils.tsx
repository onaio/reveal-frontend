import { getOnadataUserInfo, getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { SessionState } from '@onaio/session-reducer';
import { uniq } from 'lodash';
import { Column } from 'react-table';
import SeamlessImmutable from 'seamless-immutable';
import { ONADATA_OAUTH_STATE, OPENSRP_OAUTH_STATE } from '../configs/env';
import { locationHierarchy, LocationItem } from '../configs/settings';
import { Plan } from '../store/ducks/plans';

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

export interface MapProps {
  [key: string]: any;
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

export interface MapConfig {
  [key: string]: FlexObject;
}

export interface FitBoundsOptions {
  padding?: number;
}

export interface SiteConfigAppMapconfig {
  bounds?: number[];
  center?: number[];
  container: string;
  fitBoundsOptions?: FitBoundsOptions;
  style: string;
  zoom?: number;
}

export interface SiteConfigApp {
  accessToken: string;
  apiAccessToken: string;
  appName: string;
  mapConfig: SiteConfigAppMapconfig;
}

export interface SiteConfig {
  APP: SiteConfigApp;
  LAYERS: any[];
}

export interface MapConfigs {
  [key: string]: FlexObject;
  [key: number]: FlexObject;
}

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
  const mutableLocationNames = locationNames.asMutable();

  if (mutableLocationNames) {
    mutableLocationNames.reverse();

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
    style: style || mapConfigStyle || 'mapbox://styles/mapbox/satellite-v9',
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
