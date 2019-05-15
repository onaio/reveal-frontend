import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** the reducer name */
export const reducerName = 'goals';

/** interface for goal Object */
export interface Goal {
  action_code: string;
  completed_task_count: number;
  goal_comparator: string;
  goal_id: string;
  goal_unit: string;
  goal_value: number;
  measure: string;
  plan_id: string;
  task_count: number;
}

// actions
/** GOALS_FETCHED action type */
export const GOALS_FETCHED = 'reveal/reducer/goals/GOALS_FETCHED';

/** interface for authorize action */
interface FetchGoalsAction extends AnyAction {
  goalsByPlanId: { [key: string]: Goal[] };
  type: typeof GOALS_FETCHED;
}

/** Create type for Goal reducer actions */
export type GoalActionTypes = FetchGoalsAction | AnyAction;

/** interface for Goal state */
interface GoalState {
  goalsByPlanId: { [key: string]: Goal[] };
}

/** immutable Goal state */
export type ImmutableGoalState = GoalState & SeamlessImmutable.ImmutableObject<GoalState>;

/** initial Goal state */
const initialState: ImmutableGoalState = SeamlessImmutable({
  goalsByPlanId: {},
});

/** the Goal reducer function */
export default function reducer(state = initialState, action: GoalActionTypes): ImmutableGoalState {
  switch (action.type) {
    case GOALS_FETCHED:
      /** DIRTY HACK TO BE FIXED */
      return (state as any).merge({
        goalsByPlanId: action.goalsByPlanId,
      });
    default:
      return state;
  }
}

// action creators

/** fetch Goals creator
 * @param {Goal[]} goalsList - array of goal objects
 */
export const fetchGoals = (goalsList: Goal[]): FetchGoalsAction => {
  const result: { [key: string]: Goal[] } = {};
  if (goalsList) {
    goalsList.forEach(goal => {
      if (Object.keys(result).includes(goal.plan_id)) {
        if (!result[goal.plan_id].includes(goal)) {
          result[goal.plan_id].push(goal);
        }
      } else {
        result[goal.plan_id] = [goal];
      }
    });
  }

  return {
    goalsByPlanId: result,
    type: GOALS_FETCHED,
  };
};

// selectors

/** get goals by plan id
 * @param {Partial<Store>} state - the redux store
 */
export function getGoalsByPlanId(state: Partial<Store>): { [key: string]: Goal } {
  return (state as any)[reducerName].goalsByPlanId;
}

/** get array of goals by plan id
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 */
export function getGoalsArrayByPlanId(state: Partial<Store>, planId: string): Goal[] | null {
  const goalsByPlan = (state as any)[reducerName].goalsByPlanId;
  if (!goalsByPlan) {
    return null;
  }
  const thisPlansGoals = goalsByPlan[planId];
  if (!thisPlansGoals) {
    return null;
  }
  return thisPlansGoals;
}
