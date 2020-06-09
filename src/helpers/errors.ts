import { HTTPError, NetworkError } from '@opensrp/server-service';
import { toast } from 'react-toastify';
import { ACCESS_DENIED, NETWORK_ERROR, USER_HAS_NO_VALID_ASSIGNMENTS } from '../configs/lang';
import { growl } from './utils';

/** union of all ErrorTypes that we are working with */
type ServiceError = HTTPError | Error | NetworkError;

/**
 * Display error message using growl
 * @param error - the error object
 * @param customMessage - custom error message
 */
export const displayError = (error: ServiceError, customMessage: string = '') => {
  /** opensrp error object for plans after filtering plans by a user when the assignments are expired
   * unfortunately putting this in constants does not work; it has a value of undefined during runtime.
   */
  if (error instanceof HTTPError) {
    const isPlansFilterByUserRoute = error.url.includes('rest/plans/user/');
    if (error.statusCode === 403) {
      const msg = customMessage !== '' ? customMessage : ACCESS_DENIED;
      growl(msg, { type: toast.TYPE.ERROR });
      return;
    }
    if (error.statusCode === 500 && isPlansFilterByUserRoute) {
      const msg = customMessage !== '' ? customMessage : USER_HAS_NO_VALID_ASSIGNMENTS;
      growl(msg, { type: toast.TYPE.ERROR });
      return;
    }
  }
  if (error instanceof NetworkError) {
    const msg = customMessage !== '' ? customMessage : NETWORK_ERROR;
    growl(msg, { type: toast.TYPE.ERROR });
    return;
  }
  const message = customMessage !== '' ? customMessage : error.message;
  growl(message, { type: toast.TYPE.ERROR });
};
