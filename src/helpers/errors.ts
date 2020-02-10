import { toast } from 'react-toastify';
import { growl } from './utils';

/**
 * Display error message using growl
 * @param error - the error object
 * @param customMessage - custom error message
 */
export const displayError = (error: Error, customMessage: string = '') => {
  const message = customMessage !== '' ? customMessage : error.message;
  growl(message, { type: toast.TYPE.ERROR });
};
