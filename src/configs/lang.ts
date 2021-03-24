// import the strings reference i18n file for the specified language
import { LANGUAGE } from './env';
import strings, { Reference } from './strings';
const reference: Reference = strings[LANGUAGE] || {};

/**
 * @param {string} key The unique variable name of the display string
 * @param {string} fallback The (original) English fallback string if reference doesn't include the display string
 * @param {Reference} ref The i18n reference object to pull strings from
 * @returns {string} The translated display string
 */
export const translate = (key: string, fallback: string, ref: Reference = reference): string =>
  (ref && ref[key] && ref[key].message) || fallback;

export const WELCOME_TO_REVEAL = translate('WELCOME_TO_REVEAL', 'Welcome to Reveal');
export const GET_STARTED_MESSAGE = translate(
  'GET_STARTED_MESSAGE',
  'Get started by selecting an intervention below'
);
export const PRACTITIONER_CREATED_SUCCESSFULLY = translate(
  'PRACTITIONER_CREATED_SUCCESSFULLY',
  'Practitioner created Successfully.'
);
export const PRACTITIONER_EDITED_SUCCESSFULLY = translate(
  'PRACTITIONER_EDITED_SUCCESSFULLY',
  'Practitioner edited successfully.'
);
export const REMOVING_PRACTITIONER_FAILED = translate(
  'REMOVING_PRACTITIONER_FAILED',
  'Removing Practitioner Failed'
);
export const ON_REROUTE_WITH_UNSAVED_CHANGES = translate(
  'ON_REROUTE_WITH_UNSAVED_CHANGES',
  'Unsaved Changes: please Save or Discard changes made'
);
export const HOME_TITLE = translate('HOME_TITLE', 'Home page');
export const IRS_TITLE = translate('IRS_TITLE', 'IRS');
export const PLANNING_PAGE_TITLE = translate('PLANNING_PAGE_TITLE', 'Planning tool');
export const IRS_REPORTING_TITLE = translate('IRS_REPORTING_TITLE', 'IRS Reporting');
export const IRS_PERFORMANCE_REPORTING_TITLE = translate(
  'IRS_PERFORMANCE_REPORTING_TITLE',
  'IRS Performance Reporting'
);
export const IRS_LITE_REPORTING_TITLE = translate('IRS_LITE_REPORTING_TITLE', 'IRS Lite Reporting');
export const IRS_LITE_PERFORMANCE_REPORTING_TITLE = translate(
  'IRS_LITE_PERFORMANCE_REPORTING_TITLE',
  'IRS Lite Performance Reporting'
);

export const MDA_REPORTING_TITLE = translate('MDA_REPORTING_TITLE', 'MDA Reporting');
export const CONDITIONAL_FORMATTING_RULES = translate(
  'CONDITIONAL_FORMATTING_RULES',
  'Conditional formatting rules'
);
export const CONDITIONAL_FORMATTING_TITLE = translate(
  'CONDITIONAL_FORMATTING_TITLE',
  'Conditional Formatting'
);
export const FI_RESPONSE_ADHERENCE_TITLE = translate(
  'FI_RESPONSE_ADHERENCE_TITLE',
  'FI Response Adherence'
);
export const FOCUS_INVESTIGATION_START_TITLE = translate(
  'FOCUS_INVESTIGATION_START_TITLE',
  'Focus Investigation Start'
);
export const DATE_CREATED = translate('DATE_CREATED', 'Date Created');
export const DATE_COMPLETED = translate('DATE_COMPLETED', 'Date Completed');
export const NEW_PLAN = translate('NEW_PLAN', 'New Plan');
export const ADD_PLAN = translate('ADD_PLAN', 'Add Plan');
export const CREATE_NEW_PLAN = translate('CREATE_NEW_PLAN', 'Create New Plan');
export const UPDATE_PLAN = translate('UPDATE_PLAN', 'Update Plan');
export const CREATE_NEW_IRS_PLAN = translate('CREATE_NEW_IRS_PLAN', 'Create New IRS Plan');
export const ADD_FOCUS_INVESTIGATION = translate(
  'ADD_FOCUS_INVESTIGATION',
  'Add Focus Investigation'
);

export const START_DATE = translate('START_DATE', 'Start Date');
export const END_DATE = translate('END_DATE', 'End Date');
export const NAME = translate('NAME', 'Name');
export const LEGEND_LABEL = translate('LEGEND_LABEL', 'Legend');
export const DISCARD_CHANGES = translate('DISCARD_CHANGES', 'Discard changes');
export const SAVE_CHANGES = translate('SAVE_CHANGES', 'Save changes');
export const ASSIGN_PLANS = translate('ASSIGN_PLANS', 'Assign Plans');
export const ASSIGN_PRACTITIONERS = translate('ASSIGN_PRACTITIONERS', 'Assign Practitioners');

export const USERS = translate('USERS', 'Users');
export const ABOUT = translate('ABOUT', 'About');
export const LOGIN = translate('LOGIN', 'Login');
export const SIGN_OUT = translate('SIGN_OUT', 'Sign Out');

export const MAP_LOAD_ERROR = translate('MAP_LOAD_ERROR', 'Could not load the map');
export const AN_ERROR_OCCURRED = translate('AN_ERROR_OCCURRED', 'An Error Ocurred');
export const ERROR_LOADING_ITEMS = translate('ERROR_LOADING_ITEMS', 'Could not load points on map');
export const PLEASE_FIX_THESE_ERRORS = translate(
  'PLEASE_FIX_THESE_ERRORS',
  'Please fix these errors'
);
export const NO_INVESTIGATIONS_FOUND = translate(
  'NO_INVESTIGATIONS_FOUND',
  'No Investigations Found'
);
export const NO_PRACTITIONERS_ADDED_YET = translate(
  'NO_PRACTITIONERS_ADDED_YET',
  'No Practitioners Added yet'
);
export const PLAN_SELECT_PLACEHOLDER = translate(
  'PLAN_SELECT_PLACEHOLDER',
  'Other plans in this area'
);
export const PLAN_STATUS_UPDATE_ERROR = translate(
  'PLAN_STATUS_UPDATE_ERROR',
  'Sorry, something went wrong when we tried to update the plan status'
);
export const USERS_FETCH_ERROR = translate(
  'USERS_FETCH_ERROR',
  'Sorry, something went wrong when we tried to fetch users'
);
export const NO_PLAN_FOUND_ERROR = translate(
  'NO_PLAN_FOUND_ERROR',
  'Sorry, no plan found in the cloud!'
);
export const SAVE_PLAN_DEFINITION_ERROR = translate(
  'SAVE_PLAN_DEFINITION_ERROR',
  'Uh oh, looks like something is (syntactically) wrong with the Plan schema'
);
export const SAVE_PLAN_NO_JURISDICTIONS_ERROR = translate(
  'SAVE_PLAN_NO_JURISDICTIONS_ERROR',
  'Oops, no jurisdictions selected!'
);

