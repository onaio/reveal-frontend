import { gateKeeperReducerName } from '@onaio/gatekeeper';
import { reducerName as sessionReducerName } from '@onaio/session-reducer';
import { Store } from 'redux';

/** get API Token from the Redux store
 * @param {Partial<Store>} state - the redux store
 */
export function getApiToken(state: Partial<Store>): string {
  const extraData = (state as any)[sessionReducerName].extraData;
  return extraData.api_token || '';
}

/** get Access Token from the Redux store
 * @param {Partial<Store>} state - the redux store
 */
export function getAccessToken(state: Partial<Store>): string {
  return (state as any)[gateKeeperReducerName].accessToken;
}
