// env vars
export const WEBSITE_NAME = process.env.REACT_APP_WEBSITE_NAME;
export type WEBSITE_NAME = typeof WEBSITE_NAME;
export const DOMAIN_NAME = process.env.REACT_APP_DOMAIN_NAME;
export type DOMAIN_NAME = typeof DOMAIN_NAME;
export const ONADATA_CLIENT_ID = process.env.REACT_APP_ONADATA_CLIENT_ID;
export type ONADATA_CLIENT_ID = typeof ONADATA_CLIENT_ID;

// strings
export const LOCATION = 'Location';
export type LOCATION = typeof LOCATION;
export const PROVINCE = 'Province';
export type PROVINCE = typeof PROVINCE;
export const HOME = 'Home';
export type HOME = typeof HOME;
export const FOCUS_INVESTIGATION = 'Focus Investigation';
export type FOCUS_INVESTIGATION = typeof FOCUS_INVESTIGATION;
export const FOCUS_AREA_INFO = 'Focus Area Information';
export type FOCUS_AREA_INFO = typeof FOCUS_AREA_INFO;
export const FOCUS_INVESTIGATIONS = 'Focus Investigations';
export type FOCUS_INVESTIGATIONS = typeof FOCUS_INVESTIGATIONS;

// internal urls
export const HOME_URL = '/';
export type HOME_URL = typeof HOME_URL;
export const IRS_URL = '/irs';
export type IRS_URL = typeof IRS_URL;
export const FI_URL = '/focus-investigation';
export type FI_URL = typeof FI_URL;
export const FI_SINGLE_URL = '/focus-investigation/view';
export type FI_SINGLE_URL = typeof FI_SINGLE_URL;
export const FI_SINGLE_MAP_URL = '/focus-investigation/map';
export type FI_SINGLE_MAP_URL = typeof FI_SINGLE_MAP_URL;
export const FI_HISTORICAL_URL = '/focus-investigation/historical';
export type FI_HISTORICAL_URL = typeof FI_HISTORICAL_URL;

// colors
export const GREEN = 'Green';
export type GREEN = typeof GREEN;
export const YELLOW = 'Yellow';
export type YELLOW = typeof YELLOW;
export const ORANGE = 'Orange';
export type ORANGE = typeof ORANGE;
export const RED = 'Red';
export type RED = typeof RED;

// thresholds
export const GREEN_THRESHOLD = 0.9;
export type GREEN_THRESHOLD = typeof GREEN_THRESHOLD;
export const YELLOW_THRESHOLD = 0.2;
export type YELLOW_THRESHOLD = typeof YELLOW_THRESHOLD;
export const ORANGE_THRESHOLD = 0.8;
export type ORANGE_THRESHOLD = typeof ORANGE_THRESHOLD;

// 1-3-7 thresholds
export const ONE = 0;
export const ZERO = 0;
