# Environment Variables

This document describes the environment variables in this code base and how to use them correctly to manuplate different sections.

Below is a list of currently supported environment variables:

- **REACT_APP_ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS**

  - Controls the identifier options displayed when downloading jurisdiction metadata.
  - Options: POPULATION, RISK, COVERAGE, STRUCTURE, OTHER_POPULATION and TARGET
  - Variable is **not required** and if not provided all the options are loaded.

- **REACT_APP_KEYCLOAK_LOGOUT_URL**

  - url to logout from the keycloak server
  - **Required**
  - default: `https://keycloak-stage.smartregister.org/auth/realms/reveal-stage/protocol/openid-connect/logout`

- **REACT_APP_SHOW_TEAM_ASSIGN_ON_OPERATIONAL_AREAS_ONLY**

  - A Boolean that enables and disables team assignment (by not showing team assignment form) for non-operational areas.
  - **Not required**
  - Default value: `false`.

- **REACT_APP_ENABLED_FI_REASONS**

  - Focus investigation reasons to be enabled on plan form.
  - Options: Case Triggered and Routine
  - **Required**

- **REACT_APP_ENABLE_HOME_MANAGE_PLANS_LINK**

  - Enable or disable manage plans home page link.
  - **Not required**
  - Default value: `false`.

- **REACT_APP_ENABLE_HOME_PLANNING_VIEW_LINK**

  - Enable or disable planning view home page link.
  - **Not required**
  - Default value: `false`.

- **REACT_APP_SUPERSET_IRS_DISTRICT_PERFORMANCE_REPORT_SLICE**

  - IRS Performance Reporting districts Superset slice id
  - **Required**

- **REACT_APP_OPENSRP_MAX_PLANS_PER_REQUEST**

- **Optional**
- limit of the number of plans to get using the `plans/getAll` endpoint in a single request
- default: `2000`

- **REACT_APP_SUPERSET_IRS_DATA_COLLECTORS_PERFORMANCE_REPORT_SLICE**

  - IRS Performance Reporting data collectors Superset slice id
  - **Required**

- **REACT_APP_SUPERSET_IRS_SOP_PERFORMANCE_REPORT_SLICE**

  - IRS Performance Reporting spray operators Superset slice id
  - **Required**

- **REACT_APP_SUPERSET_IRS_SOP_BY_DATE_PERFORMANCE_REPORT_SLICE**

  - IRS Performance Reporting spray event date Superset slice id
  - **Required**

- **REACT_APP_ENABLE_DEFAULT_PLAN_USER_FILTER**

  - _optional_; _(boolean)_
  - default: `false`
  - whether to filter plans by the logged in user right of the bat by default

- **REACT_APP_DISPLAYED_PLAN_TYPES**

  - Controls plans displayed on the site.
  - Options: FI, IRS, MDA, MDA-Point, Dynamic-FI, Dynamic-IRS, MDA-Lite and Dynamic-MDA
  - Variable is **not required** and if not provided all the above options are loaded.

- **REACT_APP_PLAN_TYPES_ALLOWED_TO_CREATE**

  - Controls plans which can be created from the create plans form.
  - Options: FI, IRS, MDA, MDA-Point, Dynamic-FI, Dynamic-IRS, MDA-Lite and Dynamic-MDA
  - Variable is **not required** and if not provided all the above options are loaded.

- **REACT_APP_TASK_GENERATION_STATUS**

  - _not required_; _(ENUM<["True", "False", "Disabled", "internal"]>)_
  - no defaults, applies a heuristic to pick the correct value when env isn't configured
  - configures the value to be used for taskGenerationStatus context for dynamicPlans

- **REACT_APP_ENABLE_IRS_MOPUP_REPORTING**

  - **not Required**; _(string)_
  - to activate set the env to `true`, any other value will be interpreted as false
  - enables the monitor IRS mop up reporting page

