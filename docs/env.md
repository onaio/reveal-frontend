# Environment Variables

This document describes the environment variables in this code base and how to use them correctly to manuplate different sections.

Below is a list of currently supported environment variables:

1. **REACT_APP_ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS**

- Controls the identifier options displayed when downloading jurisdiction metadata.
- Options: POPULATION, RISK, COVERAGE and TARGET
- Variable is **not required** and if not provided all the options are loaded.

2. **REACT_APP_KEYCLOAK_LOGOUT_URL**

- url to logout from the keycloak server
- **Required**
- default: `https://keycloak-stage.smartregister.org/auth/realms/reveal-stage/protocol/openid-connect/logout`

3. **REACT_APP_SHOW_TEAM_ASSIGN_ON_OPERATIONAL_AREAS_ONLY**

- A Boolean that enables and disables team assignment (by not showing team assignment form) for non-operational areas.
- **Not required**
- Default value: `false`.

4. **REACT_APP_ENABLED_FI_REASONS**

- Focus investigation reasons to be enabled on plan form.
- Options: Case Triggered and Routine
- **Required**

5. **REACT_APP_ENABLE_HOME_MANAGE_PLANS_LINK**

- Enable or disable manage plans home page link.
- **Not required**
- Default value: `false`.

6. **REACT_APP_ENABLE_HOME_PLANNING_VIEW_LINK**

- Enable or disable planning view home page link.
- **Not required**
- Default value: `false`.

7. **REACT_APP_ENABLE_DEFAULT_PLAN_USER_FILTER**

- _optional_; _(boolean)_
- default: `false`
- whether to filter plans by the logged in user right of the bat by default

8. **REACT_APP_OPENSRP_MAX_PLANS_PER_REQUEST**

- **Optional**
- limit of the number of plans to get using the `plans/getAll` endpoint in a single request
- default: `2000`

9. **REACT_APP_DISPLAYED_PLAN_TYPES**

- Controls plans displayed on the site.
- Options: FI, IRS, MDA, MDA-Point, Dynamic-FI, Dynamic-IRS and Dynamic-MDA
- Variable is **not required** and if not provided all the above options are loaded.

10. **REACT_APP_PLAN_TYPES_ALLOWED_TO_CREATE**

- Controls plans which can be created from the create plans form.
- Options: FI, IRS, MDA, MDA-Point, Dynamic-FI, Dynamic-IRS and Dynamic-MDA
- Variable is **not required** and if not provided all the above options are loaded.
