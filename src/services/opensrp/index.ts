import { IncomingHttpHeaders } from 'http';
import store from '../../store';
import { getAccessToken } from '../../store/selectors';

/** default HTTP headers for OpenSRP service */
export const defaultHeaders: IncomingHttpHeaders = {
  accept: 'application/json',
  authorization: `Token ${getAccessToken(store.getState())}`,
  'content-type': 'application/json',
};
