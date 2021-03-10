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
export const DISABLED = 'Disabled';
export const INTERNAL = 'internal';
export const IGNORE = 'ignore';
export const INTERVENTION_TYPE_CODE = 'interventionType';
export const FI_STATUS_CODE = 'fiStatus';
export const FI_REASON_CODE = 'fiReason';
export const OPENSRP_EVENT_ID_CODE = 'opensrpEventId';
export const CASE_NUMBER_CODE = 'caseNum';
export const TASK_GENERATION_STATUS_CODE = 'taskGenerationStatus';
export const TEAM_ASSIGNMENT_STATUS_CODE = 'teamAssignmentStatus';
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
export const DAYS = 'days';
export const CONDITION = 'condition';
export const TRIGGER = 'trigger';
export const RISK_LABEL = 'Risk';
export const TIMELINE_SLIDER_STEP1 = '1';
export const TIMELINE_SLIDER_STEP2 = '2';
export const TIMELINE_SLIDER_STEP3 = '3';
export const MODAL_BUTTON_CLASS = 'focus-investigation btn btn-primary float-right mt-0';
export const BUSINESS_STATUS = 'business_status';
export const IRS_REPORT_STRUCTURES = 'irs_report_structures';
export const SMC_REPORT_STRUCTURES = 'SMC_report_structures';
export const PLAN_DEFINITION = 'PlanDefinition';
export const RETIRE_PLAN = 'Retire_Plan';
export const RETIRE_REASON = 'retire_reason';
export const EVENT_LABEL = 'Event';
export const FORM_SUBMISSION_FIELD = 'formsubmissionField';

// internal urls
export const BACKEND_LOGIN_URL = '/fe/login';
export const EXPRESS_LOGIN_URL = '/login';
export const REACT_LOGIN_URL = '/login';
export const LOGOUT_URL = '/logout';
export const HOME_URL = '/';
export const REPORT_IRS_PLAN_URL = `/intervention/irs/report`;
export const PERFORMANCE_REPORT_IRS_PLAN_URL = `/intervention/irs/performance/report`;
export const REPORT_IRS_LITE_PLAN_URL = `/intervention/irs-lite/report`;
export const PERFORMANCE_REPORT_IRS_LITE_PLAN_URL = `/intervention/irs-lite/performance/report`;
export const REPORT_MDA_POINT_PLAN_URL = `/intervention/mda-point/report`;
export const REPORT_MDA_PLAN_URL = `/intervention/mda/report`;
export const MDA_POINT_LOCATION_REPORT_URL = '/intervention/mda-point/location-report';
export const MDA_POINT_CHILD_REPORT_URL = '/intervention/mda-point/child-report';
export const REPORT_SMC_PLAN_URL = `/intervention/smc/report`;
export const SMC_LOCATION_REPORT_URL = '/intervention/smc/location-report';
export const IRS_MOP_UP_REPORT_URL = '/intervention/irs/mopup';
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
export const EDIT_SERVER_SETTINGS_URL = '/server-settings';
export const PLANNING_VIEW_URL = '/plans/planning';
export const NEW_PLANNING_PLAN_URL = `${PLANNING_VIEW_URL}/${NEW}`;
export const ASSIGN_JURISDICTIONS_URL = '/assignJurisdictions';
export const MANUAL_ASSIGN_JURISDICTIONS_URL = '/manualSelectJurisdictions';
export const AUTO_ASSIGN_JURISDICTIONS_URL = '/auoSelectJurisdictions';
export const EXPRESS_TOKEN_REFRESH_URL = '/refresh/token';
export const SESSION_EXPIRED_URL = '/session/expired';
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
export const OPENSRP_GET_ALL_PLANS = 'plans/getAll';
export const OPENSRP_PARENT_ID = 'parent_id';
export const OPENSRP_ORGANIZATION_ENDPOINT = 'organization';
export const OPENSRP_GET_ASSIGNMENTS_ENDPOINT = `${OPENSRP_ORGANIZATION_ENDPOINT}/assignedLocationsAndPlans`;
export const OPENSRP_POST_ASSIGNMENTS_ENDPOINT = `${OPENSRP_ORGANIZATION_ENDPOINT}/assignLocationsAndPlans`;
export const OPENSRP_ORG_PRACTITIONER_ENDPOINT = 'organization/practitioner';
export const OPENSRP_DEL_PRACTITIONER_ROLE_ENDPOINT = 'practitionerRole/deleteByPractitioner';
export const OPENSRP_ADD_PRACTITIONER_ROLE_ENDPOINT = 'practitionerRole/add';
export const OPENSRP_USERS_ENDPOINT = 'user';
export const OPENSRP_USERS_COUNT_ENDPOINT = 'user/count';
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
export const OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT = 'location/hierarchy';
export const OPENSRP_PLAN_HIERARCHY_ENDPOINT = 'location/hierarchy/plan';
export const OPENSRP_FIND_LOCATION_BY_JURISDICTION_IDS = `location/findByJurisdictionIds`;
export const OPENSRP_ACTIVE = 'Active';
export const OPENSRP_STATUS = 'status';
export const OPENSRP_MANIFEST_ENDPOINT = 'manifest';
export const OPENSRP_FORMS_ENDPOINT = 'clientForm';
export const OPENSRP_MANIFEST_FORMS_ENDPOINT = 'clientForm/release-related-files';
export const OPENSRP_FORM_METADATA_ENDPOINT = 'clientForm/metadata';
export const SETTINGS_ENDPOINT = 'settings/';
export const LOCATIONS_ENDPOINT = 'location/location-tree';
export const SECURITY_AUTHENTICATE_ENDPOINT = 'security/authenticate';
export const OPENSRP_KEYCLOAK_PARAM = 'Keycloak';
export const OPENSRP_EVENT_ENDPOINT = 'event';

