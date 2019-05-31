import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { FlexObject } from '../../helpers/utils';

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
  id: string;
  jurisdiction_id: string;
  measure: string;
  plan_id: string;
  task_business_status_map: FlexObject;
  task_count: number;
}

// actions
/** GOALS_FETCHED action type */
export const GOALS_FETCHED = 'reveal/reducer/goals/GOALS_FETCHED';

/** interface for authorize action */
interface FetchGoalsAction extends AnyAction {
  goalsById: { [key: string]: Goal };
  type: typeof GOALS_FETCHED;
}

/** Create type for Goal reducer actions */
export type GoalActionTypes = FetchGoalsAction | AnyAction;

/** interface for Goal state */
interface GoalState {
  goalsById: { [key: string]: Goal[] };
}

/** immutable Goal state */
export type ImmutableGoalState = GoalState & SeamlessImmutable.ImmutableObject<GoalState>;

/** initial Goal state */
const initialState: ImmutableGoalState = SeamlessImmutable({
  goalsById: {},
});

/** the Goal reducer function */
export default function reducer(state = initialState, action: GoalActionTypes): ImmutableGoalState {
  switch (action.type) {
    case GOALS_FETCHED:
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