export const SAVE_TEAM = translate('SAVE_TEAM', 'Save Team');
export const SAVE_PLAN = translate('SAVE_PLAN', 'Save Plan');
export const SAVE_AS_DRAFT = translate('SAVE_AS_DRAFT', 'Save as a Draft');
export const SAVE_FINALIZED_PLAN = translate('SAVE_FINALIZED_PLAN', 'Save Finalized Plan');
export const SAVE_ASSIGNMENTS = translate('SAVE_ASSIGNMENTS', 'Save Assignments');
export const SAVE_FILE = translate('SAVE_FILE', 'Save File');
export const NO_PLANS_LOADED_MESSAGE = translate('NO_PLANS_LOADED_MESSAGE', 'No plans found...');
export const SELECT = translate('SELECT', 'Select');
export const SELECT_USERNAME = translate('SELECT_USERNAME', 'Select username');
export const SELECT_PLACHOLDER = translate('SELECT_PLACHOLDER', 'Select %s');

export const PRACTITIONER = translate('PRACTITIONER', 'Practitioner');
export const PRACTITIONERS = translate('PRACTITIONERS', 'Practitioners');
export const SAVE = translate('SAVE', 'Save');
export const CLEAR = translate('CLEAR', 'Clear');
export const ACTIVE = translate('ACTIVE', 'Active');
export const ASSIGN = translate('ASSIGN', 'Assign');
export const NO_TEAMS_LOADED_MESSAGE = translate('NO_TEAMS_LOADED_MESSAGE', 'No teams loaded...');
export const SELECT_TEAMS_TO_ASSIGN = translate('SELECT_TEAMS_TO_ASSIGN', 'Select Teams to Assign');
export const ASSIGN_TEAMS = translate('ASSIGN_TEAMS', 'Assign Teams');
export const TEAMS_ASSIGNED = translate('TEAMS_ASSIGNED', 'Teams Assigned');
export const YES = translate('YES', 'Yes');
export const NO = translate('NO', 'No');
export const EDIT = translate('EDIT', 'Edit');
export const ADD = translate('ADD', 'Add');
export const REMOVE = translate('REMOVE', 'Remove');
export const UPLOAD = translate('UPLOAD', 'Upload');

export const IRS_PLANS = translate('IRS_PLANS', 'IRS Plans');
export const IRS_LITE_PLANS = translate('IRS_LITE_PLANS', 'IRS Lite Plans');
export const MDA_PLANS = translate('MDA_PLANS', 'MDA Plans');
export const MDA_POINT_PLANS = translate('MDA_POINT_PLANS', 'MDA Point Plans');
export const SMC_PLANS = translate('SMC_PLANS', 'SMC Plans');
export const COUNTRY = translate('COUNTRY', 'Country');
export const JURISDICTION_HIERARCHY_TEMPLATE = translate(
  'JURISDICTION_HIERARCHY_TEMPLATE',
  'JurisdictionHierachyTemplate'
);
export const SELECT_COUNTRY = translate('SELECT_COUNTRY', 'Select Country');
export const NEW_TITLE = translate('NEW_TITLE', 'New');
export const PLAN_TITLE = translate('PLAN_TITLE', 'Plan');
export const PLAN_STATUS = translate('PLAN_STATUS', 'Plan Status');
export const TEAMS = translate('TEAMS', 'Teams');
export const TEAM = translate('TEAM', 'Team');
export const EDIT_TEAM = translate('EDIT_TEAM', 'Edit Team');
export const NEW_TEAM = translate('NEW_TEAM', 'New Team');
export const TEAMS_ASSIGNMENT = translate('TEAMS_ASSIGNMENT', 'Team Assignment');
export const SEARCH = translate('SEARCH', 'Search');
export const ACTION = translate('ACTION', 'Action');
export const ACTIONS = translate('ACTIONS', 'Actions');
export const IDENTIFIER = translate('IDENTIFIER', 'Identifier');
export const USERNAME = translate('USERNAME', 'Username');
export const VIEW = translate('VIEW', 'view');
export const JURISDICTION_METADATA = translate('JURISDICTION_METADATA', 'Jurisdiction Metadata');
export const DOWNLOAD_JURISDICTION_METADATA = translate(
  'DOWNLOAD_JURISDICTION_METADATA',
  'Download Jurisdiction Metadata'
);
export const UPLOAD_JURISDICTION_METADATA = translate(
  'UPLOAD_JURISDICTION_METADATA',
  'Upload Jurisdiction Metadata'
);
export const HOW_TO_UPDATE_JURISDICTION_METADATA = translate(
  'HOW_TO_UPDATE_JURISDICTION_METADATA',
  'How To Update The Jurisdiction Metadata'
);

export const REACTIVE = translate('REACTIVE', 'Reactive');
export const REACTIVE_INVESTIGATION = translate('REACTIVE_INVESTIGATION', 'Reactive Investigation');
export const REQUIRED = translate('REQUIRED', 'Required');
export const SAVING = translate('SAVING', 'Saving');
export const UPLOADING_FILE = translate('UPLOADING_FILE', 'Uploading File');
export const DOWNLOADING = translate('DOWNLOADING', 'Downloading');
export const PLANS = translate('PLANS', 'Manage Plans');
export const PLANNING = translate('PLANNING', 'Planning');
export const MONITOR = translate('MONITOR', 'Monitor');
export const ADMIN = translate('ADMIN', 'Admin');
export const DRAFTS_PARENTHESIS = translate('DRAFTS_PARENTHESIS', '(drafts)');
export const CONFIRM = translate('CONFIRM', 'Confirm');
export const CANCEL = translate('CANCEL', 'Cancel');
export const CLOSE = translate('CLOSE', 'Close');
export const JURISDICTION = translate('JURISDICTION', 'Jurisdiction');
export const ADMIN_LEVEL = translate('ADMIN_LEVEL', 'Admin Level');
export const DISTRICT = translate('DISTRICT', 'District');
export const CANTON = translate('CANTON', 'Canton');
export const VILLAGE = translate('VILLAGE', 'Village');
export const FI_REASON = translate('FI_REASON', 'FI Reason');
export const FI_STATUS = translate('FI_STATUS', 'FI Status');
export const FI_COLUMN_STATUS = translate('FI_COLUMN_STATUS', 'FI Status');
export const MEASURE = translate('MEASURE', 'Measure');
export const MARK_AS_COMPLETE = translate('MARK_AS_COMPLETE', 'Mark as complete');
export const STRUCTURES = translate('STRUCTURES', 'structure(s)');
export const PERSONS = translate('PERSONS', 'person(s)');