- **REACT_APP_ASSIGN_TEAMS_PLAN_TYPES_DISPLAYED**

  - Contains plan intervention types displayed on plan assign page
  - Options: FI, IRS, IRS_Lite, MDA, MDA-Point, Dynamic-FI, Dynamic-IRS and Dynamic-MDA
  - Variable is **not required** and if not provided interventions on `REACT_APP_DISPLAYED_PLAN_TYPES` are loaded.

- **REACT_APP_CHECK_SESSION_EXPIRY_STATUS**

  - **not Required**; _(string)_
  - to activate set the env to `true`, any other value will be interpreted as false.
  - default value is false.
  - enables check for session expiry

- **REACT_APP_OPENSRP_GENERATED_TASKS_INTERVENTIONS**

  - Optional parameter of plan intervention types whose tasks should be generated on opensrp
  - Options: FI, IRS, IRS_Lite, MDA, MDA-Point, Dynamic-FI, Dynamic-IRS and Dynamic-MDA

- **REACT_APP_ENABLE_MDA_LITE**

  - **not Required**; _(string)_
  - to activate set the env to `true`, any other value will be interpreted as false
  - enables the monitor MDA Lite reporting page

- **REACT_APP_SUPERSET_MDA_LITE_REPORTING_PLANS_SLICE**

  - MDA-Lite plans Superset slice id
  - **Required**

- **REACT_APP_SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES**

  - MDA-Lite jurisdictions report Superset slice id
  - **Required**

- **REACT_APP_SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_COLUMNS**

  - MDA-Lite jurisdictions report table columns
  - **Required**

- **REACT_APP_SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL**

  - MDA-Lite level were focus areas start
  - **Required**

- **REACT_APP_SHOW_MAP_AT_JURISDICTION_LEVEL**

  - Jurisdiction level on which to show map
  - Default value: 99
  - **Not Required**

- **REACT_APP_SUPERSET_MDA_LITE_REPORTING_CDD_DATA_SLICE**

  - MDA-Lite CDD Superset slice id
  - **Required**

- **REACT_APP_SUPERSET_MDA_LITE_REPORTING_SUPERVISORS_DATA_SLICE**

  - MDA-Lite supervisors Superset slice id
  - **Required**

- **REACT_APP_HIDE_PLAN_FORM_FIELDS_ON_EDIT**

  - **not Required**; _(string)_
  - Plan form fields to be hidden when the plan status is draft, active or completed.
  - Options: caseNum, interventionType, jurisdictions, fiReason, fiStatus, title, triggersAndConditions activityActionDefinitionUri, activityActionDescription, activityActionTitle, activityActionReason activityTimingPeriodStart, activityTimingPeriodEnd, activityGoalPriority, activityGoalValue

- **REACT_APP_CASE_TRIGGERED_DRAFT_EDIT_ADD_ACTIVITIES**

  - **not Required**; _(string)_
  - to activate set the env to `true`, any other value will be interpreted as false
  - enable editing of activities on FI case triggered draft plans.

- **REACT_APP_AUTO_SELECT_FI_CLASSIFICATION**

  - **not Required**; _(string)_
  - to activate set the env to `true`, any other value will be interpreted as false
  - enable FI classification auto selection

- **REACT_APP_PLAN_LIST_SHOW_FI_REASON_COLUMN**

  - **not Required**; _(string)_
  - to activate set the env to `true`, any other value will be interpreted as false
  - show FI reason column on the plans list view instead of intervention type column

- **REACT_APP_ENABLE_STRUCTURE_METADATA_UPLOAD**

  - **not Required**; _(string)_
  - to activate set the env to `true`, any other value will be interpreted as false
  - enables the structure metadata page

- **REACT_APP_SUPERSET_MDA_LITE_REPORTING_INDICATOR_ROWS**

  - **not Required**; _(string)_
  - reporting row indicators, defalut value is `kenya2021`

- **REACT_APP_SUPERSET_MDA_LITE_REPORTING_INDICATOR_STOPS**

  - **not Required**; _(string)_
  - reporting stops indicators, defalut value is `kenya2021`

- **REACT_APP_CLIENTS_LIST_BATCH_SIZE**

  - **Optional**
  - limit of the number of clients record to get from api.
  - default: `200`
