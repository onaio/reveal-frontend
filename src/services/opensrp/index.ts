import { IncomingHttpHeaders } from 'http';
import store from '../../store';
import { getAccessToken } from '../../store/selectors';

/** get default HTTP headers for OpenSRP service */
export function getDefaultHeaders(
  accept: string = 'application/json',
  authorizationType: string = 'Token',
  contentType: string = 'application/json'
): IncomingHttpHeaders {
  return {
    accept,
    authorization: `${authorizationType} ${getAccessToken(store.getState())}`,
    'content-type': contentType,
  };
}