export const FOCUS_AREA_HEADER = translate('FOCUS_AREA_HEADER', 'Focus Area');
export const SPRAY_AREA_HEADER = translate('SPRAY_AREA_HEADER', 'Spray Area');
export const INTERVENTION_TYPE_LABEL = translate('INTERVENTION_TYPE_LABEL', 'Intervention Type');
export const FOCUS_CLASSIFICATION_LABEL = translate(
  'FOCUS_CLASSIFICATION_LABEL',
  'Focus Classification'
);
export const FOCUS_INVESTIGATION_STATUS_REASON = translate(
  'FOCUS_INVESTIGATION_STATUS_REASON',
  'Focus Investigation Reason'
);
export const CASE_NUMBER = translate('CASE_NUMBER', 'Case Number');
export const LAST_MODIFIED = translate('LAST_MODIFIED', 'Last Modified');
export const TITLE = translate('TITLE', 'Title');
export const PLAN_TITLE_LABEL = translate('PLAN_TITLE_LABEL', 'Plan Title');
export const PLAN_START_DATE_LABEL = translate('PLAN_START_DATE_LABEL', 'Plan Start Date');
export const PLAN_END_DATE_LABEL = translate('PLAN_END_DATE_LABEL', 'Plan End Date');
export const ACTIVITIES_LABEL = translate('ACTIVITIES_LABEL', 'Activities');
export const DESCRIPTION_LABEL = translate('DESCRIPTION_LABEL', 'Description');
export const QUANTITY_LABEL = translate('QUANTITY_LABEL', 'Quantity');
export const PRIORITY_LABEL = translate('PRIORITY_LABEL', 'Priority');
export const ADD_ACTIVITY = translate('ADD_ACTIVITY', 'Add Activity');
export const REASON_HEADER = translate('REASON_HEADER', 'Reason');
export const STATUS_HEADER = translate('STATUS_HEADER', 'Status');
export const CASE_NOTIF_DATE_HEADER = translate('CASE_NOTIF_DATE_HEADER', 'Case Notif. Date');
export const CASE_CLASSIFICATION_HEADER = translate('CASE_CLASSIFICATION_HEADER', 'Case Class.');
export const CASE_CLASSIFICATION_LABEL = translate(
  'CASE_CLASSIFICATION_LABEL',
  'Case Classification'
);
export const DEFINITIONS = translate('DEFINITIONS', 'Definitions');
export const TYPE_LABEL = translate('TYPE_LABEL', 'Type');
export const LOCATIONS = translate('LOCATIONS', 'Locations');

export const PROVINCE = translate('PROVINCE', 'Province');
export const HOME = translate('HOME', 'Home');
export const FOCUS_INVESTIGATION = translate('FOCUS_INVESTIGATION', 'Focus Investigation');
export const CURRENT_FOCUS_INVESTIGATION = translate(
  'CURRENT_FOCUS_INVESTIGATION',
  'Current Focus Investigations'
);
export const COMPLETE_FOCUS_INVESTIGATION = translate(
  'COMPLETE_FOCUS_INVESTIGATION',
  'Complete Focus Investigations'
);
export const INVESTIGATION = translate('INVESTIGATION', 'Investigation');
export const INTERVENTION = translate('INTERVENTION', 'Intervention');
export const FOCUS_AREA_INFO = translate('FOCUS_AREA_INFO', 'Focus Area Information');
export const FOCUS_INVESTIGATIONS = translate('FOCUS_INVESTIGATIONS', 'Focus Investigations');
export const ASSIGN_PRACTITIONERS_TO_ORG = translate(
  'ASSIGN_PRACTITIONERS_TO_ORG',
  'Assign Practitioners to %s'
);
export const DATE_IS_REQUIRED = translate('DATE_IS_REQUIRED', 'Date is Required');
export const NAME_IS_REQUIRED = translate('NAME_IS_REQUIRED', 'Name is Required');
export const NUMERATOR_OF_DENOMINATOR_UNITS = translate(
  'NUMERATOR_OF_DENOMINATOR_UNITS',
  '%s of %s %s'
);
export const MARK_PLAN_AS_COMPLETE = translate('MARK_PLAN_AS_COMPLETE', 'Mark %s as complete');
export const FIS_IN_JURISDICTION = translate('FIS_IN_JURISDICTION', 'Focus Investigations in %s');
export const FI_IN_JURISDICTION = translate(
  'FI_IN_JURISDICTION',
  'Current Focus Investigations in %s'
);
export const PROGRESS = translate('PROGRESS', 'Progress');
export const ASSIGN_JURISDICTIONS = translate('ASSIGN_JURISDICTIONS', 'Assign Jurisdictions');
export const SELECT_JURISDICTIONS = translate('SELECT_JURISDICTIONS', 'Select Jurisdictions');
export const ADD_CODED_ACTIVITY = translate('ADD_CODED_ACTIVITY', 'Add %s Activity');
export const ORGANIZATION_DETAILS = translate('ORGANIZATION_DETAILS', 'Team Details');
export const TEAM_MEMBERS = translate('TEAM_MEMBERS', 'Team Members');
export const ONE_DAY_TO_GO = translate('ONE_DAY_TO_GO', '1 day to go');
export const ZERO_DAYS_TO_GO = translate('ZERO_DAYS_TO_GO', '0 days to go');
export const PRACTITIONERS_ASSIGNED_TO_ORG = translate(
  'PRACTITIONERS_ASSIGNED_TO_ORG',
  '%s Practitioners successfully assigned to %s'
);
export const PRACTITIONER_REMOVED_FROM_ORG = translate(
  'PRACTITIONER_REMOVED_FROM_ORG',
  '%s-%s successfully removed from %s'
);
export const ORGANIZATION_EDITED_SUCCESSFULLY = translate(
  'ORGANIZATION_EDITED_SUCCESSFULLY',
  `Team edited successfully.`
);
export const FILE_UPLOADED_SUCCESSFULLY = translate(
  'FILE_UPLOADED_SUCCESSFULLY',
  `File uploaded successfully.`
);
export const FILE_DOWNLOADED_SUCCESSFULLY = translate(
  'FILE_DOWNLOADED_SUCCESSFULLY',
  `File downloaded successfully.`
);
export const FILE_UPLOAD_FAILED = translate(
  'FILE_UPLOAD_FAILED',
  `File upload failed please try again.`
);
export const ORGANIZATION_CREATED_SUCCESSFULLY = translate(
  'ORGANIZATION_CREATED_SUCCESSFULLY',
  `Team created successfully`
);
export const DRAFT_PLAN_TITLE = translate('DRAFT_PLAN_TITLE', '%s (draft)');
export const EDIT_PRACTITIONER = translate('EDIT_PRACTITIONER', 'Edit Practitioner');
export const NEW_PRACTITIONER = translate('NEW_PRACTITIONER', 'New Practitioner');
export const SAVE_PRACTITIONER = translate('SAVE_PRACTITIONER', 'Save Practitioner');

