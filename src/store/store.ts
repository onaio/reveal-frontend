import { combine } from '@onaio/redux-reducer-registry';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { applyMiddleware, createStore, Reducer } from 'redux';
import thunk from 'redux-thunk';
import users, { reducerName as usersReducer } from './ducks/users';

export const history = createBrowserHistory();

/** Declare type for reducer Registry */
export interface Registry {
  [key: string]: Reducer;
}

/** Function to create the store */
export function getStore(reducers: Registry) {
  /** Register each of the initial reducers */
  Object.keys(reducers).forEach(reducerName => {
    reducerRegistry.register(reducerName, reducers[reducerName]);
  });
  /** Combine reducers */
  const reducer = combine(reducerRegistry.getReducers());
  /** Create the store */
  return createStore(
    reducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk, routerMiddleware(history))
  );
}

/** Router reducer */
const connectReducer = connectRouter(history);
/** Initial reducers in the reducer registry */
const defaultReducers: Registry = {
  router: connectReducer as any /** Dirty hack because connectRouter LocationChangeAction does not extend Redux.AnyAction */,
};
// /** Add users reducer to registry */
defaultReducers[usersReducer] = users;

/** The initial store for the reveal web app */
const store = getStore(defaultReducers);

/** Set listener to add reducers to store when registered */
reducerRegistry.setChangeListener(reducers => {
  store.replaceReducer(combine(reducers));
});

export default store;
