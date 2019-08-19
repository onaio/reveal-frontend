import { Marker } from 'mapbox-gl';

// strings
export const MAP = 'map';
export type MAP = typeof MAP;
export const LOCATION = 'Location';
export type LOCATION = typeof LOCATION;
export const PROVINCE = 'Province';
export type PROVINCE = typeof PROVINCE;
export const HOME = 'Home';
export type HOME = typeof HOME;
export const FOCUS_INVESTIGATION = 'Focus Investigation';
export type FOCUS_INVESTIGATION = typeof FOCUS_INVESTIGATION;
export const CURRENT_FOCUS_INVESTIGATION = 'Current Focus Investigations';
export type CURRENT_FOCUS_INVESTIGATION = typeof CURRENT_FOCUS_INVESTIGATION;
export const COMPLETE_FOCUS_INVESTIGATION = 'Complete Focus Investigations';
export type COMPLETE_FOCUS_INVESTIGATION = typeof COMPLETE_FOCUS_INVESTIGATION;
export const INVESTIGATION = 'Investigation';
export type INVESTIGATION = typeof INVESTIGATION;
export const ACTIVE_FOCUS_INVESTIGATION = 'Active Focus Investigations';
export type ACTIVE_FOCUS_INVESTIGATION = typeof ACTIVE_FOCUS_INVESTIGATION;
export const FOCUS_AREA_INFO = 'Focus Area Information';
export type FOCUS_AREA_INFO = typeof FOCUS_AREA_INFO;
export const FOCUS_INVESTIGATIONS = 'Focus Investigations';
export type FOCUS_INVESTIGATIONS = typeof FOCUS_INVESTIGATIONS;
export const MAP_ID = 'map-1';
export type MAP_ID = typeof MAP_ID;
export const GEOJSON = 'geojson';
export type GEOJSON = typeof GEOJSON;
export const STRINGIFIED_GEOJSON = 'stringified-geojson';
export type STRINGIFIED_GEOJSON = typeof STRINGIFIED_GEOJSON;
export const FOCUS_AREA_HEADER = 'Focus Area';
export type FOCUS_AREA_HEADER = typeof FOCUS_AREA_HEADER;
export const INVESTIGATION_NAME_HEADER = 'Investigation Name';
export type INVESTIGATION_NAME_HEADER = typeof INVESTIGATION_NAME_HEADER;
export const REASON_HEADER = 'Reason';
export type REASON_HEADER = typeof REASON_HEADER;
export const STATUS_HEADER = 'Status';
export type STATUS_HEADER = typeof STATUS_HEADER;
export const CASE_NOTIF_DATE_HEADER = 'Case Notif. Date';
export type CASE_NOTIF_DATE_HEADER = typeof CASE_NOTIF_DATE_HEADER;
export const CASE_CLASSIFICATION_HEADER = 'Case Class.';
export type CASE_CLASSIFICATION_HEADER = typeof CASE_CLASSIFICATION_HEADER;
export const DEFINITIONS = 'Definitions';
export type DEFINITIONS = typeof DEFINITIONS;
export const IN = 'in';
export type IN = typeof IN;
export const DISTRICT = 'District';
export type DISTRICT = typeof DISTRICT;
export const CANTON = 'Canton';
export type CANTON = typeof CANTON;
export const FI_REASON = 'FI Reason';
export type FI_REASON = typeof FI_REASON;
export const FI_STATUS = 'FI Status';
export type FI_STATUS = typeof FI_STATUS;
export const ACTIVE_INVESTIGATION = 'Active Investigation';
export type ACTIVE_INVESTIGATION = typeof ACTIVE_INVESTIGATION;
export const COMPLETE = 'Complete';
export type COMPLETE = typeof COMPLETE;
export const NO = 'No';
export type NO = typeof NO;
export const RESPONSE = 'Response';
export type RESPONSE = typeof RESPONSE;
export const MEASURE = 'Measure';
export type MEASURE = typeof MEASURE;
export const OF = 'of';
export type OF = typeof OF;
export const IS = 'is';
export type IS = typeof IS;
export const MARK = 'Mark';
export type MARK = typeof MARK;
export const AS = 'as';
export type AS = typeof AS;
export const MARK_AS_COMPLETE = 'Mark as complete';
export type MARK_AS_COMPLETE = typeof MARK_AS_COMPLETE;
export const TARGET = 'Target';
export type TARGET = typeof TARGET;
export const POLYGON = 'Polygon';
export type POLYGON = typeof POLYGON;
export const MULTI_POLYGON = 'MultiPolygon';
export type MULTI_POLYGON = typeof MULTI_POLYGON;
export const POINT = 'Point';
export type POINT = typeof POINT;
export const FEATURE = 'Feature';
export type FEATURE = typeof FEATURE;
export const FEATURE_COLLECTION = 'FeatureCollection';
export type FEATURE_COLLECTION = typeof FEATURE_COLLECTION;
export const MAIN_PLAN = 'main-plan-layer';
export type MAIN_PLAN = typeof MAIN_PLAN;
export const APP = 'APP';
export type APP = typeof APP;
export const NO_GEOMETRIES_RESPONSE = 'Goals have no Geometries';
export type NO_GEOMETRIES_RESPONSE = typeof NO_GEOMETRIES_RESPONSE;
export const STRUCTURE_LAYER = 'structure-layer';
export type STRUCTURE_LAYER = typeof STRUCTURE_LAYER;
export const PROGRESS = 'Progress';
export type PROGRESS = typeof PROGRESS;
export const STRUCTURES = 'structure(s)';
export type STRUCTURES = typeof STRUCTURES;
export const PERSONS = 'person(s)';
export type PERSONS = typeof PERSONS;
export const CASE_TRIGGERED = 'Case-triggered';
export type CASE_TRIGGERED = typeof CASE_TRIGGERED;
export const ROUTINE = 'Routine';
export type ROUTINE = typeof ROUTINE;
export const REACTIVE = 'Reactive';
export type REACTIVE = typeof REACTIVE;
export const REQUIRED = 'Required';
export type REQUIRED = typeof REQUIRED;
export const SAVING = 'Saving';
export type SAVING = typeof SAVING;
export const DATE = 'Date';
export type DATE = typeof DATE;
export const PLANS = 'Manage Plans';
export type PLANS = typeof PLANS;
export const CONFIRM = 'Confirm';
export type CONFIRM = typeof CONFIRM;
export const CANCEL = 'Cancel';
export type CANCEL = typeof CANCEL;
export const IRS_PLANS = 'IRS Plans';
export type IRS_PLANS = typeof IRS_PLANS;

