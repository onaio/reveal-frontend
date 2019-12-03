// magical strings
export const JURISDICTION_ID = 'jurisdiction_id';
export const JURISDICTIONID = 'jurisdictionId';
export const PARENT_ID = 'parent_id';
export const PARENTID = 'parentId';
export const CASE_TRIGGERED = 'Case Triggered';
export const ROUTINE = 'Routine';
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

// internal urls
export const LOGIN_URL = '/login';
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

export const PRACTITIONER_CODE = {
  text: 'Community Health Worker',
};

// todo - init i18n here (or migrate everything below) and asynchronously export translations
// also - async export/imports article: https://medium.com/@WebReflection/javascript-dynamic-import-export-b0e8775a59d4

// Display Strings
export const WELCOME_TO_REVEAL = 'Welcome to Reveal';
export const GET_STARTED_MESSAGE = 'Get started by selecting an intervention below';
export const PRACTITIONER_CREATED_SUCCESSFULLY = 'Practitioner created Successfully.';
export const PRACTITIONER_EDITED_SUCCESSFULLY = 'Practitioner edited successfully.';
export const REMOVING_PRACTITIONER_FAILED = 'Removing Practitioner Failed';
export const ON_REROUTE_WITH_UNSAVED_CHANGES =
  'Unsaved Changes: please Save or Discard changes made';

export const HOME_TITLE = `Home page`;
export const IRS_TITLE = 'IRS';
export const IRS_REPORTING_TITLE = 'IRS Reporting';
export const CONDITIONAL_FORMATTING_RULES = 'Conditional formatting rules';
export const CONDITIONAL_FORMATTING_TITLE = 'Conditional Formatting';
export const FI_RESPONSE_ADHERENCE_TITLE = 'FI Response Adherence';
export const FOCUS_INVESTIGATION_START_TITLE = 'Focus Investigation Start';
export const DATE_CREATED = 'Date Created';

export const NEW_PLAN = 'New Plan';
export const ADD_PLAN = 'Add Plan';
export const CREATE_NEW_PLAN = 'Create New Plan';
export const UPDATE_PLAN = 'Update Plan';
export const CREATE_NEW_IRS_PLAN = 'Create New IRS Plan';
export const ADD_FOCUS_INVESTIGATION = 'Add Focus Investigation';

export const START_DATE = 'Start Date';
export const END_DATE = 'End Date';
export const NAME = 'Name';
export const LEGEND_LABEL = 'Legend';
export const DISCARD_CHANGES = 'Discard changes';
export const SAVE_CHANGES = 'Save changes';
export const ASSIGN_PLANS = 'Assign Plans';
export const ASSIGN_PRACTITIONERS = 'Assign Practitioners';

export const USERS = 'Users';
export const ABOUT = 'About';
export const LOGIN = 'Login';
export const SIGN_OUT = 'Sign Out';

export const MAP_LOAD_ERROR = 'Could not load the map';
export const AN_ERROR_OCCURED = 'An Error Ocurred';
export const PLEASE_FIX_THESE_ERRORS = 'Please fix these errors';
export const NO_INVESTIGATIONS_FOUND = 'No Investigations Found';
export const NO_PRACTITIONERS_ADDED_YET = 'No Practitioners Added yet';
export const PLAN_SELECT_PLACEHOLDER = 'Other plans in this area';
export const PLAN_STATUS_UPDATE_ERROR =
  'Sorry, something went wrong when we tried to update the plan status';
export const NO_PLAN_FOUND_ERROR = 'Sorry, no plan found in the cloud!';
export const SAVE_PLAN_DEFINITION_ERROR =
  'Uh oh, looks like something is (syntactically) wrong with the Plan schema';
export const SAVE_PLAN_NO_JURISDICTIONS_ERROR = 'Oops, no jurisdictions selected!';

export const SAVE_TEAM = 'Save Team';
export const SAVE_PLAN = 'Save Plan';
export const SAVE_AS_DRAFT = 'Save as a Draft';
export const SAVE_FINALIZED_PLAN = 'Save Finalized Plan';
export const SAVE_ASSIGNMENTS = 'Save Assignments';
export const NO_PLANS_LOADED_MESSAGE = 'No plans found...';
export const SELECT = 'Select';
export const SELECT_USERNAME = 'Select username';

