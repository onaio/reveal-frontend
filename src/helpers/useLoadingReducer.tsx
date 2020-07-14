import { Dictionary } from '@onaio/utils';
import { useReducer } from 'react';
import uuid from 'uuid/v1';

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
 */
export const useLoadingReducer = () => {
  const [store, dispatch] = useReducer(reducer, {});

  const startLoading = (anId?: string) => {
    const key = anId ? anId : uuid();
    dispatch({
      key,
      type: START_LOAD,
    });
    return key;
  };

  const stopLoading = (key: string) => {
    dispatch({
      key,
      type: END_LOAD,
    });
    return;
  };

  const loading = () => {
    const reducingFn = (accumulator: boolean, currentValue: boolean) => accumulator || currentValue;
    return Object.values(store).reduce(reducingFn, false);
  };

  return { startLoading, stopLoading, loading };
};
