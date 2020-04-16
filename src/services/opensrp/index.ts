import { IncomingHttpHeaders } from 'http';
import { OPENSRP_API_BASE_URL } from '../../configs/env';
import store from '../../store';
import { getAccessToken } from '../../store/selectors';

/** allowed http methods */
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** get default HTTP headers for OpenSRP service */
export function getDefaultHeaders(
  accept: string = 'application/json',
  authorizationType: string = 'Bearer',
  contentType: string = 'application/json;charset=UTF-8'
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
export function getURLParams(obj: URLParams | {}): string {
  return Object.entries(obj)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
}

/** converts filter params object to string
 * @param {URLParams} obj - the object representing filter params
 * @returns {string} filter params as a string
 */
export function getFilterParams(obj: URLParams | {}): string {
  return Object.entries(obj)
    .map(([key, val]) => `${key}:${val}`)
    .join(',');
}

/** get payload for fetch
 * @param {HTTPMethod} method - the HTTP method
 * @param {AbortSignal} signal - used to communicate with/abort a DOM request.
 * @returns the payload
 */
export function getPayload(method: HTTPMethod, signal: AbortSignal | null) {
  const applySignal = signal ? { signal } : {};
  return {
    headers: getDefaultHeaders() as HeadersInit,
    method,
    ...applySignal,
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
  public signal: AbortSignal | null;

  constructor(
    endpoint: string,
    signal: AbortSignal | null = null,
    baseURL: string = OPENSRP_API_BASE_URL
  ) {
    this.endpoint = endpoint;
    this.baseURL = baseURL;
    this.generalURL = `${this.baseURL}${this.endpoint}`;
    this.signal = signal;
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
      ...getPayload(method, this.signal),
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
    const response = await fetch(url, getPayload(method, this.signal));

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
      ...getPayload(method, this.signal),
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
    const response = await fetch(url, getPayload(method, this.signal));

    if (!response.ok) {
      throw new Error(
        `OpenSRPService list on ${this.endpoint} failed, HTTP status ${response.status}`
      );
    }

    return await response.json();
  }

  /** delete method
   * Send a DELETE request to the general endpoint
   * Successful requests will result in a HTTP status 204
   * @param {params} params - the url params object
   * @param {HTTPMethod} method - the HTTP method
   * @returns the object returned by API
   */
  public async delete(params: paramsType = null, method: HTTPMethod = 'DELETE') {
    const url = getURL(this.generalURL, params);
    const response = await fetch(url, getPayload(method, this.signal));

    if (response.ok || response.status === 204 || response.status === 200) {
      return {};
    } else {
      throw new Error(
        `OpenSRPService delete on ${this.endpoint} failed, HTTP status ${response.status}`
      );
    }
  }
}