export const JURISDICTION_ID = 'jurisdiction_id';
export type JURISDICTION_ID = typeof JURISDICTION_ID;
export const JURISDICTIONID = 'jurisdictionId';
export type JURISDICTIONID = typeof JURISDICTIONID;
export const PARENT_ID = 'parent_id';
export type PARENT_ID = typeof JURISDICTION_ID;
export const PARENTID = 'parentId';
export type PARENTID = typeof JURISDICTIONID;
export const START_DATE = 'Start Date';
export type START_DATE = typeof START_DATE;
export const END_DATE = 'End Date';
export type END_DATE = typeof END_DATE;
export const NAME = 'Name';
export type NAME = typeof NAME;
export const NEW_PLAN = 'New Plan';
export type NEW_PLAN = typeof NEW_PLAN;

export const DATE_COMPLETED = 'Date Completed';
export type DATE_COMPLETED = typeof DATE_COMPLETED;
// internal urls
export const LOGIN_URL = '/login';
export type LOGIN_URL = typeof LOGIN_URL;
export const LOGOUT_URL = '/logout';
export type LOGOUT_URL = typeof LOGOUT_URL;
export const HOME_URL = '/';
export type HOME_URL = typeof HOME_URL;
export const INTERVENTION_IRS_URL = '/intervention/irs';
export type INTERVENTION_IRS_URL = typeof INTERVENTION_IRS_URL;
export const FI_URL = '/focus-investigation';
export type FI_URL = typeof FI_URL;
export const FI_SINGLE_URL = '/focus-investigation/view';
export type FI_SINGLE_URL = typeof FI_SINGLE_URL;
export const FI_SINGLE_MAP_URL = '/focus-investigation/map';
export type FI_SINGLE_MAP_URL = typeof FI_SINGLE_MAP_URL;
export const FI_HISTORICAL_URL = '/focus-investigation/historical';
export type FI_HISTORICAL_URL = typeof FI_HISTORICAL_URL;
export const NEW_PLAN_URL = '/plans/new';
export type NEW_PLAN_URL = typeof NEW_PLAN_URL;
export const PLAN_LIST_URL = '/plans/list';
export type PLAN_LIST_URL = typeof PLAN_LIST_URL;
export const PLAN_COMPLETION_URL = '/focus-investigation/view/complete';
export type PLAN_COMPLETION_URL = typeof PLAN_COMPLETION_URL;
export const PLAN_UPDATE_URL = '/plans/update';
export type PLAN_UPDATE_URL = typeof PLAN_UPDATE_URL;

