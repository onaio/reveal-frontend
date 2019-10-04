/** This module handles settings taken from environment variables */

/** The website name */
export const WEBSITE_NAME = process.env.REACT_APP_WEBSITE_NAME || 'Reveal';
export type WEBSITE_NAME = typeof WEBSITE_NAME;

/** The domain name */
export const DOMAIN_NAME = process.env.REACT_APP_DOMAIN_NAME || 'http://localhost:3000';
export type DOMAIN_NAME = typeof DOMAIN_NAME;

/** Do you want to enable the IRS features? */
export const ENABLE_IRS = process.env.REACT_APP_ENABLE_IRS === 'true';
export type ENABLE_IRS = typeof ENABLE_IRS;

/** Do you want to enable the Focus Investigation features? */
export const ENABLE_FI = process.env.REACT_APP_ENABLE_FI === 'true';
export type ENABLE_FI = typeof ENABLE_FI;

/** Do you want to enable the users page? */
export const ENABLE_USERS = process.env.REACT_APP_ENABLE_USERS === 'true';
export type ENABLE_USERS = typeof ENABLE_USERS;

/** Do you want to enable the about page? */
export const ENABLE_ABOUT = process.env.REACT_APP_ENABLE_ABOUT === 'true';
export type ENABLE_ABOUT = typeof ENABLE_ABOUT;

/** Do you want to enable views dealing with teams */
export const ENABLE_TEAMS = process.env.REACT_APP_ENABLE_TEAMS === 'true';
export type ENABLE_TEAMS = typeof ENABLE_TEAMS;

/** Do you want to disable login protection? */
export const DISABLE_LOGIN_PROTECTION = process.env.REACT_APP_DISABLE_LOGIN_PROTECTION === 'true';
export type DISABLE_LOGIN_PROTECTION = typeof DISABLE_LOGIN_PROTECTION;

/** The Superset API base */
export const SUPERSET_API_BASE = process.env.REACT_APP_SUPERSET_API_BASE || 'http://localhost';
export type SUPERSET_API_BASE = typeof SUPERSET_API_BASE;

/** The Superset API endpoint */
export const SUPERSET_API_ENDPOINT = process.env.REACT_APP_SUPERSET_API_ENDPOINT || 'slice';
export type SUPERSET_API_ENDPOINT = typeof SUPERSET_API_ENDPOINT;

export const SUPERSET_PLANS_SLICE = process.env.REACT_APP_SUPERSET_PLANS_SLICE || '0';
export type SUPERSET_PLANS_SLICE = typeof SUPERSET_PLANS_SLICE;

export const SUPERSET_GOALS_SLICE = process.env.REACT_APP_SUPERSET_GOALS_SLICE || '0';
export type SUPERSET_GOALS_SLICE = typeof SUPERSET_GOALS_SLICE;

export const SUPERSET_JURISDICTIONS_SLICE =
  process.env.REACT_APP_SUPERSET_JURISDICTIONS_SLICE || '0';
export type SUPERSET_JURISDICTIONS_SLICE = typeof SUPERSET_JURISDICTIONS_SLICE;

export const SUPERSET_JURISDICTIONS_DATA_SLICE =
  process.env.REACT_APP_SUPERSET_JURISDICTIONS_DATA_SLICE || '0';
export type SUPERSET_JURISDICTIONS_DATA_SLICE = typeof SUPERSET_JURISDICTIONS_DATA_SLICE;

export const SUPERSET_IRS_REPORTING_PLANS_SLICE =
  process.env.REACT_APP_SUPERSET_IRS_REPORTING_PLANS_SLICE || '0';
export type SUPERSET_IRS_REPORTING_PLANS_SLICE = typeof SUPERSET_IRS_REPORTING_PLANS_SLICE;

export const SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES =
  process.env.REACT_APP_SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES || '0';
export type SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES = typeof SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES;

export const SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL =
  process.env.REACT_APP_SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL || '99';
export type SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL = typeof SUPERSET_IRS_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL;

export const SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE =
  process.env.REACT_APP_SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE || '0';
export type SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE = typeof SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE;

export const SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS =
  process.env.REACT_APP_SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS || '';
