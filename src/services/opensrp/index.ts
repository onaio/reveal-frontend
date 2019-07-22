import { IncomingHttpHeaders } from 'http';
import { OPENSRP_API_BASE_URL } from '../../configs/env';
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

export class OpenSRPService {
  public baseURL: string;
  public endpoint: string;
  public generalURL: string;

  constructor(endpoint: string, baseURL: string = OPENSRP_API_BASE_URL) {
    this.endpoint = endpoint;
    this.baseURL = baseURL;
    this.generalURL = `${this.baseURL}${this.endpoint}`;
  }
}
