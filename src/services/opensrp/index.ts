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
  [key: string]: string | number | boolean;
}

/** params option type */
type paramsType = URLParams | null;

/** converts URL params object to string
 * @param {URLParams} obj - the object representing URL params
 * @returns {string} URL params as a string
 */
export function getURLParams(obj: URLParams): string {
  return Object.entries(obj)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
}

/** get payload for fetch
 * @param {HTTPMethod} method - the HTTP method
 * @returns the payload
 */
export function getPayload(method: HTTPMethod) {
  return {
    headers: getDefaultHeaders() as HeadersInit,
    method,
  };
}

/** Get URL
 * @param {string} url - the url
 * @param {paramType} params - the url params object
 * @returns {string} the final url
 */
export function getURL(url: string, params: paramsType = null): string {
  let result = url;
  if (params) {
    result = `${result}?${getURLParams(params)}`;
  }
  return result;
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

  /** list method
   * @param {params} params - the url params object
   * @param {HTTPMethod} method - the HTTP method
   * @returns list of objects returned by API
   */
  public async list(params: paramsType = null, method: HTTPMethod = 'GET') {
    const url = getURL(this.generalURL, params);
    const response = await fetch(url, getPayload(method));

    if (!response.ok) {
      throw new Error(`OpenSRPService list failed, HTTP status ${response.status}`);
    }

    return await response.json();
  }

  /** read method
   * @param {params} params - the url params object
   * @param {HTTPMethod} method - the HTTP method
   * @returns the object returned by API
   */
  public async read(id: string | number, params: paramsType = null, method: HTTPMethod = 'GET') {
    const url = getURL(`${this.generalURL}/${id}`, params);
    const response = await fetch(url, getPayload(method));

    if (!response.ok) {
      throw new Error(`OpenSRPService read failed, HTTP status ${response.status}`);
    }

    return await response.json();
  }
}