export type SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS = typeof SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS;
export const SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS =
  process.env.REACT_APP_SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS || '';
export type SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS = typeof SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS;

export const SUPERSET_IRS_REPORTING_INDICATOR_STOPS =
  process.env.REACT_APP_SUPERSET_IRS_REPORTING_INDICATOR_STOPS || 'zambia2019';
export type SUPERSET_IRS_REPORTING_INDICATOR_STOPS = typeof SUPERSET_IRS_REPORTING_INDICATOR_STOPS;
export const SUPERSET_IRS_REPORTING_INDICATOR_ROWS =
  process.env.REACT_APP_SUPERSET_IRS_REPORTING_INDICATOR_ROWS || 'zambia2019';
export type SUPERSET_IRS_REPORTING_INDICATOR_ROWS = typeof SUPERSET_IRS_REPORTING_INDICATOR_ROWS;

export const SUPERSET_STRUCTURES_SLICE = process.env.REACT_APP_SUPERSET_STRUCTURES_SLICE || '0';
export type SUPERSET_STRUCTURES_SLICE = typeof SUPERSET_STRUCTURES_SLICE;

export const SUPERSET_TASKS_SLICE = process.env.REACT_APP_SUPERSET_TASKS_SLICE || '0';
export type SUPERSET_TASKS_SLICE = typeof SUPERSET_TASKS_SLICE;

export const SUPERSET_PLANS_TABLE_SLICE = process.env.REACT_APP_SUPERSET_PLANS_TABLE_SLICE || '0';
export type SUPERSET_PLANS_TABLE_SLICE = typeof SUPERSET_PLANS_TABLE_SLICE;

export const SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE =
  process.env.REACT_APP_SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE || '0';
export type SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE = typeof SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE;

/** OpenSRP oAuth2 settings */
export const ENABLE_OPENSRP_OAUTH = process.env.REACT_APP_ENABLE_OPENSRP_OAUTH === 'true';
export type ENABLE_OPENSRP_OAUTH = typeof ENABLE_OPENSRP_OAUTH;
export const OPENSRP_CLIENT_ID = process.env.REACT_APP_OPENSRP_CLIENT_ID || '';
export type OPENSRP_CLIENT_ID = typeof OPENSRP_CLIENT_ID;

// notice the ending is NOT / here
export const OPENSRP_ACCESS_TOKEN_URL =
  process.env.REACT_APP_OPENSRP_ACCESS_TOKEN_URL ||
  'https://reveal-stage.smartregister.org/opensrp/oauth/token';
export type OPENSRP_ACCESS_TOKEN_URL = typeof OPENSRP_ACCESS_TOKEN_URL;

// notice the ending is NOT / here
export const OPENSRP_AUTHORIZATION_URL =
  process.env.REACT_APP_OPENSRP_AUTHORIZATION_URL ||
  'https://reveal-stage.smartregister.org/opensrp/oauth/authorize';
export type OPENSRP_AUTHORIZATION_URL = typeof OPENSRP_AUTHORIZATION_URL;

export const OPENSRP_USER_URL =
  process.env.REACT_APP_OPENSRP_USER_URL ||
  'https://reveal-stage.smartregister.org/opensrp/user-details';
export type OPENSRP_USER_URL = typeof OPENSRP_USER_URL;

export const OPENSRP_OAUTH_STATE = process.env.REACT_APP_OPENSRP_OAUTH_STATE || 'opensrp';
export type OPENSRP_OAUTH_STATE = typeof OPENSRP_OAUTH_STATE;

// notice the trailing /
export const OPENSRP_API_BASE_URL =
  process.env.REACT_APP_OPENSRP_API_BASE_URL ||
  'https://reveal-stage.smartregister.org/opensrp/rest/';
export type OPENSRP_API_BASE_URL = typeof OPENSRP_API_BASE_URL;

/** Onadata oAuth2 settings */
export const ENABLE_ONADATA_OAUTH = process.env.REACT_APP_ENABLE_ONADATA_OAUTH === 'true';
export type ENABLE_ONADATA_OAUTH = typeof ENABLE_ONADATA_OAUTH;
export const ONADATA_CLIENT_ID = process.env.REACT_APP_ONADATA_CLIENT_ID || '';
export type ONADATA_CLIENT_ID = typeof ONADATA_CLIENT_ID;

