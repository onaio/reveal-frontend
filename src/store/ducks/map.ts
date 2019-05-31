import { ActionCreator, AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { FlexObject } from '../../helpers/utils';

export const reducerName = 'map';

/** Interface for update admin level action */
interface UpdateAdminLevelAction extends AnyAction {
  index: number;
  type: typeof UPDATE_ADMIN_LEVEL_INDEX;
}

/** create type for map reducer actions */
export type MapActionTypes = UpdateAdminLevelAction | AnyAction;

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

/** the map reducer function */
export function reducer(state = initialState, action: MapActionTypes): ImmutableMapState {
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
/** update admin level index action creator
 * @param {number} index - Admin level index
 *
 * @return {UpdateAdminLevelAction} action object
 */
export const updateAdminLevelIndex: ActionCreator<UpdateAdminLevelAction> = (
  index: number
): UpdateAdminLevelAction => ({
  index,
  type: UPDATE_ADMIN_LEVEL_INDEX,
});

// selectors
/** get admin level index from map state
 * @param {Partial<Store>} state - the redux store
 *
 * @return {number}
 */
export function getAdminLevelIndex(state: Partial<Store>): number {
  return (state as any)[reducerName].adminLevelIndex;
}
