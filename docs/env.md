# Environment Variables

This document describes the environment variables in this code base and how to use them correctly to manuplate different sections.

Below is a list of currently supported environment variables:

- **REACT_APP_ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS**

  - Controls the identifier options displayed when downloading jurisdiction metadata.
  - Options: POPULATION, RISK, COVERAGE, STRUCTURE and TARGET
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

- **REACT_APP_AUTO_SELECT_FI_CLASSIFICATION**

  - **not Required**; _(string)_
  - to activate set the env to `true`, any other value will be interpreted as false
  - enable FI classification auto selection
