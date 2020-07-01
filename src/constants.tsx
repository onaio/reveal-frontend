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
export const MDA_POINT_DISPENSE_ACTIVITY_CODE = 'pointDispenseMDA';
export const MDA_POINT_ADVERSE_EFFECTS_ACTIVITY_CODE = 'pointAdverseMDA';
export const GA_ENV_TEST = 'test';
export const PLAN_ID = 'plan_id';
export const PLAN_INTERVENTION_TYPE = 'plan_intervention_type';
export const TWO_HUNDRED_PX = '200px';
export const PLAN_RECORD_BY_ID = 'planRecordsById';
export const MAPBOXGL_POPUP = '.mapboxgl-popup';
export const TABLE_BORDERED_CLASS = 'table table-bordered';
export const ACTION_CODE = 'action_code';
export const CASE_CONFIRMATION_GOAL_ID = 'Case_Confirmation';
export const MOSQUITO_COLLECTION_ID = 'Mosquito_Collection';
export const LARVAL_DIPPING_ID = 'Larval_Dipping';
export const RACD_REGISTER_FAMILY_ID = 'RACD_register_families';
export const STRUCTURES_LINE = 'structures-line';
export const STRUCTURES_FILL = 'structures-fill';
export const HISTORICAL_INDEX_CASES = 'historical-index-cases';
export const CURRENT_INDEX_CASES = 'current-index-cases';
export const FILE_UPLOAD_TYPE = 'file-upload';
export const VALIDATOR_UPLOAD_TYPE = 'validator-upload';

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
export const REPORT_MDA_POINT_PLAN_URL = `/intervention/mda-point/report`;
export const MDA_POINT_LOCATION_REPORT_URL = '/intervention/mda-point/location-report';
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
export const CLIENTS_LIST_URL = '/clients';
export const UPLOAD_CLIENT_CSV_URL = '/clients/upload';
export const JURISDICTION_METADATA_URL = '/jurisdiction-metadata';
export const GO_BACK_TEXT = 'Go Back';
export const MANIFEST_RELEASE_URL = '/manifest/releases';
export const VIEW_DRAFT_FILES_URL = '/files/draft';
export const JSON_VALIDATORS_URL = '/json-validators';
export const MANIFEST_FILE_UPLOAD = '/manifest';
/** how long after opening a logout window should we wait before redirecting to express' server logout
 * I am not sure the optimum value for this, mozilla firefox seems to take some
 * time loading up the logoutWindow and actually making the request.
 */
export const LOGOUT_REDIRECTION_DELAY = 1000;

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
export const OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT = 'upload/history';
export const OPENSRP_EVENT_PARAM_VALUE = 'Child Registration';
export const OPENSRP_UPLOAD_ENDPOINT = 'upload';
export const OPENSRP_UPLOAD_DOWNLOAD_ENDPOINT = 'upload/download';
export const EVENT_NAME_PARAM = 'event_name';
export const LOCATION_ID_PARAM = 'location_id';
export const TEAM_ID_PARAM = 'team_id';
export const OPENSRP_TEMPLATE_ENDPOINT = 'template';
export const OPENSRP_PLANS_BY_USER_FILTER = 'plans/user';
export const OPENSRP_V1_SETTINGS_ENDPOINT = 'settings/sync';
export const OPENSRP_V2_SETTINGS = 'v2/settings/';
export const OPENSRP_ACTIVE = 'Active';
export const OPENSRP_STATUS = 'status';
export const OPENSRP_MANIFEST_ENDPOINT = 'manifest';
export const OPENSRP_FORMS_ENDPOINT = 'clientForm';
export const OPENSRP_MANIFEST_FORMS_ENDPOINT = 'clientForm/release-related-files';
export const OPENSRP_FORM_METADATA_ENDPOINT = 'clientForm/metadata';

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
export const MDA_POINT_DISPENSE_CODE = 'MDA Dispense';
export const MDA_POINT_ADVERSE_EFFECTS_CODE = 'MDA Adverse Event(s)';
export const GOAL_CONFIRMATION_GOAL_ID = 'Case_Confirmation';

export const PRACTITIONER_CODE = {
  text: 'Community Health Worker',
};
/** Field to sort plans by */
export const SORT_BY_EFFECTIVE_PERIOD_START_FIELD = 'plan_effective_period_start';

/** Query Params */
export const QUERY_PARAM_TITLE = 'title';
export const QUERY_PARAM_USER = 'user';
export const REACTIVE_QUERY_PARAM = 'reactive_plans';
export const ROUTINE_QUERY_PARAM = 'routine_plans';

/** Settings Configuration */
export const SETTINGS_CONFIGURATION = 'SettingConfiguration';

/** Jurisdiction Metadata */
export const JURISDICTION_METADATA_RISK = 'jurisdiction_metadata-risk';
export const JURISDICTION_METADATA_COVERAGE = 'jurisdiction_metadata-coverage';