export const PRACTITIONER = 'Practitioner';
export const PRACTITIONERS = 'Practitioners';
export const SAVE = 'Save';
export const CLEAR = 'Clear';
export const ACTIVE = 'Active';
export const ASSIGN = 'Assign';
export const NO_TEAMS_LOADED_MESSAGE = 'No teams loaded...';
export const SELECT_TEAMS_TO_ASSIGN = 'Select Teams to Assign';
export const ASSIGN_TEAMS = 'Assign Teams';
export const TEAMS_ASSIGNED = 'Teams Assigned';
export const YES = 'Yes';
export const NO = 'No';
export const EDIT = 'Edit';
export const ADD = 'Add';
export const REMOVE = 'Remove';

export const IRS_PLANS = 'IRS Plans';
export const COUNTRY = 'Country';
export const NEW_TITLE = 'New';
export const PLAN_TITLE = 'Plan';
export const PLAN_STATUS = 'Plan Status';
export const TEAMS = 'Teams';
export const TEAM = 'Team';
export const EDIT_TEAM = 'Edit Team';
export const NEW_TEAM = 'New Team';
export const TEAMS_ASSIGNMENT = 'Team Assignment';
export const SEARCH = 'Search';
export const ACTION = 'Action';
export const ACTIONS = 'Actions';
export const IDENTIFIER = 'Identifier';
export const USERNAME = 'Username';
export const VIEW = 'view';

export const REACTIVE = 'Reactive';
export const REACTIVE_INVESTIGATION = 'Reactive Investigation';
export const REQUIRED = 'Required';
export const SAVING = 'Saving';
export const PLANS = 'Manage Plans';
export const PLANNING = 'Planning';
export const MONITOR = 'Monitor';
export const ADMIN = 'Admin';
export const DRAFTS_PARENTHESIS = '(drafts)';
export const CONFIRM = 'Confirm';
export const CANCEL = 'Cancel';
export const JURISDICTION = 'Jurisdiction';
export const ADMIN_LEVEL = 'Admin Level';
export const DISTRICT = 'District';
export const CANTON = 'Canton';
export const FI_REASON = 'FI Reason';
export const FI_STATUS = 'FI Status';
export const MEASURE = 'Measure';
export const MARK_AS_COMPLETE = 'Mark as complete';
export const STRUCTURES = 'structure(s)';
export const PERSONS = 'person(s)';

export const FOCUS_AREA_HEADER = 'Focus Area';
export const SPRAY_AREA_HEADER = 'Spray Area';
export const INTERVENTION_TYPE_LABEL = 'Intervention Type';
export const FOCUS_INVESTIGATION_STATUS_LABEL = 'Focus Investigation Status';
export const FOCUS_INVESTIGATION_STATUS_REASON = 'Focus Investigation Reason';
export const CASE_NUMBER = 'Case Number';
export const LAST_MODIFIED = 'Last Modified';
export const TITLE = 'Title';
export const PLAN_TITLE_LABEL = 'Plan Title';
export const PLAN_START_DATE_LABEL = 'Plan Start Date';
export const PLAN_END_DATE_LABEL = 'Plan End Date';
export const ACTIVITIES_LABEL = 'Activities';
export const DESCRIPTION_LABEL = 'Description';
export const QUANTITY_LABEL = 'Quantity';
export const PRIORITY_LABEL = 'Priority';
export const ADD_ACTIVITY = 'Add Activity';
export const REASON_HEADER = 'Reason';
export const STATUS_HEADER = 'Status';
export const CASE_NOTIF_DATE_HEADER = 'Case Notif. Date';
export const CASE_CLASSIFICATION_HEADER = 'Case Class.';
export const CASE_CLASSIFICATION_LABEL = 'Case Classification';
export const DEFINITIONS = 'Definitions';
export const TYPE_LABEL = 'Type';
export const LOCATIONS = 'Locations';

