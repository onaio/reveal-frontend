import { combine } from '@onaio/redux-reducer-registry';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore, Reducer } from 'redux';
import thunk from 'redux-thunk';
import users, { reducerName as usersReducer } from './ducks/users';

/** Add redux devtools to Window */
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

/** Declare history variable */
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

  /** Add redux devtools to enhancers */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  /** Create the store */
  return createStore(reducer, composeEnhancers(applyMiddleware(thunk, routerMiddleware(history))));
}

/** Router reducer */
const connectReducer = connectRouter(history);

/** Initial reducers in the reducer registry */
const defaultReducers: Registry = {
  router: connectReducer as any /** Dirty hack because connectRouter LocationChangeAction does not extend Redux.AnyAction */,
};

/** Add users reducer to registry */
defaultReducers[usersReducer] = users;

/** The initial store for the reveal web app */
const store = getStore(defaultReducers);

/** Set listener to add reducers to store when registered */
reducerRegistry.setChangeListener(reducers => {
  store.replaceReducer(combine(reducers));
});

export default store;
