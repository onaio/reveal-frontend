import { IncomingHttpHeaders } from 'http';
import { OPENSRP_API_BASE_URL } from '../../configs/env';
import store from '../../store';
import { getAccessToken } from '../../store/selectors';

/** allowed http methods */
type HTTPMethod = 'GET' | 'POST' | 'PUT';

/** get default HTTP headers for OpenSRP service */
export function getDefaultHeaders(
  accept: string = 'application/json',
  authorizationType: string = 'Bearer',
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

/** The OpenSRP service class
 *
 * Sample usage:
 * -------------
 * const service = new OpenSRPService('the-endpoint');
 *
 * **To list all objects**: service.list()
 *
 * **To get one object**: service.read('the-object-identifier')
 *
 * **To create a new object**: service.create(theObject)
 *
 * **To update an object**: service.update(theObject)
 */
export class OpenSRPService {
  public baseURL: string;
  public endpoint: string;
  public generalURL: string;

  constructor(endpoint: string, baseURL: string = OPENSRP_API_BASE_URL) {
    this.endpoint = endpoint;
    this.baseURL = baseURL;
    this.generalURL = `${this.baseURL}${this.endpoint}`;
  }

  /** create method
   * Send a POST request to the general endpoint containing the new object data
   * Successful requests will result in a HTTP status 201 response with no body
   * @param {T} data - the data to be POSTed
   * @param {params} params - the url params object
   * @param {HTTPMethod} method - the HTTP method
   * @returns the object returned by API
   */
  public async create<T>(data: T, params: paramsType = null, method: HTTPMethod = 'POST') {
    const url = getURL(this.generalURL, params);
    const payload = {
      ...getPayload(method),
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      body: JSON.stringify(data),
    };
    const response = await fetch(url, payload);

    if (!response.ok || response.status !== 201) {
      throw new Error(
        `OpenSRPService create on ${this.endpoint} failed, HTTP status ${response.status}`
      );
    }

    return {};
  }

  /** read method
   * Send a GET request to the url for the specific object
   * @param {string|number} id - the identifier of the object
   * @param {params} params - the url params object
   * @param {HTTPMethod} method - the HTTP method
   * @returns the object returned by API
   */
  public async read(id: string | number, params: paramsType = null, method: HTTPMethod = 'GET') {
    const url = getURL(`${this.generalURL}/${id}`, params);
    const response = await fetch(url, getPayload(method));

    if (!response.ok) {
      throw new Error(
        `OpenSRPService read on ${this.endpoint} failed, HTTP status ${response.status}`
      );
    }

    return await response.json();
  }

  /** update method
   * Simply send the updated object as PUT request to the general endpoint URL
   * Successful requests will result in a HTTP status 200/201 response with no body
   * @param {T} data - the data to be POSTed
   * @param {params} params - the url params object
   * @param {HTTPMethod} method - the HTTP method
   * @returns the object returned by API
   */
  public async update<T>(data: T, params: paramsType = null, method: HTTPMethod = 'PUT') {
    const url = getURL(this.generalURL, params);
    const payload = {
      ...getPayload(method),
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      body: JSON.stringify(data),
    };
    const response = await fetch(url, payload);

    if (!response.ok) {
      throw new Error(
        `OpenSRPService update on ${this.endpoint} failed, HTTP status ${response.status}`
      );
    }

    return {};
  }

  /** list method
   * Send a GET request to the general API endpoint
   * @param {params} params - the url params object
   * @param {HTTPMethod} method - the HTTP method
   * @returns list of objects returned by API
   */
  public async list(params: paramsType = null, method: HTTPMethod = 'GET') {
    const url = getURL(this.generalURL, params);
    const response = await fetch(url, getPayload(method));

    if (!response.ok) {
      throw new Error(
        `OpenSRPService list on ${this.endpoint} failed, HTTP status ${response.status}`
      );
    }

    return await response.json();
  }
}
