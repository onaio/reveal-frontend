import { getOnadataUserInfo, getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { SessionState } from '@onaio/session-reducer';
import { uniq } from 'lodash';
import { Column } from 'react-table';
import { ONADATA_OAUTH_STATE, OPENSRP_OAUTH_STATE } from '../configs/env';
import { locationHierarchy, LocationItem } from '../configs/settings';

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
