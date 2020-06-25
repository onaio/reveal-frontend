import { Failure, Result } from '@onaio/utils';

/** create a successful Result;
 * @param {T} value - the value to be passed on, well as the resolved value
 * @typeParam T - type of value
 */
export function success<T>(value: T): Result<T> {
  return {
    error: null,
    value,
  };
}

/** creates a failed result
 * @param {Error} - an error; why the returned value did not resolve as expected
 */
export function failure(error: Error): Failure {
  return {
    error,
    value: null,
  };
}
