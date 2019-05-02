import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { clone } from 'lodash';
import { CONFIG } from '../../configs/superset';
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

export const supersetAuthZ = async (result: { [key: string]: any }, callback: any) => {
  if (result.status === 200) {
    store.dispatch(authorizeSuperset(true));
    return callback;
  } else {
    store.dispatch(authorizeSuperset(false));
    return false;
  }
};

/** generic async function for fetching from superset */
const supersetFetch = async (
  sliceId: string,
  callback: typeof fetchCallback = fetchCallback,
  middleware: typeof fetchMiddleware = fetchMiddleware
) => {
  const config = clone(CONFIG);
  config.extraPath = sliceId;
  const accessToken = getAccessToken(store.getState());
  if (accessToken) {
    config.token = accessToken;
  }

  const isSupersetAuthorized = isAuthorized(store.getState());

  if (isSupersetAuthorized === true) {
    return superset.api.doFetch(config, middleware).then(callback);
  } else {
    return superset.authZ(config, (result: { [key: string]: any }) =>
      supersetAuthZ(result, superset.api.doFetch(config, middleware).then(callback))
    );
  }
};

export default supersetFetch;
