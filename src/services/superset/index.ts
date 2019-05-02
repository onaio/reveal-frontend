import superset from '@onaio/superset-connector';
import { clone } from 'lodash';
import { CONFIG } from '../../configs/superset';
import store from '../../store';
import { getApiToken } from '../../store/selectors';

/** middleware for fetching from Superset */
export const fetchMiddleware = (res: { [key: string]: any }) => {
  return res;
};

/** callback for fetching from Superset */
export const fetchCallback = (parsedResponse: Array<{ [key: string]: any }>) => {
  const sliceData = superset.processData(parsedResponse);
};

/** generic async function for fetching from superset */
const supersetFetch = async (
  sliceId: string,
  callback: typeof fetchCallback = fetchCallback,
  middleware: typeof fetchMiddleware = fetchMiddleware
) => {
  const config = clone(CONFIG);
  config.extraPath = sliceId;
  config.token = getApiToken(store.getState());
  superset.api.fetch(config, middleware).then(callback);
};

export default supersetFetch;
