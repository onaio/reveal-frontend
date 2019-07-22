import { IncomingHttpHeaders } from 'http';
import { OPENSRP_API_BASE_URL } from '../../configs/env';
import store from '../../store';
import { getAccessToken } from '../../store/selectors';

/** allowed http methods */
type HTTPMethod = 'GET' | 'POST';

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

/** interface to describe URL params object */
export interface URLParams {
  [key: string]: string | number;
}

/** converts URL params object to string
 * @param {URLParams} obj - the object representing URL params
 * @returns {string} URL params as a string
 */
export function getURLParams(obj: URLParams): string {
  return Object.entries(obj)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
}

/** The OpenSRP service class */
export class OpenSRPService {
  public baseURL: string;
  public endpoint: string;
  public generalURL: string;

  constructor(endpoint: string, baseURL: string = OPENSRP_API_BASE_URL) {
    this.endpoint = endpoint;
    this.baseURL = baseURL;
    this.generalURL = `${this.baseURL}${this.endpoint}`;
  }

  public async list(method: HTTPMethod = 'GET') {
    const url = this.generalURL;
    const response = await fetch(url, {
      headers: getDefaultHeaders() as HeadersInit,
      method,
    });

    if (!response.ok) {
      throw new Error(`OpenSRPService list failed, HTTP status ${response.status}`);
    }

    return await response.json();
  }

  public async read(id: string | number, method: HTTPMethod = 'GET') {
    const url = `${this.generalURL}/${id}`;
    const response = await fetch(url, {
      headers: getDefaultHeaders() as HeadersInit,
      method,
    });

    if (!response.ok) {
      throw new Error(`OpenSRPService read failed, HTTP status ${response.status}`);
    }

    return await response.json();
  }
}
