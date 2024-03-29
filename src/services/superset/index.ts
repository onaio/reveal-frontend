import reducerRegistry from '@onaio/redux-reducer-registry';
import { getOauthProviderState } from '@onaio/session-reducer';
import superset, { SupersetConnectorConfig } from '@onaio/superset-connector';
import { Dictionary } from '@onaio/utils';
import {
  OPENSRP_OAUTH_STATE,
  SUPERSET_API_BASE,
  SUPERSET_API_ENDPOINT,
  SUPERSET_OAUTH_STATE,
} from '../../configs/env';
import { ERROR_PERMISSION_DENIED } from '../../configs/lang';
import { SUPERSET_ACCESS_DENIED_MESSAGE } from '../../constants';
import { displayError } from '../../helpers/errors';
import { getAcessTokenOrRedirect } from '../../helpers/utils';
import store from '../../store';
import supersetReducer, {
  authorizeSuperset,
  isAuthorized,
  reducerName as supersetReducerName,
} from '../../store/ducks/superset';

// /** register the superset reducer */
reducerRegistry.register(supersetReducerName, supersetReducer);

/** middleware for fetching from Superset */
export const fetchMiddleware = (res: { [key: string]: any }) => {
  const { message } = res;

  if (message === SUPERSET_ACCESS_DENIED_MESSAGE) {
    displayError(new Error(ERROR_PERMISSION_DENIED));
  }
  return res;
};

/** callback for fetching from Superset */
export const fetchCallback = (parsedResponse: { [key: string]: any }) => {
  if (parsedResponse.rowcount === 0) {
    return [];
  }
  const sliceData = superset.processData(parsedResponse);
  return sliceData;
};

/** this function completes the authZ process */
export const completeAuthZ = async (result: { [key: string]: any }) => {
  if (result.status === 200) {
    store.dispatch(authorizeSuperset(true));
  } else {
    store.dispatch(authorizeSuperset(false));
  }
};

/** generic async function for fetching from superset */
const supersetFetch = async (
  sliceId: string,
  params: Dictionary | null = null,
  callback: typeof fetchCallback = fetchCallback,
  middleware: typeof fetchMiddleware = fetchMiddleware
) => {
  const config: SupersetConnectorConfig = {
    base: SUPERSET_API_BASE,
    endpoint: SUPERSET_API_ENDPOINT,
    extraPath: sliceId,
    /** the provider should be the name of the provider
     * to enable the use of multiple providers, we store the provider name in the
     * `state` parameter so that we can use it here
     */
    provider:
      SUPERSET_OAUTH_STATE || getOauthProviderState(store.getState()) || OPENSRP_OAUTH_STATE,
    token: '',
  };

  const accessToken = await getAcessTokenOrRedirect();
  if (accessToken) {
    config.token = accessToken;
  }

  if (params) {
    config.params = `form_data=${JSON.stringify(params)}`;
  }

  const isSupersetAuthorized = isAuthorized(store.getState());

  if (isSupersetAuthorized === true) {
    return superset.api.doFetch(config, middleware).then(callback);
  } else {
    return superset.authZ(config, (result: { [key: string]: any }) => {
      return completeAuthZ(result)
        .then(() => {
          const isSupersetAuthorizedYet = isAuthorized(store.getState());
          if (isSupersetAuthorizedYet === true) {
            return superset.api.doFetch(config, middleware).then(callback);
          }
        })
        .catch(() => {
          return false;
        });
    });
  }
};

export default supersetFetch;
