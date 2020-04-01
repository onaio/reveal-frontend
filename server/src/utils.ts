import ClientOAuth2 from 'client-oauth2';
import requestPromise from 'request-promise';

/** cookie jar for all requests done by requests and request-promise */
export const cookieJar = requestPromise.jar();

/** function to override client-oauth's  default request function
 * @param {string} method - http verb
 * @param {string} url - the url | uri
 * @param {string} body - the stringified body
 * @param {{ [key: string]: string | string[] }} headers - the headers
 */
export const clientOauthRequest: ClientOAuth2.Request = (method, url, body, headers) => {
  const requestOptions = {
    body,
    headers,
    jar: cookieJar,
    method,
    resolveWithFullResponse: true,
    uri: url,
  };
  return requestPromise(requestOptions).then(res => {
    return {
      body: res.body,
      status: res.statusCode,
    };
  });
};