export const CASE_TRIGGERED_TITLE = translate('CASE_TRIGGERED_TITLE', 'Case Triggered');
export const ROUTINE_TITLE = translate('ROUTINE_TITLE', 'Routine');
export const ROUTINE_INVESTIGATION_TITLE = translate(
  'ROUTINE_INVESTIGATION_TITLE',
  'Routine Investigation'
);
export const BCC_ACTIVITY = translate('BCC_ACTIVITY', 'Behaviour Change Communication');
export const BCC_ACTIVITY_DESCRIPTION = translate(
  'BCC_ACTIVITY_DESCRIPTION',
  'Conduct BCC activity'
);
export const BCC_GOAL_DESCRIPTION = translate(
  'BCC_GOAL_DESCRIPTION',
  'Complete at least 1 BCC activity for the operational area'
);
export const BCC_GOAL_MEASURE = translate('BCC_GOAL_MEASURE', 'BCC Activities Complete');
export const IRS_ACTIVITY = translate('IRS_ACTIVITY', 'Spray Structures');
export const IRS_ACTIVITY_DESCRIPTION = translate(
  'IRS_ACTIVITY_DESCRIPTION',
  'Visit each structure in the operational area and attempt to spray'
);
export const IRS_GOAL_DESCRIPTION = translate(
  'IRS_GOAL_DESCRIPTION',
  'Spray structures in the operational area'
);
export const IRS_GOAL_MEASURE = translate('IRS_GOAL_MEASURE', 'Percent of structures sprayed');
export const BEDNET_ACTIVITY = translate('BEDNET_ACTIVITY', 'Bednet Distribution');
export const BEDNET_ACTIVITY_DESCRIPTION = translate(
  'BEDNET_ACTIVITY_DESCRIPTION',
  'Visit 100% of residential structures in the operational area and provide nets'
);
export const BEDNET_GOAL_MEASURE = translate(
  'BEDNET_GOAL_MEASURE',
  'Percent of residential structures received nets'
);
export const BLOOD_SCREENING_ACTIVITY = translate('BLOOD_SCREENING_ACTIVITY', 'Blood screening');
export const BLOOD_SCREENING_ACTIVITY_DESCRIPTION = translate(
  'BLOOD_SCREENING_ACTIVITY_DESCRIPTION',
  'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person'
);
export const BLOOD_SCREENING_GOAL_MEASURE = translate(
  'BLOOD_SCREENING_GOAL_MEASURE',
  'Number of registered people tested'
);
export const CASE_CONFIRMATION_ACTIVITY = translate(
  'CASE_CONFIRMATION_ACTIVITY',
  'Case Confirmation'
);
export const CASE_CONFIRMATION_ACTIVITY_DESCRIPTION = translate(
  'CASE_CONFIRMATION_ACTIVITY_DESCRIPTION',
  'Confirm the index case'
);
export const CASE_CONFIRMATION_ACTIVITY_GOAL_MEASURE = translate(
  'CASE_CONFIRMATION_ACTIVITY_GOAL_MEASURE',
  'Number of cases confirmed'
);
export const REGISTER_FAMILY_ACTIVITY = translate(
  'REGISTER_FAMILY_ACTIVITY',
  'Family Registration'
);
export const REGISTER_FAMILY_ACTIVITY_DESCRIPTION = translate(
  'REGISTER_FAMILY_ACTIVITY_DESCRIPTION',
  'Register all families & family members in all residential structures enumerated (100%) within the operational area'
);
export const REGISTER_FAMILY_ACTIVITY_GOAL_MEASURE = translate(
  'REGISTER_FAMILY_ACTIVITY_GOAL_MEASURE',
  'Percent of residential structures with full family registration'
);
export const LARVAL_DIPPING_ACTIVITY = translate('LARVAL_DIPPING_ACTIVITY', 'Larval Dipping');
export const LARVAL_DIPPING_ACTIVITY_DESCRIPTION = translate(
  'LARVAL_DIPPING_ACTIVITY_DESCRIPTION',
  'Perform a minimum of three larval dipping activities in the operational area'
);
export const LARVAL_DIPPING_GOAL_MEASURE = translate(
  'LARVAL_DIPPING_GOAL_MEASURE',
  'Number of larval dipping activities completed'
);
export const MOSQUITO_COLLECTION_ACTIVITY = translate(
  'MOSQUITO_COLLECTION_ACTIVITY',
  'Mosquito Collection'
);
export const MOSQUITO_COLLECTION_ACTIVITY_DESCRIPTION = translate(
  'MOSQUITO_COLLECTION_ACTIVITY_DESCRIPTION',
  'Set a minimum of three mosquito collection traps and complete the mosquito collection process'
);
export const MOSQUITO_COLLECTION_GOAL_MEASURE = translate(
  'MOSQUITO_COLLECTION_GOAL_MEASURE',
  'Number of mosquito collection activities completed'
);
export const MDA_POINT_DISPENSE_ACTIVITY_DESCRIPTION = translate(
  'MDA_POINT_DISPENSE_ACTIVITY_DESCRIPTION',
  'Dispense medication to each eligible person'
);
export const MDA_DISPENSE_ACTIVITY_DESCRIPTION = translate(
  'MDA_DISPENSE_ACTIVITY_DESCRIPTION',
  'Visit all residential structures (100%) dispense prophylaxis to each registered person'
);
export const MDA_POINT_DISPENSE_COLLECTION_GOAL = translate(
  'MDA_POINT_DISPENSE_ACTIVITY_DESCRIPTION',
  'Percent of eligible people'
);
export const MDA_POINT_ADVERSE_EFFECT_ACTIVITY_DESCRIPTION = translate(
  'MDA_POINT_ADVERSE_EFFECT_ACTIVITY_DESCRIPTION',
  'Report any adverse events from medication'
);
export const MDA_POINT_ADVERSE_EFFECT_COLLECTION_GOAL = translate(
  'MDA_POINT_ADVERSE_EFFECT_COLLECTION_GOAL',
  'Percent of people who reported adverse events'
);

export const MDA_ADHERENCE_DESCRIPTION = translate(
  'MDA_ADHERENCE_DESCRIPTION',
  'Visit all residential structures (100%) and confirm adherence of each registered person'
);

export const RACD_REGISTER_FAMILY_ACTIVITY = translate(
  'RACD_REGISTER_FAMILY_ACTIVITY',
  'RACD Register Family'
);

export const A1_DESCRIPTION = translate(
  'A1_DESCRIPTION',
  'Indigenous case recorded within the last year.'
);
export const A1_NAME = translate('A1_NAME', 'Active');
export const A2_DESCRIPTION = translate(
  'A2_DESCRIPTION',
  'No indigenous case during the last year, but withing the last 3 years.'
);
export const A2_NAME = translate('A2_NAME', 'Residual Non-Active');
export const B1_DESCRIPTION = translate(
  'B1_DESCRIPTION',
  'Receptive area but no indigenous cases within the last 3 years.'
);

export const CDD_SUPERVISION_ACTIVITY_DESCRIPTION = translate(
  'CDD_SUPERVISION_ACTIVITY_DESCRIPTION',
  'Visit each operational area and submit one CDD Supervisor Daily Summary form'
);
export const CDD_SUPERVISION_ACTIVITY = translate(
  'CDD_SUPERVISION_ACTIVITY',
  'Submit CDD Supervisor Daily Summary form'
);
export const CDD_SUPERVISION_EXPRESSION_DESCRIPTION = translate(
  'CDD_SUPERVISION_EXPRESSION_DESCRIPTION',
  'Structure type does not exist'
);
export const CDD_SUPERVISION_GOAL_DESCRIPTION = translate(
  'CDD_SUPERVISION_GOAL_DESCRIPTION',
  'Submit one CDD Supervisor Daily Summary form per operational area per day'
);
export const CDD_SUPERVISION_GOAL_MEASURE = translate(
  'CDD_SUPERVISION_GOAL_MEASURE',
  'Percent of forms submitted'
);

export const B1_NAME = translate('B1_NAME', 'Cleared Receptive');
export const B2_DESCRIPTION = translate('B2_DESCRIPTION', 'Non-receptive area.');
export const B2_NAME = translate('B2_NAME', 'Cleared Non-Receptive');

export const PLAN_STATUS_ACTIVE = translate('PLAN_STATUS_ACTIVE', 'active');
export const PLAN_STATUS_COMPLETE = translate('PLAN_STATUS_COMPLETE', 'complete');
export const PLAN_STATUS_DRAFT = translate('PLAN_STATUS_DRAFT', 'draft');
export const PLAN_STATUS_RETIRED = translate('PLAN_STATUS_RETIRED', 'retired');