// OpenSRP API strings
export const OPENSRP_FIND_BY_PROPERTIES = 'findByProperties';
export type OPENSRP_FIND_BY_PROPERTIES = typeof OPENSRP_FIND_BY_PROPERTIES;
export const OPENSRP_LOCATION = 'location';
export type OPENSRP_LOCATION = typeof OPENSRP_LOCATION;
export const OPENSRP_PLANS = 'plans';
export type OPENSRP_PLANS = typeof OPENSRP_PLANS;
export const OPENSRP_PARENT_ID = 'parent_id';
export type OPENSRP_PARENT_ID = typeof OPENSRP_PARENT_ID;

// container pages title names
export const HOME_TITLE = `Home page`;
export type HOME_TITLE = typeof HOME_TITLE;
export const FI_HISTORICAL_TITLE = `Historical Focus Investigations`;
export type FI_HISTORICAL_TITLE = typeof FI_HISTORICAL_TITLE;
export const IRS_TITLE = 'IRS';
export type IRS_TITLE = typeof IRS_TITLE;

// colors
export const GREEN = 'Green';
export type GREEN = typeof GREEN;
export const YELLOW = 'Yellow';
export type YELLOW = typeof YELLOW;
export const ORANGE = 'Orange';
export type ORANGE = typeof ORANGE;
export const RED = 'Red';
export type RED = typeof RED;

// task action codes
export const RACD_REGISTER_FAMILY_CODE = 'RACD Register Family';
export type RACD_REGISTER_FAMILY_CODE = typeof RACD_REGISTER_FAMILY_CODE;
export const CASE_CONFIRMATION_CODE = 'Case Confirmation';
export type CASE_CONFIRMATION_CODE = typeof CASE_CONFIRMATION_CODE;
export const MOSQUITO_COLLECTION_CODE = 'Mosquito Collection';
export type MOSQUITO_COLLECTION_CODE = typeof MOSQUITO_COLLECTION_CODE;
export const BEDNET_DISTRIBUTION_CODE = 'Bednet Distribution';
export type BEDNET_DISTRIBUTION_CODE = typeof BEDNET_DISTRIBUTION_CODE;
export const LARVAL_DIPPING_CODE = 'Larval Dipping';
export type LARVAL_DIPPING_CODE = typeof LARVAL_DIPPING_CODE;
export const BLOOD_SCREENING_CODE = 'Blood Screening';
export type BLOOD_SCREENING_CODE = typeof BLOOD_SCREENING_CODE;
export const IRS_CODE = 'IRS';
export type IRS_CODE = typeof IRS_CODE;

// plans
export const ROUTINE_PLAN = 'Routine';
export type ROUTINE_PLAN = typeof ROUTINE_PLAN;
export const CASE_TRIGGERED_PLAN = 'Case-triggered';
export type CASE_TRIGGERED_PLAN = typeof CASE_TRIGGERED_PLAN;
export const INTERVENTION_TYPE = 'interventionType';
export type INTERVENTION_TYPE = typeof INTERVENTION_TYPE;
export const FI_PLAN_TYPE = 'FI';
export type FI_PLAN_TYPE = typeof FI_PLAN_TYPE;
export const IRS_PLAN_TYPE = 'IRS';
export type IRS_PLAN_TYPE = typeof IRS_PLAN_TYPE;