export const PROVINCE = 'Province';
export const HOME = 'Home';
export const FOCUS_INVESTIGATION = 'Focus Investigation';
export const CURRENT_FOCUS_INVESTIGATION = 'Current Focus Investigations';
export const COMPLETE_FOCUS_INVESTIGATION = 'Complete Focus Investigations';
export type COMPLETE_FOCUS_INVESTIGATION = typeof COMPLETE_FOCUS_INVESTIGATION;
export const INVESTIGATION = 'Investigation';
export const INTERVENTION = 'Intervention';
export const FOCUS_AREA_INFO = 'Focus Area Information';
export const FOCUS_INVESTIGATIONS = 'Focus Investigations';
export const ASSIGN_PRACTITIONERS_TO_ORG = 'Assign Practitioners to %s';
export const DATE_IS_REQUIRED = 'Date is Required';
export const NAME_IS_REQUIRED = 'Name is Required';
export const NUMERATOR_OF_DENOMINATOR_UNITS = '%s of %s %s';
export const MARK_PLAN_AS_COMPLETE = 'Mark %s as complete';
export const FIS_IN_JURISDICTION = 'Focus Investigations in %s';
export const FI_IN_JURISDICTION = 'Current Focus Investigations in %s';
export const PROGRESS = 'Progress';
export const ASSIGN_JURISDICTIONS = 'Assign Jurisdictions';
export const SELECT_JURISDICTIONS = 'Select Jurisdictions';
export const ADD_CODED_ACTIVITY = 'Add %s Activity';
export const ORGANIZATION_DETAILS = 'Team Details';
export const TEAM_MEMBERS = 'Team Members';
export const ONE_DAY_TO_GO = '1 day to go';
export const ZERO_DAYS_TO_GO = '0 days to go';
export const PRACTITIONERS_ASSIGNED_TO_ORG = '%s Practitioners successfully assigned to %s';
export const PRACTITIONER_REMOVED_FROM_ORG = '%s-%s successfully removed from %s';
export const ORGANIZATION_EDITED_SUCCESSFULLY = `Team edited successfully.`;
export const ORGANIZATION_CREATED_SUCCESSFULLY = `Team created successfully`;
export const DRAFT_PLAN_TITLE = '%s (draft)';
export const EDIT_PRACTITIONER = 'Edit Practitioner';
export const NEW_PRACTITIONER = 'New Practitioner';
export const SAVE_PRACTITIONER = 'Save Practitioner';

export const ROUTINE_TITLE = 'Routine';
export const ROUTINE_INVESTIGATION_TITLE = 'Routine Investigation';
export const BCC_ACTIVITY = 'Behaviour Change Communication';
export const BCC_ACTIVITY_DESCRIPTION = 'Conduct BCC activity';
export const BCC_GOAL_DESCRIPTION = 'Complete at least 1 BCC activity for the operational area';
export const BCC_GOAL_MEASURE = 'Number of BCC Activities Completed';
export const IRS_ACTIVITY = 'Spray Structures';
export const IRS_ACTIVITY_DESCRIPTION =
  'Visit each structure in the operational area and attempt to spray';
export const IRS_GOAL_DESCRIPTION = 'Spray structures in the operational area';
export const IRS_GOAL_MEASURE = 'Percent of structures sprayed';
export const BEDNET_ACTIVITY = 'Bednet Distribution';
export const BEDNET_ACTIVITY_DESCRIPTION =
  'Visit 100% of residential structures in the operational area and provide nets';
export const BEDNET_GOAL_MEASURE = 'Percent of residential structures received nets';
export const BLOOD_SCREENING_ACTIVITY = 'Blood screening';
export const BLOOD_SCREENING_ACTIVITY_DESCRIPTION =
  'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person';
export const BLOOD_SCREENING_GOAL_MEASURE = 'Number of registered people tested';
export const CASE_CONFIRMATION_ACTIVITY = 'Case Confirmation';
export const CASE_CONFIRMATION_ACTIVITY_DESCRIPTION = 'Confirm the index case';
export const CASE_CONFIRMATION_ACTIVITY_GOAL_MEASURE = 'Number of cases confirmed';
export const RACD_ACTIVITY = 'Family Registration';
export const RACD_ACTIVITY_DESCRIPTION =
  'Register all families & family members in all residential structures enumerated (100%) within the operational area';
export const RACD_ACTIVITY_GOAL_MEASURE =
  'Percent of residential structures with full family registration';
export const LARVAL_DIPPING_ACTIVITY = 'Larval Dipping';
export const LARVAL_DIPPING_ACTIVITY_DESCRIPTION =
  'Perform a minimum of three larval dipping activities in the operational area';
export const LARVAL_DIPPING_GOAL_MEASURE = 'Number of larval dipping activities completed';
export const MOSQUITO_COLLECTION_ACTIVITY = 'Mosquito Collection';
export const MOSQUITO_COLLECTION_ACTIVITY_DESCRIPTION =
  'Set a minimum of three mosquito collection traps and complete the mosquito collection process';
export const MOSQUITO_COLLECTION_GOAL_MEASURE =
  'Number of mosquito collection activities completed';

// TODO ? - do the below 2 belong here or in a settings file
export const ORGANIZATION_LABEL = TEAM;
export const ORGANIZATIONS_LABEL = TEAMS;