export const GOAL_UNIT_ACTIVITY = translate('GOAL_UNIT_ACTIVITY', 'activit(y|ies)');
export const GOAL_UNIT_CASE = translate('GOAL_UNIT_CASE', 'case(s)');
export const GOAL_UNIT_PERCENT = translate('GOAL_UNIT_PERCENT', 'Percent');
export const GOAL_UNIT_PERSON = translate('GOAL_UNIT_PERSON', 'Person(s)');
export const GOAL_UNIT_UNKNOWN = translate('GOAL_UNIT_UNKNOWN', 'unknown');

export const LOW_PRIORITY_LABEL = translate('LOW_PRIORITY_LABEL', 'Low Priority');
export const MEDIUM_PRIORITY_LABEL = translate('MEDIUM_PRIORITY_LABEL', 'Medium Priority');
export const HIGH_PRIORITIY_LABEL = translate('HIGH_PRIORITIY_LABEL', 'High Priority');

export const NEXT = translate('NEXT', 'Next');
export const PREVIOUS = translate('PREVIOUS', 'Previous');

// TODO ? - do the below 2 belong here or in a settings file
export const ORGANIZATION_LABEL = TEAM;
export const ORGANIZATIONS_LABEL = TEAMS;

export const ORGANIZATION_NAME_TITLE = translate('ORGANIZATION_NAME_TITLE', 'Team Name');
export const WELCOME_BACK = translate('WELCOME_BACK', 'Welcome back');

export const LINK = translate('LINK', 'Link');
export const IRS_GREEN_THRESHOLD = translate('IRS_GREEN_THRESHOLD', 'Green');
export const IRS_GREY_THRESHOLD = translate('IRS_GREY_THRESHOLD', 'Grey');
export const IRS_ORANGE_THRESHOLD = translate('IRS_ORANGE_THRESHOLD', 'Orange');
export const IRS_RED_THRESHOLD = translate('IRS_RED_THRESHOLD', 'Red');
export const IRS_YELLOW_THRESHOLD = translate('IRS_YELLOW_THRESHOLD', 'Yellow');
export const IRS_LIGHT_GREEN_THRESHOLD = translate('IRS_LIGHT_GREEN_THRESHOLD', 'Light Green');

export const JURISDICTION_LOADING_ERROR = translate(
  'JURISDICTION_LOADING_ERROR',
  'An error prevented this jurisdiction from loading.'
);
export const FOCI_OF_RESIDENCE = translate('FOCI_OF_RESIDENCE', 'Foci of Residence');
export const FOCI_OF_INFECTION = translate('FOCI_OF_INFECTION', 'Foci of Infection');
export const CASE_DETAILS = translate('CASE_DETAILS', 'Case Details');
export const CASE_INFORMATION = translate('CASE_INFORMATION', 'Case Information');
export const AGE = translate('AGE', 'Age');
export const SURNAME = translate('SURNAME', 'Surname');
export const PATIENT_NAME = translate('PATIENT_NAME', 'Patient Name');
export const HOUSE_NUMBER = translate('HOUSE_NUMBER', 'House Number');
export const INVESTIGATION_DATE = translate('INVESTIGATION_DATE', 'Investigation Date');
export const SPECIES = translate('SPECIES', 'Species');
export const DIAGNOSIS_DATE = translate('DIAGNOSIS_DATE', 'Date of Diagnosis');
export const CLASSIFICATION = translate('CLASSIFICATION', 'Classification');
export const FAILED_TO_GET_EVENT_ID = translate(
  'FAILED_TO_GET_EVENT_ID',
  'Failed to extract event Id from plan'
);
export const FAILED_TO_EXTRACT_PLAN_RECORD = translate(
  'FAILED_TO_EXTRACT_PLAN_RECORD',
  'Failed to extract a plan record'
);
export const LOGIN_PROMPT = translate(
  'LOGIN_PROMPT',
  'Please log in with one of the following providers'
);
export const SEARCH_ACTIVE_FOCUS_INVESTIGATIONS = translate(
  'SEARCH_ACTIVE_FOCUS_INVESTIGATIONS',
  'Search active focus investigations'
);
export const NO_OPTIONS = translate('NO_OPTIONS', 'No Options');
export const MDA_TITLE = translate('MDA_TITLE', 'MDA');
export const MDA_POINT_TITLE = translate('MDA_POINT_TITLE', 'MDA Point');
export const DYNAMIC_FI_TITLE = translate('DYNAMIC_FI_TITLE', 'Dynamic FI');
export const DYNAMIC_IRS_TITLE = translate('DYNAMIC_IRS_TITLE', 'Dynamic IRS');
export const DYNAMIC_MDA_TITLE = translate('DYNAMIC_MDA_TITLE', 'Dynamic MDA');
export const MDA_LITE_TITLE = translate('MDA_LITE_TITLE', 'MDA-Lite');
export const SMC_TITLE = translate('SMC_TITLE', 'SMC');
export const TEAM_ASSIGNMENT_SUCCESSFUL = translate(
  'TEAM_ASSIGNMENT_SUCCESSFUL',
  'Team(s) assignment updated successfully'
);
export const UPLOADED_STUDENT_LISTS = translate('UPLOADED_STUDENT_LISTS', 'Uploaded Students List');
export const EXPORT_STUDENT_LIST = translate('EXPORT_STUDENT_LIST', 'Export Student List');
export const ADD_NEW_CSV = translate('ADD_NEW_CSV', 'Add New CSV');
export const CLIENTS_TITLE = translate('CLIENTS_TITLE', 'Clients');
export const STUDENTS_TITLE = translate('STUDENTS_TITLE', 'Students');
export const UPLOADED_CLIENT_LISTS = translate('UPLOADED_CLIENT_LISTS', 'Uploaded Clients List');
export const EXPORT_CLIENT_LIST = translate('EXPORT_CLIENT_LIST', 'Export Client List');
export const RESET = translate('RESET', 'Reset');
export const EXPORT_BASED_ON_GEOGRAPHICAL_REGION = translate(
  'EXPORT_BASED_ON_GEOGRAPHICAL_REGION',
  'Export Country based on Geographical level!'
);
export const LOCATION_ERROR_MESSAGE = translate(
  'SELECT_LOCATION_ERROR_MESSAGE',
  'Please select location'
);
export const DOWNLOAD = translate('DOWNLOAD', 'Download');
export const FILE_NAME = translate('FILE_NAME', 'File Name');
export const OWNER = translate('OWNER', 'Owner');
export const UPLOAD_DATE = translate('UPLOAD_DATE', 'Upload Date');
export const UPLOAD_FILE = translate('UPLOAD_FILE', 'Upload File');
export const DOWNLOAD_FILE = translate('DOWNLOAD_FILE', 'Download File');
export const SUBMIT = translate('SUBMIT', 'Submit');
export const CLIENT_UPLOAD_FORM = translate('CLIENT_UPLOAD_FORM', 'Client Upload Form');
export const FILE_SUBMISSION_READY = translate('FILE_SUBMISSION_READY', 'File is ready to submit');
export const LOADING = translate('LOADING', 'loading...');