// notice the ending / here
export const ONADATA_ACCESS_TOKEN_URL =
  process.env.REACT_APP_ONADATA_ACCESS_TOKEN_URL || 'https://stage-api.ona.io/o/token/';
export type ONADATA_ACCESS_TOKEN_URL = typeof ONADATA_ACCESS_TOKEN_URL;

// notice the ending / here
export const ONADATA_AUTHORIZATION_URL =
  process.env.REACT_APP_ONADATA_AUTHORIZATION_URL || 'https://stage-api.ona.io/o/authorize/';
export type ONADATA_AUTHORIZATION_URL = typeof ONADATA_AUTHORIZATION_URL;

export const ONADATA_USER_URL =
  process.env.REACT_APP_ONADATA_USER_URL || 'https://stage-api.ona.io/api/v1/user.json';
export type ONADATA_USER_URL = typeof ONADATA_USER_URL;

export const ONADATA_OAUTH_STATE = process.env.REACT_APP_ONADATA_OAUTH_STATE || 'onadata';
export type ONADATA_OAUTH_STATE = typeof ONADATA_OAUTH_STATE;

export const GISIDA_MAPBOX_TOKEN = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN || '';
export type GISIDA_MAPBOX_TOKEN = typeof GISIDA_MAPBOX_TOKEN;

export const GISIDA_ONADATA_API_TOKEN = process.env.REACT_APP_GISIDA_ONADATA_API_TOKEN || '';
export type GISIDA_ONADATA_API_TOKEN = typeof GISIDA_ONADATA_API_TOKEN;

export const DIGITAL_GLOBE_CONNECT_ID = process.env.REACT_APP_DIGITAL_GLOBE_CONNECT_ID || '';
export type DIGITAL_GLOBE_CONNECT_ID = typeof DIGITAL_GLOBE_CONNECT_ID;

export const IRS_PLAN_COUNTRIES =
  (process.env.REACT_APP_IRS_PLAN_COUNTRIES &&
    process.env.REACT_APP_IRS_PLAN_COUNTRIES.split(',')) ||
  [];
export type IRS_PLAN_COUNTRIES = typeof IRS_PLAN_COUNTRIES;

export const DATE_FORMAT = process.env.REACT_APP_DATE_FORMAT || 'yyyy-MM-dd';
export type DATE_FORMAT = typeof DATE_FORMAT;

export const DEFAULT_TIME = process.env.REACT_APP_DEFAULT_TIME || 'T00:00:00+00:00';
export type DEFAULT_TIME = typeof DEFAULT_TIME;

export const DEFAULT_PLAN_DURATION_DAYS = process.env.REACT_APP_DEFAULT_PLAN_DURATION_DAYS || 20;
export type DEFAULT_PLAN_DURATION_DAYS = typeof DEFAULT_PLAN_DURATION_DAYS;

export const DEFAULT_ACTIVITY_DURATION_DAYS =
  process.env.REACT_APP_DEFAULT_ACTIVITY_DURATION_DAYS || 7;
export type DEFAULT_ACTIVITY_DURATION_DAYS = typeof DEFAULT_ACTIVITY_DURATION_DAYS;

export const PLAN_UUID_NAMESPACE =
  process.env.REACT_APP_PLAN_UUID_NAMESPACE || '85f7dbbf-07d0-4c92-aa2d-d50d141dde00';
export type PLAN_UUID_NAMESPACE = typeof PLAN_UUID_NAMESPACE;

export const ACTION_UUID_NAMESPACE =
  process.env.REACT_APP_ACTION_UUID_NAMESPACE || '35968df5-f335-44ae-8ae5-25804caa2d86';
export type ACTION_UUID_NAMESPACE = typeof ACTION_UUID_NAMESPACE;

export const DEFAULT_PLAN_VERSION = process.env.REACT_APP_DEFAULT_PLAN_VERSION || '1';
export type DEFAULT_PLAN_VERSION = typeof DEFAULT_PLAN_VERSION;
