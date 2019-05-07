import { ActionCreator, AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { FlexObject } from '../../helpers/utils';

export const reducerName = 'map';

/** Interface for update admin level action */
interface UpdateAdminLevelAction extends AnyAction {
  index: number;
  type: typeof UPDATE_ADMIN_LEVEL_INDEX;
}

interface UpdateActiveIdAction extends AnyAction {
  id: number;
  type: typeof UPDATE_ACTIVE_ID;
}

/** interface to describe user state */
interface MapState {
  Admins: FlexObject;
  adminLevelIndex: number;
  activeId: number | null;
}

/** immutable map state */
type ImmutableMapState = MapState & SeamlessImmutable.ImmutableObject<MapState>;

/** Initial state */
const initialState: ImmutableMapState = SeamlessImmutable({
  Admins: {},
  activeId: null,
  adminLevelIndex: 0,
});

export function reducer(state = initialState, action: AnyAction): ImmutableMapState {
  switch (action.type) {
    case UPDATE_ADMIN_LEVEL_INDEX:
      return {
        ...state,
        adminLevelIndex: action.index,
      };
    case UPDATE_ACTIVE_ID:
      return {
        ...state,
        activeId: action.id,
      };
    default:
      return state;
  }
}

// actions
/** update admin level index action type */
export const UPDATE_ADMIN_LEVEL_INDEX = 'reveal/reducer/map/UPDATE_ADMIN_LEVEL_INDEX';
/** update active Id */
export const UPDATE_ACTIVE_ID = 'reveal/reducer/map/UPDATE_ACTIVE_ID';

// action creators
/** update admin level index action creator */
export const updateAdminLevelIndex: ActionCreator<UpdateAdminLevelAction> = (index: number) => ({
  index,
  type: UPDATE_ADMIN_LEVEL_INDEX,
});
/** update active id */
export const updateActiveId: ActionCreator<UpdateActiveIdAction> = (id: number) => ({
  id,
  type: UPDATE_ACTIVE_ID,
});

// selectors
/** get admin level index from map state */
export function getAdminLevelIndex(state: Partial<Store>) {
  return (state as any)[reducerName].adminLevelIndex;
}
/** get active id from map state */
export function getActiveId(state: Partial<Store>) {
  return (state as any)[reducerName].activeId;
}