export const MDA_POINT_REPORTING_TITLE = translate(
  'MDA_POINT_REPORTING_TITLE',
  'MDA Point Reporting'
);
export const SMC_REPORTING_TITLE = translate('SMC_REPORTING_TITLE', 'SMC Reporting');

export const FILTER = translate('FILTER', 'Filter');

export const USER = translate('USER', 'user');

export const MDA_POINT_LOCATION_REPORT_TITLE = translate(
  'MDA_POINT_LOCATION_REPORT_TITLE',
  'MDA Point Location Report'
);

export const MDA_POINT_CHILD_REPORT_TITLE = translate(
  'MDA_POINT_CHILD_REPORT_TITLE',
  'MDA Point Child Report'
);

export const MDA_POINT_SCHOOL_REPORT_TITLE = translate(
  'MDA_POINT_SCHOOL_REPORT_TITLE',
  'MDA Point School Report'
);

export const USER_HAS_NO_VALID_ASSIGNMENTS = translate(
  'USER_HAS_NO_VALID_ASSIGNMENTS',
  'User does not have valid plan assignments'
);

export const NETWORK_ERROR = translate(
  'NETWORK_ERROR',
  'We are having trouble retrieving requested resource'
);

export const ACCESS_DENIED = translate(
  'ACCESS_DENIED',
  'Sorry, access was denied to the requested resource'
);

export const USER_HAS_NO_PLAN_ASSIGNMENTS = translate(
  'USER_HAS_NO_PLAN_ASSIGNMENTS',
  'User does not have any plans assigned'
);
export const NO_ROWS_FOUND = translate('NO_ROWS_FOUND', 'No rows found');

export const AGE_RANGE = translate('AGE_RANGE', 'Age Range');
export const TOTAL_SACS_REGISTERED = translate('TOTAL_SACS_REGISTERED', 'Total SACs Registered');
export const MMA_COVERAGE = translate('MMA_COVERAGE', 'MMA Coverage');
export const SACS_REFUSED = translate('SACS_REFUSED', 'SACs Refused');
export const SACS_SICK = translate('SACS_SICK', 'SACs Sick/Pregnant/Contraindicated');
export const ADR_REPORTED = translate('ADR_REPORTED', 'ADR Reported');
export const ADR_SEVERE = translate('ADR_SEVERE', 'ADR Severe');
export const ALB_TABLETS_DISTRIBUTED = translate(
  'ALB_TABLETS_DISTRIBUTED',
  'Alb Tablets Distributed'
);
export const CHILDS_NAME = translate('CHILDS_NAME', "Child's name");
export const NATIONAL_ID = translate('NATIONAL_ID', 'National ID');
export const ENROLLED_IN_SCHOOL = translate('ENROLLED_IN_SCHOOL', 'Enrolled in school');
export const MMA_DRUGS_ADMINISTRED = translate('MMA_DRUGS_ADMINISTRED', 'MMA drug administered');
export const PZQ_DISTRIBUTED = translate('PZQ_DISTRIBUTED', 'PZQ tablets distributed');

export const MANIFEST_RELEASES = translate('MANIFEST_RELEASES', 'Manifest Releases');
export const RELEASES_LABEL = translate('RELEASES_LABEL', 'Releases');
export const FORM_DRAFT_FILES = translate('FORM_DRAFT_FILES', 'Draft Files');
export const JSON_VALIDATORS = translate('JSON_VALIDATORS', 'JSON Validators');
export const UPLOAD_FORM = translate('UPLOAD_FORM', 'Upload Form');
export const EDIT_FORM = translate('EDIT_FORM', 'Edit Form');
export const MAKE_RELEASE_LABEL = translate('MAKE_RELEASE_LABEL', 'Make Release');
export const FILE_NAME_LABEL = translate('FILE_NAME_LABEL', 'File Name');
export const FILE_VERSION_LABEL = translate('FILE_VERSION_LABEL', 'File Version');
export const IDENTIFIER_LABEL = translate('IDENTIFIER_LABEL', 'Identifier');
export const MODULE_LABEL = translate('MODULE_LABEL', 'Module');
export const EDIT_LABEL = translate('EDIT_LABEL', 'Edit');
export const DOWNLOAD_LABEL = translate('DOWNLOAD_LABEL', 'Download');
export const UPLOAD_EDIT_LABEL = translate('UPLOAD_EDIT_LABEL', 'Upload edit');
export const UPOL0AD_FILE_LABEL = translate('UPOL0AD_FILE_LABEL', 'Upload New File');
export const VIEW_FILES_LABEL = translate('VIEW_FILES_LABEL', 'View Files');
export const APP_ID_LABEL = translate('APP_ID_LABEL', 'App Id');
export const APP_VERSION_LABEL = translate('APP_VERSION_LABEL', 'App Version');
export const RELATED_TO_LABEL = translate('RELATED_TO_LABEL', 'Related to');
export const FILE_UPLOAD_LABEL = translate('FILE_UPLOAD_LABEL', 'Upload files');
export const FORM_REQUIRED_LABEL = translate('FORM_REQUIRED_LABEL', 'Form is required');
export const FORM_NAME_REQUIRED_LABEL = translate(
  'FORM_NAME_REQUIRED_LABEL',
  'Form name is required'
);
export const FIND_RELEASE_LABEL = translate('FIND_RELEASE_LABEL', 'Find Releases');
export const FIND_DRAFT_FILE_LABEL = translate('FIND_DRAFT_FILE_LABEL', 'Find Draft Files');
export const FIND_RELEASE_FILES = translate('FIND_RELEASE_FILES', 'Find Release Files');
export const FIND_VALIDATOR_FILES = translate('FIND_VALIDATOR_FILES', 'Find Validator Files');

export const FILE = translate('FILE', 'File');
export const CSV_FILE = translate('CSV_FILE', 'CSV File');
export const JURISDICTION_ID = translate('JURISDICTION_ID', 'jurisdiction_id');
export const JURISDICTION_NAME = translate('JURISDICTION_NAME', 'jurisdiction_name');
export const INVALID_CSV = translate('INVALID_CSV', 'Invalid CSV');

export const ROW_HEIGHT = translate('ROW_HEIGHT', 'Row Height');

export const ROWS_TO_DISPLAY = translate('ROWS_TO_DISPLAY', 'Rows to display');

export const PAGE = translate('PAGE', 'page');

export const OF = translate('OF', 'of');

export const DEFAULT = translate('DEFAULT', 'default');

export const SHORT = translate('SHORT', 'short');

export const TALL = translate('TALL', 'tall');

export const NO_DATA_FOUND = translate('NO_DATA_FOUND', 'No Data Found');

export const CUSTOMIZE_COLUMNS = translate('CUSTOMIZE_COLUMNS', 'Customize Columns');

export const CUSTOMIZE_COLUMNS_FILTER_MESSAGE = translate(
  'CUSTOMIZE_COLUMNS_FILTER_MESSAGE',
  'Select columns to be displayed'
);

export const COULD_NOT_LOAD_FORM = translate('COULD_NOT_LOAD_FORM', 'Could not load the form.');
export const DID_NOT_SAVE_SUCCESSFULLY = translate(
  'DID_NOT_SAVE_SUCCESSFULLY',
  'Did not save successfully'
);
export const AND = translate('AND', 'and');
export const MORE = translate('MORE', 'more');

