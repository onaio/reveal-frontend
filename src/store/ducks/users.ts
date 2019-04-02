import { ActionCreator, AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

export const reducerName = 'users';

/** Interface for authenticate action */
interface AuthenticateAction extends AnyAction {
  authenticated: boolean;
  type: typeof AUTHENTICATE;
}

/** interface to describe user state */
interface UserState {
  authenticated: boolean;
}

/** immutable user state */
type ImmutableUserState = UserState & SeamlessImmutable.ImmutableObject<UserState>;

/** Initial state for users */
const initialState: ImmutableUserState = SeamlessImmutable({
  authenticated: false,
});

export default function reducer(state = initialState, action: AnyAction): ImmutableUserState {
  switch (action.type) {
    case AUTHENTICATE:
      return state.merge({
        authenticated: action.authenticated,
      });
    default:
      return state;
  }
}

// actions
export const AUTHENTICATE = 'reveal/reducer/AUTHENTICATE';

// action creators
export const authenticateUser: ActionCreator<AuthenticateAction> = (authenticated: boolean) => ({
  authenticated,
  type: AUTHENTICATE,
});

// selectors
export function isAuthenticated(state: Partial<Store>) {
  return (state as any)[reducerName].authenticated;
}
