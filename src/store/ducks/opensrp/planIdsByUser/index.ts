import { Dictionary } from '@onaio/utils';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';
import { PlanDefinition } from '../../../../configs/settings';

/** the reducer name */
export const reducerName = 'planIdsByUser';

// actions

/** PLANS_BY_USER_FETCHED action type */
export const PLANS_BY_USER_FETCHED = 'reveal/reducer/opensrp/PlanDefinition/PLANS_BY_USER_FETCHED';

/** REMOVE_PLANS_BY_USER action type */
export const REMOVE_PLANS_BY_USER = 'reveal/reducer/opensrp/PlanDefinition/REMOVE_PLANS_BY_USER';

/** interface for fetch PlansByUserNames action */
export interface FetchPlansByUserAction extends AnyAction {
  planIdsByUserName: { [key: string]: string[] };
  type: typeof PLANS_BY_USER_FETCHED;
}

/** interface for removing PlansByUserNames action */
export interface RemovePlansByUserAction extends AnyAction {
  planIdsByUserName: Dictionary<string[]>;
  type: typeof REMOVE_PLANS_BY_USER;
}

/** Create type for plansByUserName reducer actions */
export type PlansIdByUsersActionTypes =
  | FetchPlansByUserAction
  | RemovePlansByUserAction
  | AnyAction;

// action creators

/**
 * Fetch PlansByUser action creator
 * @param {PlanDefinition[]} planList - list of plan definition objects
 * @param {string} userName - user who has access to this plans.
 */
export const fetchPlansByUser = (
  planList: PlanDefinition[] = [],
  userName: string
): FetchPlansByUserAction => {
  const planIdsByUserName: Dictionary<string[]> = {};
  const plansIds = planList.map(plan => plan.identifier);
  planIdsByUserName[userName] = plansIds;

  return {
    planIdsByUserName,
    type: PLANS_BY_USER_FETCHED,
  };
};

/** Reset plan plansByUserName state action creator */
export const removePlansWithUser = () => ({
  planIdsByUserName: {},
  type: REMOVE_PLANS_BY_USER,
});

// the reducer

/** interface for plansByUserName state */
interface PlanByUserState {
  planIdsByUserName: Dictionary<string[]> | {};
}

/** immutable PlanIdsByUser state */
export type ImmutablePlansByUserNameState = PlanByUserState &
  SeamlessImmutable.ImmutableObject<PlanByUserState>;

/** initial PlanIdsByUser state */
const initialState: ImmutablePlansByUserNameState = SeamlessImmutable({
  planIdsByUserName: {},
});

/** the PlanIdsByUser reducer function */
export default function reducer(
  state = initialState,
  action: PlansIdByUsersActionTypes
): ImmutablePlansByUserNameState {
  switch (action.type) {
    case PLANS_BY_USER_FETCHED:
      return SeamlessImmutable({
        ...state,
        planIdsByUserName: { ...state.planIdsByUserName, ...action.planIdsByUserName },
      });

    case REMOVE_PLANS_BY_USER:
      return SeamlessImmutable({
        ...state,
        planIdsByUserName: action.planIdsByUserName,
      });
    default:
      return state;
  }
}

/** This interface represents the structure of plansByUserName filter options/params */
export interface PlanIsByUserNameFilters {
  userName?: string /** user, filter out plans that the user does not have access to */;
}

/** non_memoized function that gets value of reducerSlice.planIdsByUserName
 * * @param {Partial<Store>} state -  the redux store
 */
export const basePlanIdsByUserNamesSelector = (state: Partial<Store>): Dictionary<string[]> => {
  return (state as any)[reducerName].planIdsByUserName;
};

/** getUserName
 * Gets userName from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getUserName = (_: Partial<Store>, props: PlanIsByUserNameFilters) => props.userName;

/** gets all planIds associated with a userName
 * @param {Registry} state - the redux store
 * @param {PlanIsByUserNameFilters} props - the PlanIsByUserNameFilters object
 */
export const getPlanIdsByUserName = () => {
  return createSelector(
    basePlanIdsByUserNamesSelector,
    getUserName,
    (planIdsByUserName, userName) => {
      // only return a valid array of planIds if userName was provided.
      if (userName) {
        let plansIdsArray = planIdsByUserName[userName];
        plansIdsArray = plansIdsArray ? plansIdsArray : [];
        return plansIdsArray;
      }
      return null;
    }
  );
};

/** makePlansByUserNamesSelector
 * Returns a selector that gets an array of planIds objects filtered by one or all
 * of the following:
 *    - userName
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * To use this selector, do something like:
 *    const planIdsByUserNameSelector = makePlansByUserNamesSelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 */
export const makePlansByUserNamesSelector = () => {
  return createSelector(getPlanIdsByUserName(), planIds => {
    return planIds;
  });
};
