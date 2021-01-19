import { getAccessToken } from '@onaio/session-reducer';
import { Dictionary } from '@onaio/utils';
import { OpenSRPService as OpenSRPServiceWeb } from '@opensrp/server-service';
import { IncomingHttpHeaders } from 'http';
import { OPENSRP_API_BASE_URL } from '../../configs/env';
import { getAcessTokenOrRedirect } from '../../helpers/utils';
import store from '../../store';

/** allowed http methods */
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** get default HTTP headers for OpenSRP service */
export function getDefaultHeaders(
  accessToken: string | null = getAccessToken(store.getState()),
  accept: string = 'application/json',
  authorizationType: string = 'Bearer',
  contentType: string = 'application/json;charset=UTF-8'
): IncomingHttpHeaders {
  return {
    accept,
    authorization: `${authorizationType} ${accessToken}`,
    'content-type': contentType,
  };
}

/** interface to describe URL params object */
export interface URLParams {
  [key: string]: string | number | boolean;
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
 * @param {AbortSignal} signal - signal object that allows you to communicate with a DOM request
 * @param {string} accessToken - the access token
 * @param {HTTPMethod} method - the HTTP method
 * @returns the payload
 */

export function newGetPayloadOptions<T extends object = Dictionary>(
  _: AbortSignal,
  accessToken: string,
  method: HTTPMethod,
  data?: T
) {
  return {
    headers: getDefaultHeaders(accessToken) as HeadersInit,
    method,
    ...(data ? { body: JSON.stringify(data) } : {}),
  };
}

/** get payload for fetch
 * @param {AbortSignal} signal - signal object that allows you to communicate with a DOM request
 * @param {HTTPMethod} method - the HTTP method
 * @returns the payload
 */
export function getPayloadOptions(_: AbortSignal, method: HTTPMethod) {
  return {
    headers: getDefaultHeaders() as HeadersInit,
    method,
  };
}

/** The OpenSRP service class
 * Extends class OpenSRPService from OpenSRPService web
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
export class OpenSRPService extends OpenSRPServiceWeb {
  constructor(
    endpoint: string,
    baseURL: string = OPENSRP_API_BASE_URL,
    accessTokenCallBack: typeof getAcessTokenOrRedirect = getAcessTokenOrRedirect,
    getPayload: typeof newGetPayloadOptions = newGetPayloadOptions
  ) {
    super(accessTokenCallBack, baseURL, endpoint, getPayload);
  }

  public async readFile(
    id?: string | number,
    params: URLParams | null = null,
    method: HTTPMethod = 'GET'
  ): Promise<{}> {
    const url = OpenSRPService.getURL(`${this.generalURL}/${id}`, params);
    const accessToken = await OpenSRPService.processAcessToken(this.accessTokenOrCallBack);
    const response = await fetch(url, this.getOptions(this.signal, accessToken, method));

    if (!response.ok) {
      throw new Error(
        `OpenSRPService read on ${this.endpoint} failed, HTTP status ${response.status}`
      );
    }
    return await response.blob();
  }
}
