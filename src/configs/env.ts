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

/** Do you want to disable login protection? */
export const DISABLE_LOGIN_PROTECTION = process.env.REACT_APP_DISABLE_LOGIN_PROTECTION === 'true';
export type DISABLE_LOGIN_PROTECTION = typeof DISABLE_LOGIN_PROTECTION;

/** The Superset API base */
export const SUPERSET_API_BASE = process.env.REACT_APP_SUPERSET_API_BASE;
export type SUPERSET_API_BASE = typeof SUPERSET_API_BASE;

/** The Superset API endpoint */
export const SUPERSET_API_ENDPOINT = process.env.REACT_APP_SUPERSET_API_ENDPOINT;
export type SUPERSET_API_ENDPOINT = typeof SUPERSET_API_ENDPOINT;

/** OPENSRP Client ID, for oAuth2 */
export const OPENSRP_CLIENT_ID = process.env.REACT_APP_OPENSRP_CLIENT_ID;
export type OPENSRP_CLIENT_ID = typeof OPENSRP_CLIENT_ID;

/** Onadata Client ID, for oAuth2 */
export const ONADATA_CLIENT_ID = process.env.REACT_APP_ONADATA_CLIENT_ID;
export type ONADATA_CLIENT_ID = typeof ONADATA_CLIENT_ID;
