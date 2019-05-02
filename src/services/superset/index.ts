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

/** register the superset reducer */
reducerRegistry.register(supersetReducerName, supersetReducer);

/** middleware for fetching from Superset */
export const fetchMiddleware = (res: { [key: string]: any }) => {
  return res;
};

/** callback for fetching from Superset */
export const fetchCallback = (parsedResponse: Array<{ [key: string]: any }>) => {
  return superset.processData(parsedResponse);
};

/** generic async function for fetching from superset */
const supersetFetch = async (
  sliceId: string,
  callback: typeof fetchCallback = fetchCallback,
  middleware: typeof fetchMiddleware = fetchMiddleware
) => {
  const config = clone(CONFIG);
  config.extraPath = sliceId;
  config.token = getAccessToken(store.getState());

  const isSupersetAuthorized = isAuthorized(store.getState());

  if (isSupersetAuthorized === true) {
    return superset.api.fetch(config, middleware).then(callback);
  } else {
    superset.authZ(config, (result: { [key: string]: any }) => {
      if (result.status === 200) {
        store.dispatch(authorizeSuperset(true));
        return superset.api.fetch(config, middleware).then(callback);
      } else {
        store.dispatch(authorizeSuperset(false));
        return false;
      }
    });
  }
};

export default supersetFetch;
