import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** the reducer name */
export const reducerName = 'superset';

/** interface for authorize action */
interface AuthorizeSupersetAction extends AnyAction {
  authorized: boolean;
  type: typeof AUTHORIZE;
}

/** Create type for Superset reducer actions */
export type SupersetActionTypes = AuthorizeSupersetAction | AnyAction;

/** interface for superset state */
interface SupersetState {
  authorized: boolean | null;
}

/** immutable session state */
export type ImmutableSupersetState = SupersetState &
  SeamlessImmutable.ImmutableObject<SupersetState>;

/** initial state */
const initialState: ImmutableSupersetState = SeamlessImmutable({
  authorized: null,
});

/** the superset reducer function */
export default function reducer(state = initialState, action: SupersetActionTypes): SupersetState {
  switch (action.type) {
    case AUTHORIZE:
      return state.merge({
        authorized: action.authorized,
      });
    default:
      return state;
  }
}

// actions
/** authorize action type */
export const AUTHORIZE = 'reveal/reducer/superset/AUTHORIZE';

// action creators

/** authorize action creator
 * @param {boolean} authorized - whether superset is authorized or not
 */
export const authorizeSuperset = (authorized: boolean): AuthorizeSupersetAction => ({
  authorized,
  type: AUTHORIZE,
});

// selectors

/** check if superset is authorized
 * @param {Partial<Store>} state - the redux store
 */
export function isAuthorized(state: Partial<Store>): boolean | null {
  return (state as any)[reducerName].authorized;
}
