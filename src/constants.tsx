// magical strings
export const JURISDICTION_ID = 'jurisdiction_id';
export const JURISDICTIONID = 'jurisdictionId';
export const PARENT_ID = 'parent_id';
export const PARENTID = 'parentId';
export const CASE_TRIGGERED = 'Case Triggered';
export const ROUTINE = 'Routine';
export const INVESTIGATION = 'Investigation';
export const STRUCTURE_LAYER = 'structure-layer';
export const POLYGON = 'Polygon';
export const MULTI_POLYGON = 'MultiPolygon';
export const POINT = 'Point';
export const FEATURE = 'Feature';
export const FEATURE_COLLECTION = 'FeatureCollection';
export const MAIN_PLAN = 'main-plan-layer';
export const APP = 'APP';
export const MAP_ID = 'map-1';
export const GEOJSON = 'geojson';
export const STRINGIFIED_GEOJSON = 'stringified-geojson';
export const MAP = 'map';
export const MAP_AREA = 'map-area';
export const DRAFT = 'draft';
export const NEW = 'new';
export const A1 = 'A1';
export const A2 = 'A2';
export const B1 = 'B1';
export const B2 = 'B2';
export const LOW_PRIORITY = 'low-priority';
export const MEDIUM_PRIORITY = 'medium-priority';
export const HIGH_PRIORITIY = 'high-priority';
export const TRUE = 'True';
export const FALSE = 'False';
export const INTERVENTION_TYPE_CODE = 'interventionType';
export const FI_STATUS_CODE = 'fiStatus';
export const FI_REASON_CODE = 'fiReason';
export const OPENSRP_EVENT_ID_CODE = 'opensrpEventId';
export const CASE_NUMBER_CODE = 'caseNum';
export const TASK_GENERATION_STATUS_CODE = 'taskGenerationStatus';
export const CASE_CONFIRMATION_ACTIVITY_CODE = 'caseConfirmation';
export const FAMILY_REGISTRATION_ACTIVITY_CODE = 'familyRegistration';
export const BLOOD_SCREENING_ACTIVITY_CODE = 'bloodScreening';
export const BEDNET_DISTRIBUTION_ACTIVITY_CODE = 'bednetDistribution';
export const LARVAL_DIPPING_ACTIVITY_CODE = 'larvalDipping';
export const MOSQUITO_COLLECTION_ACTIVITY_CODE = 'mosquitoCollection';
export const GA_ENV_TEST = 'test';
export const PLAN_ID = 'plan_id';
export const PLAN_INTERVENTION_TYPE = 'plan_intervention_type';
export const TWO_HUNDRED_PX = '200px';
export const PLAN_RECORD_BY_ID = 'planRecordsById';
export const MAPBOXGL_POPUP = '.mapboxgl-popup';
export const ACTION_CODE = 'action_code';
export const CASE_CONFIRMATION_GOAL_ID = 'Case_Confirmation';

// internal urls
export const BACKEND_LOGIN_URL = '/fe/login';
export const EXPRESS_LOGIN_URL = '/login';
export const REACT_LOGIN_URL = '/login';
export const LOGOUT_URL = '/logout';
export const HOME_URL = '/';
export const INTERVENTION_IRS_URL = '/intervention/irs';
export const INTERVENTION_IRS_DRAFTS_URL = '/intervention/irs/drafts';
export const NEW_IRS_PLAN_URL = '/intervention/irs/new';
export const DRAFT_IRS_PLAN_URL = '/intervention/irs/draft';
export const ACTIVE_IRS_PLAN_URL = `/intervention/irs/plan`;
export const REPORT_IRS_PLAN_URL = `/intervention/irs/report`;
export const ASSIGN_PLAN_URL = `/assign`;
export const FI_URL = '/focus-investigation';
export const FI_FILTER_URL = '/focus-investigation/filter';
export const FI_SINGLE_URL = '/focus-investigation/view';
export const FI_SINGLE_MAP_URL = '/focus-investigation/map';
export const NEW_PLAN_URL = '/plans/new';
export const PLAN_LIST_URL = '/plans/list';
export const PLAN_COMPLETION_URL = '/focus-investigation/view/complete';
export const PLAN_UPDATE_URL = '/plans/update';
export const CREATE_ORGANIZATION_URL = '/teams/new';
export const EDIT_ORGANIZATION_URL = '/teams/edit';
export const SINGLE_ORGANIZATION_URL = '/teams/view';
export const ORGANIZATIONS_LIST_URL = '/teams';
export const CREATE_PRACTITIONER_URL = '/practitioners/new';
export const EDIT_PRACTITIONER_URL = '/practitioners/edit';
export const ASSIGN_ORGANIZATION_URL = '/plans/teamAssignment';
export const PRACTITIONERS_LIST_URL = '/practitioners';
export const ASSIGN_PRACTITIONERS_URL = '/teams/assignPractitioners';
export const PLAN = 'plan';
export const REPORT = 'report';
export const BACKEND_CALLBACK_URL = '/fe/oauth/callback/opensrp';
export const BACKEND_CALLBACK_PATH = '/fe/oauth/callback/:id';
export const REACT_CALLBACK_PATH = '/oauth/callback/:id';

