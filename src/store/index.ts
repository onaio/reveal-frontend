import { connectReducer, getConnectedStore } from '@onaio/connected-reducer-registry';
import reducerRegistry, { combine, Registry } from '@onaio/redux-reducer-registry';
import users, { reducerName as usersReducer } from './ducks/users';

/** Initial reducers in the reducer registry */
const defaultReducers: Registry = {
  router: connectReducer as any /** Dirty hack because connectRouter LocationChangeAction does not extend Redux.AnyAction */,
};

/** Add users reducer to registry */
defaultReducers[usersReducer] = users;

/** The initial store for the reveal web app */
const store = getConnectedStore(defaultReducers);

/** Set listener to add reducers to store when registered */
reducerRegistry.setChangeListener(reducers => {
  store.replaceReducer(combine(reducers));
});

export default store;