// colors
export const GREEN = 'Green';
export const YELLOW = 'Yellow';
export const ORANGE = 'Orange';
export const RED = 'Red';
export const INHERIT = 'inherit';

// plan activity codes
export const CASE_CONFIRMATION_ACTIVITY_CODE = 'caseConfirmation';
export const FAMILY_REGISTRATION_ACTIVITY_CODE = 'familyRegistration';
export const BLOOD_SCREENING_ACTIVITY_CODE = 'bloodScreening';
export const BEDNET_DISTRIBUTION_ACTIVITY_CODE = 'bednetDistribution';
export const LARVAL_DIPPING_ACTIVITY_CODE = 'larvalDipping';
export const MOSQUITO_COLLECTION_ACTIVITY_CODE = 'mosquitoCollection';
export const BCC_ACTIVITY_CODE = 'BCC';
export const IRS_ACTIVITY_CODE = 'IRS';
export const MDA_POINT_DISPENSE_ACTIVITY_CODE = 'pointDispenseMDA';
export const MDA_POINT_ADVERSE_EFFECTS_ACTIVITY_CODE = 'pointAdverseMDA';
export const DYNAMIC_FAMILY_REGISTRATION_ACTIVITY_CODE = 'dynamicFamilyRegistration';
export const DYNAMIC_BLOOD_SCREENING_ACTIVITY_CODE = 'dynamicBloodScreening';
export const DYNAMIC_BEDNET_DISTRIBUTION_ACTIVITY_CODE = 'dynamicBednetDistribution';
export const DYNAMIC_LARVAL_DIPPING_ACTIVITY_CODE = 'dynamicLarvalDipping';
export const DYNAMIC_MOSQUITO_COLLECTION_ACTIVITY_CODE = 'dynamicMosquitoCollection';
export const DYNAMIC_BCC_ACTIVITY_CODE = 'dynamicBCC';
export const DYNAMIC_IRS_ACTIVITY_CODE = 'dynamicIRS';
export const DYNAMIC_MDA_COMMUNITY_DISPENSE_ACTIVITY_CODE = 'dynamicCommunityDispenseMDA';
export const DYNAMIC_MDA_COMMUNITY_ADHERENCE_ACTIVITY_CODE = 'dynamicCommunityAdherenceMDA';
export const MDA_ADHERENCE = 'MDAAdherence';
export const MDA_FAMILY_REGISTRATION = 'MDAFamilyRegistration';
export const MDA_DISPENSE_ACTIVITY_CODE = 'MDADispenseCode';
export const CDD_SUPERVISION_ACTIVITY_CODE = 'CDDSupervision';