// OpenSRP API strings
export const OPENSRP_PRACTITIONER_ENDPOINT = 'practitioner';
export const OPENSRP_PRACTITIONER_ROLE_ENDPOINT = 'practitionerRole';
export const OPENSRP_FIND_BY_PROPERTIES = 'findByProperties';
export const OPENSRP_LOCATION = 'location';
export const OPENSRP_PLANS = 'plans';
export const OPENSRP_PARENT_ID = 'parent_id';
export const OPENSRP_ORGANIZATION_ENDPOINT = 'organization';
export const OPENSRP_GET_ASSIGNMENTS_ENDPOINT = `${OPENSRP_ORGANIZATION_ENDPOINT}/assignedLocationsAndPlans`;
export const OPENSRP_POST_ASSIGNMENTS_ENDPOINT = `${OPENSRP_ORGANIZATION_ENDPOINT}/assignLocationsAndPlans`;
export const OPENSRP_ORG_PRACTITIONER_ENDPOINT = 'organization/practitioner';
export const OPENSRP_DEL_PRACTITIONER_ROLE_ENDPOINT = 'practitionerRole/deleteByPractitioner';
export const OPENSRP_ADD_PRACTITIONER_ROLE_ENDPOINT = 'practitionerRole/add';
export const OPENSRP_USERS_ENDPOINT = 'user';
export const OPENSRP_FIND_EVENTS_ENDPOINT = 'event/findById';
export const OPENSRP_LOCATIONS_BY_PLAN = 'plans/findLocationNames';
export const OPENSRP_PLANS_BY_USER_FILTER = 'plans/user';

// colors
export const GREEN = 'Green';
export const YELLOW = 'Yellow';
export const ORANGE = 'Orange';
export const RED = 'Red';

// task action codes
export const BCC_CODE = 'BCC';
export const IRS_CODE = 'IRS';
export const BEDNET_DISTRIBUTION_CODE = 'Bednet Distribution';
export const BLOOD_SCREENING_CODE = 'Blood Screening';
export const CASE_CONFIRMATION_CODE = 'Case Confirmation';
export const RACD_REGISTER_FAMILY_CODE = 'RACD Register Family';
export const LARVAL_DIPPING_CODE = 'Larval Dipping';
export const MOSQUITO_COLLECTION_CODE = 'Mosquito Collection';
export const GOAL_CONFIRMATION_GOAL_ID = 'Case_Confirmation';
export const MOSQUITO_COLLECTION_ID = 'Mosquito_Collection';
export const LARVAL_DIPPING_ID = 'Larval_Dipping';
export const RACD_REGISTER_FAMILY_ID = 'RACD_register_families';

export const PRACTITIONER_CODE = {
  text: 'Community Health Worker',
};
/** Field to sort plans by */
export const SORT_BY_EFFECTIVE_PERIOD_START_FIELD = 'plan_effective_period_start';

/** Query Params */
export const QUERY_PARAM_TITLE = 'title';
export const QUERY_PARAM_USER = 'user';
