import { connectReducer, getConnectedStore } from '@onaio/connected-reducer-registry';
import reducerRegistry, { combine, Registry } from '@onaio/redux-reducer-registry';
import session, { reducerName as sessionReducer } from '@onaio/session-reducer';

/** Initial reducers in the reducer registry */
const defaultReducers: Registry = {
  router: connectReducer as any /** Dirty hack because connectRouter LocationChangeAction does not extend Redux.AnyAction */,
};

/** Add users reducer to registry */
defaultReducers[sessionReducer] = session;

/** The initial store for the reveal web app */
const store = getConnectedStore(defaultReducers);

/** Set listener to add reducers to store when registered */
reducerRegistry.setChangeListener(reducers => {
  store.replaceReducer(combine(reducers));
});

export default store;