// task action codes
export const BCC_CODE = 'BCC';
export const IRS_CODE = 'IRS';
export const CDD_SUPERVISION_CODE = 'CDD Supervision';
export const BEDNET_DISTRIBUTION_CODE = 'Bednet Distribution';
export const BLOOD_SCREENING_CODE = 'Blood Screening';
export const CASE_CONFIRMATION_CODE = 'Case Confirmation';
export const RACD_REGISTER_FAMILY_CODE = 'RACD Register Family';
export const LARVAL_DIPPING_CODE = 'Larval Dipping';
export const MOSQUITO_COLLECTION_CODE = 'Mosquito Collection';
export const MDA_POINT_DISPENSE_CODE = 'MDA Dispense';
export const MDA_POINT_ADVERSE_EFFECTS_CODE = 'MDA Adverse Event(s)';
export const MDA_ADHERENCE_CODE = 'MDA Adherence';
export const GOAL_CONFIRMATION_GOAL_ID = 'Case_Confirmation';
export const GOAL_ID = 'goal_id';

export const CREATE_TYPE = 'create';

// dynamic plan activities
export const NAMED_EVENT_TRIGGER_TYPE = 'named-event';
export const PLAN_ACTIVATION_TRIGGER_NAME = 'plan-activation';
export const APPLICABILITY_CONDITION_KIND = 'applicability';

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
export const QUERY_PARAM_DATE = 'date';

/** Settings Configuration */
export const SETTINGS_CONFIGURATION = 'SettingConfiguration';

/** Jurisdiction Metadata */
export const JURISDICTION_METADATA_RISK = 'jurisdiction_metadata-risk';
export const JURISDICTION_METADATA_COVERAGE = 'jurisdiction_metadata-coverage';
export const JURISDICTION_METADATA_POPULATION = 'jurisdiction_metadata-population';
export const JURISDICTION_METADATA_TARGET = 'jurisdiction_metadata-target';
export const JURISDICTION_METADATA_STUCTURES = 'jurisdiction_metadata-structures';
export const JURISDICTION_CSV_TEMPLATE = 'jurisdiction_id,jurisdiction_name,risk,coverage';
export const JURISDICTION_CSV_FILE_NAME = 'jurisdiction-metadata.csv';
export const GET_ALL = 'getAll';

/** CSV File MIME Types */
export const TEXT_CSV = 'text/csv';
export const APPLICATION_CSV = 'application/csv';
export const TEXT_PLAIN = 'text/plain';
export const TEXT_X_CSV = 'text/x-csv';
export const APPLICATION_VND_EXCEL = 'application/vnd.ms-excel';
export const APPLICATION_X_CSV = 'application/x-csv';
export const TEXT_COMMA_SEPARATED_VALUES = 'text/comma-separated-values';
export const TEXT_X_COMMA_SEPARATED_VALUES = 'text/x-comma-separated-values';
export const TEXT_TAB_SEPARATED_VALUES = 'text/tab-separated-values';

/** Superset API strings */
export const SUPERSET_ACCESS_DENIED_MESSAGE = 'Access is Denied';

/** React Mapbox GL strings */
export const REACT_MAPBOX_GL_ICON_IMAGE = 'icon-image';
export const REACT_MAPBOX_GL_ICON_SIZE = 'icon-size';
export const CIRCLE_PAINT_COLOR_CATEGORICAL_TYPE = 'categorical';
export const DefaultMapDimensions: [number, number] = [600, 400];
