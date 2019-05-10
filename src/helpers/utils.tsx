import { getOnadataUserInfo, getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { SessionState } from '@onaio/session-reducer';
import { uniq } from 'lodash';
import { Column } from 'react-table';
import { ONADATA_OAUTH_STATE, OPENSRP_OAUTH_STATE } from '../configs/env';
import { locationHierarchy, LocationItem } from '../configs/settings';
import { Plan } from '../store/ducks/plans';

/** Interface for an object that is allowed to have any property */
export interface FlexObject {
  [key: string]: any;
}

/** Route params interface */
export interface RouteParams {
  id?: string;
}

/** Returns a number as a decimal e.g. 0.18 becomes 18% */
export function percentage(num: number, decimalPoints: number = 0) {
  return `${(num * 100).toFixed(decimalPoints)}%`;
}

/** Gets react table columns from the location hierarchy in configs */
export function getLocationColumns(
  locations: LocationItem[] = locationHierarchy,
  padHeader: boolean = false
): Column[] {
  // sort locations using the level field and then remove duplicates
  const locationSet = uniq(locations.sort((a, b) => (a.level > b.level ? 1 : -1)));

  if (padHeader === true) {
    return locationSet.map(el => {
      return {
        Header: el.name,
        columns: [
          {
            Header: '',
            accessor: el.identifier,
          },
        ],
      };
    });
  }

  return locationSet.map(el => {
    return {
      Header: el.name,
      accessor: el.identifier,
    };
  });
}

/** Custom function to get oAuth user info depending on the oAuth2 provider
 * It compares the value of the `state` param in the oAuth2 provider config
 * to the one received from the oAuth2 provider in order to return the correct
 * user info getter function
 * @param {{[key: string]: any }} apiResponse - the API response object
 */
export function oAuthUserInfoGetter(apiResponse: { [key: string]: any }): SessionState | void {
  if (Object.keys(apiResponse).includes('oAuth2Data')) {
    switch (apiResponse.oAuth2Data.state) {
      case OPENSRP_OAUTH_STATE:
        return getOpenSRPUserInfo(apiResponse);
      case ONADATA_OAUTH_STATE:
        return getOnadataUserInfo(apiResponse);
    }
  }
}

/** utility method to extract plan from superset response object */
export function extractPlan(plan: Plan) {
  const result: { [key: string]: any } = {
    canton: null,
    caseClassification: null,
    caseNotificationDate: null,
    district: null,
    focusArea: plan.jurisdiction_name,
    id: plan.plan_id,
    parent: plan.jurisdiction_parent_id,
    province: null,
    reason: plan.plan_fi_reason,
    status: plan.plan_fi_status,
    village: null,
  };

  let locationNames: string[];

  if (typeof plan.jurisdiction_name_path === 'string') {
    locationNames = JSON.parse(plan.jurisdiction_name_path);
  } else {
    locationNames = plan.jurisdiction_name_path;
  }

  locationNames.reverse();

  for (let i = 0; i < 4; i++) {
    const locationName = locationNames[i];
    if (locationName) {
      if (i === 99) {
        result.village = locationNames[i];
      }
      if (i === 0) {
        result.canton = locationNames[i];
      }
      if (i === 1) {
        result.district = locationNames[i];
      }
      if (i === 3) {
        result.province = locationNames[i];
      }
    }
  }

  return result;
}