export const COULD_NOT_LOAD_PLAN_JURISDICTION_HIERARCHY = translate(
  'COULD_NOT_LOAD_PLAN_JURISDICTION_HIERARCHY',
  'Could not load the plan jurisdiction hierarchy'
);
export const COULD_NOT_LOAD_ASSIGNMENTS = translate(
  'COULD_NOT_LOAD_ASSIGNMENTS',
  'Could not load assignments'
);
export const COULD_NOT_LOAD_TEAMS = translate('COULD_NOT_LOAD_TEAMS', 'Unable to load teams');
export const COULD_NOT_LOAD_PLAN = translate('COULD_NOT_LOAD_PLAN', 'Unable to load plan');
export const COULD_NOT_LOAD_CHILDREN = translate(
  'COULD_NOT_LOAD_CHILDREN',
  'Could not load children'
);
export const COULD_NOT_LOAD_PARENTS = translate('COULD_NOT_LOAD_PARENTS', 'Could not load parents');
export const AN_ERROR_OCURRED = translate(
  'AN_ERROR_OCURRED',
  'An error ocurred. Please try and refresh the page.'
);
export const THE_SPECIFIC_ERROR_IS = translate('THE_SPECIFIC_ERROR_IS', 'The specific error is');
export const FALLBACK_CUSTOM_ERROR_MESSAGE = translate(
  'FALLBACK_CUSTOM_ERROR_MESSAGE',
  `There has been an error. It’s been reported to the site administrators via email and should be fixed shortly. Thanks for your patience.`
);

export const SERVER_SETTINGS = translate('SERVER_SETTINGS', 'Server Settings');
export const SEARCH_LABEL = translate('SEARCH_LABEL', 'Search');
export const SEARCH_SETTINGS_LABEL = translate('SEARCH_SETTINGS_LABEL', 'Search Settings');
export const PAGE_TITLE_LABEL = translate('PAGE_TITLE_LABEL', 'Server Settings');
export const SETTINGS_LABEL = translate('SETTINGS_LABEL', 'Settings');
export const INHERITED_FROM_LABEL = translate('INHERITED_FROM_LABEL', 'Inherited from');
export const SET_TO_YES_LABEL = translate('SET_TO_YES_LABEL', `Set to 'Yes'`);
export const SET_TO_NO_LABEL = translate('SET_TO_NO_LABEL', `Set to 'No'`);
export const INHERIT_SETTING_LABEL = translate('INHERIT_SETTING_LABEL', 'Inherit setting');
export const JURISDICTION_UPLOAD_STEP_1 = translate(
  'JURISDICTION_UPLOAD_STEP_1',
  'Click on the download template CSV button below.'
);
export const JURISDICTION_UPLOAD_STEP_2 = translate(
  'JURISDICTION_UPLOAD_STEP_2',
  'Open the downloaded file and complete the risk and target details on the respective columns.'
);
export const JURISDICTION_UPLOAD_STEP_3 = translate(
  'JURISDICTION_UPLOAD_STEP_3',
  'Save the updated CSV file.'
);
export const JURISDICTION_UPLOAD_STEP_4 = translate(
  'JURISDICTION_UPLOAD_STEP_4',
  'Select the saved file on the upload form.'
);
export const JURISDICTION_UPLOAD_STEP_5 = translate(
  'JURISDICTION_UPLOAD_STEP_5',
  'Click the "Upload File" button to complete the process.'
);
export const DRAFT_PLANS = translate('DRAFT PLANS', 'Draft plans');

export const COULD_NOT_LOAD_JURISDICTION_HIERARCHY = translate(
  'COULD_NOT_LOAD_JURISDICTION_HIERARCHY',
  'Failed to load Jurisdiction hierarchy'
);

export const STRUCTURES_COUNT = translate('STRUCTURES_COUNT', 'Structures Count');

export const STATUS_SETTING = translate('STATUS_SETTING', 'Status setting by...');

export const AUTO_SELECTION = translate('AUTO_SELECTION', 'Auto-selection');
export const EXISTING_SELECTION = translate('EXISTING_SELECTION', 'Existing selection');
export const USER_CHANGE = translate('USER_CHANGE', 'User Change');

export const COULD_NOT_LOAD_JURISDICTION = translate(
  'COULD_NOT_LOAD_JURISDICTION',
  'Could not load jurisdiction'
);
export const JURISDICTION_ASSIGNMENT_SUCCESSFUL = translate(
  'JURISDICTION_ASSIGNMENT_SUCCESSFUL',
  'Jurisdiction(s) assigned to plan successfully'
);

export const SELECTED_JURISDICTIONS = translate('SELECTED_JURISDICTIONS', 'Selected Jurisdictions');
export const GOAL_LABEL = translate('GOAL_LABEL', 'Goal');
export const EXPRESSION_LABEL = translate('EXPRESSION_LABEL', 'Expression');
export const TRIGGERS_LABEL = translate('TRIGGERS_LABEL', 'Triggers');
export const CONDITIONS_LABEL = translate('CONDITIONS_LABEL', 'Conditions');
export const DEFINITION_URI = translate('DEFINITION_URI', 'Definition Uri');

export const SAVE_DRAFT = translate('SAVE_DRAFT', 'save draft');
export const SAVE_AND_ACTIVATE = translate('SAVE_AND_ACTIVATE', 'Save & Activate');

export const CANNOT_ASSIGN_TEAM_LABEL = translate(
  'CANNOT_ASSIGN_TEAM',
  'Cannot assign teams for expired plans'
);

export const NUMBER_OF_STRUCTURES_IN_JURISDICTIONS = translate(
  'NUMBER_OF_STRUCTURES_IN_JURISDICTIONS',
  'NUMBER OF STRUCTURES IN SELECTED JURISDICTIONS'
);
export const JURISDICTIONS_SELECTED = translate(
  'JURISDICTIONS_SELECTED',
  'jurisdiction(s) selected'
);
export const ADJUST_SLIDER_MESSAGE = translate(
  'ADJUST_SLIDER_MESSAGE',
  'Adjust slider to auto-target jurisdictions'
);

export const ERROR_PERMISSION_DENIED = translate(
  'ERROR_PERMISSION_DENIED',
  'This user does not have permissions to access this page'
);

export const AUTO_TARGET_JURISDICTIONS_BY_RISK = translate(
  'AUTO_TARGET_JURISDICTIONS_BY_RISK',
  'Auto target jurisdictions by risk'
);
export const REFINE_SELECTED_JURISDICTIONS = translate(
  'REFINE_SELECTED_JURISDICTIONS',
  'Refine selected jurisdictions'
);

export const CONTINUE_TO_NEXT_STEP = translate('CONTINUE_TO_NEXT_STEP', 'Continue to next step');

export const TIMELINE_SLIDER_STOP1_LABEL = translate('ONE_STR', '1');
export const TIMELINE_SLIDER_STOP2_LABEL = translate('TWO_STR', '2');

export const TARGETED_STATUS = translate('TARGETED_STATUS', 'Target Status');

export const TARGETED = translate('TARGETED', 'Targeted');

export const NOT_TARGETED = translate('NOT_TARGETED', 'Not Targeted');

export const SELECT_JURISDICTION = translate(
  'SELECT_JURISDICTION',
  'Please select at least one jurisdiction'
);
export const DAYS = translate('DAYS', 'days');

