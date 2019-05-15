import reducerRegistry from '@onaio/redux-reducer-registry';
import superset, { SupersetConfig } from '@onaio/superset-connector';
import { OPENSRP_OAUTH_STATE, SUPERSET_API_BASE, SUPERSET_API_ENDPOINT } from '../../configs/env';
import store from '../../store';
import supersetReducer, {
  authorizeSuperset,
  isAuthorized,
  reducerName as supersetReducerName,
} from '../../store/ducks/superset';
import { getAccessToken } from '../../store/selectors';

// /** register the superset reducer */
reducerRegistry.register(supersetReducerName, supersetReducer);

/** middleware for fetching from Superset */
export const fetchMiddleware = (res: { [key: string]: any }) => {
  return res;
};

/** callback for fetching from Superset */
export const fetchCallback = (parsedResponse: Array<{ [key: string]: any }>) => {
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
  callback: typeof fetchCallback = fetchCallback,
  middleware: typeof fetchMiddleware = fetchMiddleware
) => {
  const config: SupersetConfig = {
    base: SUPERSET_API_BASE,
    endpoint: SUPERSET_API_ENDPOINT,
    extraPath: sliceId,
    provider: OPENSRP_OAUTH_STATE,
  };

  const accessToken = getAccessToken(store.getState());
  if (accessToken) {
    config.token = accessToken;
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
