import { ActionCreator, AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { FlexObject } from '../../helpers/utils';

export const reducerName = 'map';

/** Interface for update admin level action */
interface UpdateAdminLevelAction extends AnyAction {
  index: number;
  type: typeof UPDATE_ADMIN_LEVEL_INDEX;
}

/** interface to describe user state */
interface MapState {
  Admins: FlexObject;
  adminLevelIndex: number;
}

/** immutable map state */
type ImmutableMapState = MapState & SeamlessImmutable.ImmutableObject<MapState>;

/** Initial state */
const initialState: ImmutableMapState = SeamlessImmutable({
  Admins: {},
  adminLevelIndex: 0,
});

export function reducer(state = initialState, action: AnyAction): ImmutableMapState {
  switch (action.type) {
    case UPDATE_ADMIN_LEVEL_INDEX:
      return SeamlessImmutable({
        ...state,
        adminLevelIndex: action.index,
      });
    default:
      return state;
  }
}

// actions
/** update admin level index action type */
export const UPDATE_ADMIN_LEVEL_INDEX = 'reveal/reducer/map/UPDATE_ADMIN_LEVEL_INDEX';

// action creators
/** update admin level index action creator */
export const updateAdminLevelIndex: ActionCreator<UpdateAdminLevelAction> = (index: number) => ({
  index,
  type: UPDATE_ADMIN_LEVEL_INDEX,
});

// selectors
/** get admin level index from map state */
export function getAdminLevelIndex(state: Partial<Store>): number {
  return (state as any)[reducerName].adminLevelIndex;
}