export const RESOURCE_ESTIMATE_FOR = translate('RESOURCE_ESTIMATE_FOR', 'Resource Estimate for %s');

export const AT_A_RATE_OF = translate('AT_A_RATE_OF', 'at a rate of');

export const STRUCTURES_PER_TEAM_PER_DAY = translate(
  'STRUCTURES_PER_TEAM_PER_DAY',
  'structures per team per day with'
);

export const NO_JURISDICTION_SELECTIONS_FOUND = translate(
  'NO_JURISDICTION_SELECTIONS_FOUND',
  'There are no descendant jurisdictions that are selected.'
);

export const ERROR_NO_JURISDICTION_METADATA_FOUND = translate(
  'ERROR_NO_JURISDICTION_METADATA_FOUND',
  'No jurisdiction metadata found'
);

export const TOTAL = translate('TOTAL', 'Total');

export const COVERAGE_LABEL = translate('COVERAGE_LABEL', 'Coverage');
export const TARGET_LABEL = translate('TARGET_LABEL', 'Target');
export const POPULATION_LABEL = translate('POPULATION_LABEL', 'Population');
export const RISK_TEXT = translate('RISK_TEXT', 'Risk');
export const STRUCTURE_LABEL = translate('STRUCTURE_LABEL', 'Structures');

export const PLANS_USER_FILTER_NOTIFICATION = translate(
  'PLANS_USER_FILTER_NOTIFICATION',
  'User filter on: Only plans assigned to %s are listed.'
);

export const MOP_UP_REPORTING_TITLE = translate('MOP_UP_REPORTING_TITLE', 'IRS Mop-up Reporting');

export const HEALTH_FACILITY = translate('HEALTH_FACILITY', 'Health Facility');

export const STRUCTURES_ON_GROUND = translate('STRUCTURES_ON_GROUND', 'Structures on Ground');

export const VISITED_SPRAYED = translate('VISITED_SPRAYED', 'Visited Sprayed');

export const STRUCTURES_REMAINING_TO_SPRAY_TO_REACH_90_SE = translate(
  'STRUCTURES_REMAINING_TO_SPRAY_TO_REACH_90_SE',
  'Structures remaining to spray to reach 90% SE'
);

export const TLA_DAYS = translate('TLA_DAYS', 'TLA Days');

export const SPRAY_EFFECTIVENESS = translate('SPRAY_EFFECTIVENESS', 'Spray Effectiveness');

export const FOUND_COVERAGE = translate('FOUND_COVERAGE', 'Found coverage');

export const SPRAY_COVERAGE = translate('SPRAY_COVERAGE', 'Spray coverage');

export const DATE_OF_LAST_VISIT = translate('DATE_OF_LAST_VISIT', 'Date of Last Visit');

export const DATE_OF_LAST_DECISION_FROM = translate(
  'DATE_OF_LAST_DECISION_FROM',
  'Date of last Decision form'
);

export const HEALTH_CENTERS_TO_MOP_UP = translate(
  'HEALTH_CENTERS_TO_MOP_UP',
  'Health Centers to Mop-up'
);

export const SPRAY_AREAS_TO_MOPUP = translate('SPRAY_AREAS_TO_MOPUP', 'Spray Areas to to Mop-up');

export const STRUCTURES_TO_SPRAY_TO_REACH_90 = translate(
  'STRUCTURES_TO_SPRAY_TO_REACH_90',
  'Structures to spray or areas to react 90%'
);

export const TLA_DAYS_AREAS_TO_REACH_90 = translate(
  'TLA_DAYS_AREAS_TO_REACH_90',
  'TLA days needed for areas needed to reach 90%'
);

export const NOT_VISITED = translate('NOT_VISITED', 'Not visited');
export const NOT_ELIGIBLE = translate('NOT_ELIGIBLE', 'Not Eligible');
export const TASK_INCOMPLETE = translate('TASK_INCOMPLETE', 'Incomplete');
export const IN_PROGRESS = translate('IN_PROGRESS', 'In Progress');

export const NO_DECISION_FORM = translate('NO_DECISION_FORM', 'No decision form');
export const RETIRE_PLAN_MESSAGE = translate(
  'RETIRE_PLAN_MESSAGE',
  'To retire this plan, select a reason and proceed'
);
export const COMPLETE_PLAN_MESSAGE = translate(
  'COMPLETE_PLAN_MESSAGE',
  'You are about to complete a plan, click ok to proceed'
);
export const PLAN_CHANGES_HAVE_NOT_BEEN_SAVED = translate(
  'PLAN_CHANGES_HAVE_NOT_BEEN_SAVED',
  'Changes to plan have not been saved'
);

export const INVALID_GEOMETRIES = translate(
  'INVALID_GEOMETRIES',
  'Map failed to load: data has invalid geometries'
);
export const PLAN_NOT_FOUND = translate('PLAN_NOT_FOUND', 'Map failed to load: plan not found');
export const JURISDICTION_NOT_FOUND = translate(
  'JURISDICTION_NOT_FOUND',
  'Map failed to load: Jurisdiction not found'
);

export const INVALID_DATE = translate('INVALID_DATE', 'Invalid Date');
export const PLAN_OR_JURISDICTION_NOT_FOUND = translate(
  'PLAN_OR_JURISDICTION_NOT_FOUND',
  'Plan or Jurisdiction not found'
);

export const SESSION_EXPIRED_TEXT = translate(
  'SESSION_EXPIRED_TEXT',
  'Your session has expired. Please click the link below to login again.'
);
export const RENEW_SESSION_LINK_TEXT = translate('RENEW_SESSION_LINK_TEXT', 'Renew session');
export const SESSION_EXPIRED_ERROR = translate(
  'SESSION_EXPIRED_ERROR',
  'Error: Your session is expired. Please renew session'
);
export const SELECT_OPTION = translate('SELECT_OPTION', 'Select Option');

export const ASSIGNED_WRONG_PLAN = translate('ASSIGNED_WRONG_PLAN', 'Assigned wrong plan details');
export const DUPLICATED_PLAN = translate('DUPLICATED_PLAN', 'Plan is duplicated');
export const CANCELED_PLAN = translate('CANCELED_PLAN', 'Canceled, no longer going to work');
export const ENTERED_WRONG_ADDRESS = translate(
  'ENTERED_WRONG_ADDRESS',
  'Plan has wrong address of patient or source of infection'
);
export const SAME_SUB_VILLAGE = translate(
  'SAME_SUB_VILLAGE',
  'This is patient in the same sub-village and same week'
);
export const ACTIVITY_DONE_BEFORE = translate(
  'ACTIVITY_DONE_BEFORE',
  'Activity was done before the plan was created'
);
export const OTHER_REASON = translate('OTHER_REASON', 'Specify another reason');
export const RETIRE_PLAN_REASON = translate('RETIRE_PLAN_REASON', 'Retire Plan Reason');
export const OTHER_REASON_LABEL = translate('OTHER_REASON_LABEL', 'Other reason');
export const PROCEED = translate('PROCEED', 'Proceed');
export const LOWEST_JURISDICTION = translate(
  'LOWEST_JURISDICTION',
  'This is the lowest jurisdiction'
);
export const NOT_AVAILABLE_LABEL = translate('NOT_AVAILABLE_LABEL', 'Not Available');
