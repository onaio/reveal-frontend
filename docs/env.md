# Environment Variables

This document describes the environment variables in this code base and how to use them correctly to manuplate different sections.

Below is a list of currently supported environment variables:

- **REACT_APP_ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS**

  - Controls the identifier options displayed when downloading jurisdiction metadata.
  - Options: POPULATION, RISK, COVERAGE and TARGET
  - Variable is **not required** and if not provided all the options are loaded.

- **REACT_APP_KEYCLOAK_LOGOUT_URL**

  - url to logout from the keycloak server
  - **Required**
  - default: `https://keycloak-stage.smartregister.org/auth/realms/reveal-stage/protocol/openid-connect/logout`

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

- **REACT_APP_ENABLE_DEFAULT_PLAN_USER_FILTER**

  - _optional_; _(boolean)_
  - default: `false`
  - whether to filter plans by the logged in user right of the bat by default
