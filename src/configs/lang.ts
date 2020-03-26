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
export const IRS_REPORTING_TITLE = translate('IRS_REPORTING_TITLE', 'IRS Reporting');
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

export const IRS_PLANS = translate('IRS_PLANS', 'IRS Plans');
export const COUNTRY = translate('COUNTRY', 'Country');
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

export const REACTIVE = translate('REACTIVE', 'Reactive');
export const REACTIVE_INVESTIGATION = translate('REACTIVE_INVESTIGATION', 'Reactive Investigation');
export const REQUIRED = translate('REQUIRED', 'Required');
export const SAVING = translate('SAVING', 'Saving');
export const PLANS = translate('PLANS', 'Manage Plans');
export const PLANNING = translate('PLANNING', 'Planning');
export const MONITOR = translate('MONITOR', 'Monitor');
export const ADMIN = translate('ADMIN', 'Admin');
export const DRAFTS_PARENTHESIS = translate('DRAFTS_PARENTHESIS', '(drafts)');
export const CONFIRM = translate('CONFIRM', 'Confirm');
export const CANCEL = translate('CANCEL', 'Cancel');
export const JURISDICTION = translate('JURISDICTION', 'Jurisdiction');
export const ADMIN_LEVEL = translate('ADMIN_LEVEL', 'Admin Level');
export const DISTRICT = translate('DISTRICT', 'District');
export const CANTON = translate('CANTON', 'Canton');
export const VILLAGE = translate('VILLAGE', 'Village');
export const FI_REASON = translate('FI_REASON', 'FI Reason');
export const FI_STATUS = translate('FI_STATUS', 'FI Status');
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
export const BCC_GOAL_MEASURE = translate('BCC_GOAL_MEASURE', 'Number of BCC Activities Completed');
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
export const IRS_RED_THRESHOLD = translate('RED_THRESHOLD', 'Red');
export const IRS_YELLOW_THRESHOLD = translate('YELLOW_THRESHOLD', 'Yellow');
export const IRS_LIGHT_GREEN_THRESHOLD = translate('LIGHT_GREEN_THRESHOLD', 'Light Green');

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
