import { Dictionary } from '@onaio/utils';
import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { PlanActionCodesType } from '../../components/forms/PlanForm/types';

/** the reducer name */
export const reducerName = 'goals';

/** interface for goal Object */
export interface Goal {
  action_code: PlanActionCodesType;
  action_description: string;
  action_prefix: string;
  action_reason: string;
  action_title: string;
  completed_task_count: number;
  goal_comparator: string;
  goal_id: string;
  goal_unit: string;
  goal_value: number;
  id: string;
  jurisdiction_id: string;
  measure: string;
  plan_id: string;
  task_business_status_map: Dictionary;
  task_count: number;
}
// actions
/** GOALS_FETCHED action type */
export const GOALS_FETCHED = 'reveal/reducer/goals/GOALS_FETCHED';

/** SET_CURRENT_GOAL action type */
export const SET_CURRENT_GOAL = 'reveal/reducer/goals/SET_CURRENT_GOAL';

/** REMOVE_GOALS action type */
export const REMOVE_GOALS = 'reveal/reducer/goals/REMOVE_GOALS';

/** interface for authorize action */
interface FetchGoalsAction extends AnyAction {
  goalsById: { [key: string]: Goal };
  type: typeof GOALS_FETCHED;
}

/** interface for setting current goal action */
interface SetCurrentGoalAction extends AnyAction {
  currentGoal: string | null;
  type: typeof SET_CURRENT_GOAL;
}

/** Interface for remove goals action */
interface RemoveGoalsAction extends AnyAction {
  type: typeof REMOVE_GOALS;
  goalsById: {};
}

/** Create type for Goal reducer action */
export type GoalActionTypes =
  | FetchGoalsAction
  | SetCurrentGoalAction
  | RemoveGoalsAction
  | AnyAction;

/** interface for Goal state */
interface GoalState {
  goalsById: { [key: string]: Goal[] } | {};
  currentGoal: string | null;
}

/** immutable Goal state */
export type ImmutableGoalState = GoalState & SeamlessImmutable.ImmutableObject<GoalState>;

/** initial Goal state */
const initialState: ImmutableGoalState = SeamlessImmutable({
  currentGoal: null,
  goalsById: {},
});

/** the Goal reducer function */
export default function reducer(state = initialState, action: GoalActionTypes): ImmutableGoalState {
  switch (action.type) {
    case GOALS_FETCHED:
      return SeamlessImmutable({
        ...state,
        goalsById: { ...state.goalsById, ...action.goalsById },
      });
    case SET_CURRENT_GOAL:
      return SeamlessImmutable({
        ...state,
        currentGoal: action.currentGoal,
      });
    case REMOVE_GOALS:
      return SeamlessImmutable({
        ...state,
        goalsById: action.goalsById,
      });
    default:
      return state;
  }
}

// action creators

/** fetch Goals creator
 * @param {Goal[]} goalsList - array of goal objects
 * @returns {FetchGoalsAction} FetchGoalsAction
 */
export const fetchGoals = (goalsList: Goal[] = []): FetchGoalsAction => {
  return {
    goalsById: keyBy(
      goalsList.map((item: Goal) => {
        if (typeof item.task_business_status_map === 'string') {
          item.task_business_status_map = JSON.parse(item.task_business_status_map);
        }
        return item;
      }),
      goal => goal.id
    ),
    type: GOALS_FETCHED,
  };
};

/** fetch Current Goal
 * @param currentGoal - current selected goal type string if none defaults to null
 * @returns {SetchCurrentGoalAction} setchCurrentGoalAction
 */
export const setCurrentGoal = (currentGoal: string | null): SetCurrentGoalAction => {
  return {
    currentGoal,
    type: SET_CURRENT_GOAL,
  };
};

// Actions

export const removeGoalsAction: RemoveGoalsAction = {
  goalsById: {},
  type: REMOVE_GOALS,
};

// selectors

/** get goals by id
 * @param {Partial<Store>} state - the redux store
 */
export function getGoalsById(state: Partial<Store>): { [key: string]: Goal } {
  return (state as any)[reducerName].goalsById;
}

/** get one goal using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} id - the goal id
 * @returns {Goal|null} a goal or null
 */
export function getGoalById(state: Partial<Store>, id: string): Goal | null {
  return get((state as any)[reducerName].goalsById, id) || null;
}

/** get goals by plan id
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 * @returns {Goal[]} an array of goals
 */
export function getGoalsByPlanId(state: Partial<Store>, planId: string): Goal[] {
  return values((state as any)[reducerName].goalsById).filter((e: Goal) => e.plan_id === planId);
}

/** get goals by goal id
 * @param {Partial<Store>} state - the redux store
 * @param {string} goalId - the goal id
 * @returns {Goal[]} an array of goals
 */
export function getGoalsByGoalId(state: Partial<Store>, goalId: string): Goal[] {
  return values((state as any)[reducerName].goalsById).filter((e: Goal) => e.goal_id === goalId);
}

/** get goals by jurisdiction id
 * @param {Partial<Store>} state - the redux store
 * @param {string} jurisdictionId - the jurisdiction id
 * @returns {Goal[]} an array of goals
 */
export function getGoalsByJurisdictionId(state: Partial<Store>, jurisdictionId: string): Goal[] {
  return values((state as any)[reducerName].goalsById).filter(
    (e: Goal) => e.jurisdiction_id === jurisdictionId
  );
}

/** get goals by plan id and jurisdiction id
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 * @param {string} jurisdictionId - the jurisdiction id
 * @returns {Goal[]} an array of goals
 */
export function getGoalsByPlanAndJurisdiction(
  state: Partial<Store>,
  planId: string,
  jurisdictionId: string
): Goal[] {
  return values((state as any)[reducerName].goalsById).filter(
    (e: Goal) => e.plan_id === planId && e.jurisdiction_id === jurisdictionId
  );
}
/** get currently selected goal */
export function getCurrentGoal(state: Partial<Store>) {
  return (state as any)[reducerName].currentGoal;
}
