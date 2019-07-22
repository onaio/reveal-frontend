import { IncomingHttpHeaders } from 'http';
import store from '../../store';
import { getAccessToken } from '../../store/selectors';

/** get default HTTP headers for OpenSRP service */
export function getDefaultHeaders(): IncomingHttpHeaders {
  return {
    accept: 'application/json',
    authorization: `Token ${getAccessToken(store.getState())}`,
    'content-type': 'application/json',
  };
}
