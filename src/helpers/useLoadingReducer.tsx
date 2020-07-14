import { Dictionary } from '@onaio/utils';
import { useReducer } from 'react';

// action types
export const START_LOAD = 'START_LOAD';
export const END_LOAD = 'END_LOAD';

// unified description of actions
export interface ActionType {
  type: typeof START_LOAD | typeof END_LOAD;
  key: string;
}

/** describes the state of the reducer */
export type State = Dictionary<boolean>;

/** reducer function for useLoadingReducer hook */
export const reducer = (state: State, action: ActionType) => {
  switch (action.type) {
    case START_LOAD:
      return {
        ...state,
        [action.key]: true,
      };
    case END_LOAD:
      return {
        ...state,
        [action.key]: false,
      };
    default:
      return state;
  }
};

/** a useLoadingReducer hook, help manage the loading state of the component
 * across several promises.
 *
 * One alternative to this hook and one that might be more appropriate is to
 * use the promise.all syntax
 *
 * @example
 * const promise1 = Promise.resolve(3);
 * const promise2 = 42;
 * const promise3 = new Promise((resolve, reject) => {
 *   setTimeout(resolve, 100, 'foo');
 * });
 *
 * Promise.all([promise1, promise2, promise3]).then((values) => {
 *   console.log(values);
 * }).catch().finally(() => {
 *    // set loading to false
 *   });
 *
 * however there are a few cases where the above might not work and hence a useCase for this hook
 * , for e.g. when promises are spread across hooks, or where they are nested.
 *
 * @param initialKey - uses this key to create the initial state
 * @param load - the value of initialKey; forms the initial state
 */
export const useLoadingReducer = (initialKey?: string, load: boolean = true) => {
  let initialState: State = {};
  if (initialKey) {
    initialState = {
      [initialKey]: load,
    };
  }
  const [store, dispatch] = useReducer(reducer, initialState);

  const changeLoading = (key: string, loadStatus: boolean) => {
    const type = loadStatus ? START_LOAD : END_LOAD;
    dispatch({
      key,
      type,
    });
    return key;
  };

  /** sets loading to true for loading sequence with the  passed in key
   * @param key - target this load entry
   * @param condition - by default start loading will start the loading sequence to true, this overrides that
   *
   * @return {string} the key
   */
  const startLoading = (key: string, condition: boolean = true) => {
    return changeLoading(key, condition);
  };

  /** closes a loading entry
   * @param key - loading entry to target
   */
  const stopLoading = (key: string) => {
    return changeLoading(key, false);
  };

  const loading = () => {
    const reducingFn = (accumulator: boolean, currentValue: boolean) => accumulator || currentValue;
    return Object.values(store).reduce(reducingFn, false);
  };

  return { startLoading, stopLoading, loading, initialKey };
};
