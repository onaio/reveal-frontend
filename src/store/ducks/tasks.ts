import { get, keyBy, keys, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { Geometry } from '../../helpers/utils';

/** the reducer name */
export const reducerName = 'tasks';

/** interface for task Object */
export interface Task {
  action_code: string;
  geometry: Geometry | null;
  goal_id: string;
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_parent_id: string;
  plan_id: string;
  structure_code: string | null;
  structure_id: string | null;
  structure_name: string | null;
  structure_type: string | null;
  task_business_status: string;
  task_execution_end_date: string;
  task_execution_start_date: string;
  task_focus: string;
  task_identifier: string;
  task_status: string;
  task_task_for: string;
}

// actions
/** TASKS_FETCHED action type */
export const TASKS_FETCHED = 'reveal/reducer/tasks/TASKS_FETCHED';

/** interface for authorize action */
interface FetchTasksAction extends AnyAction {
  tasksById: { [key: string]: Task };
  type: typeof TASKS_FETCHED;
}

/** Create type for Task reducer actions */
export type TaskActionTypes = FetchTasksAction | AnyAction;

/** interface for Task state */
interface TaskState {
  tasksById: { [key: string]: Task };
}

/** immutable Task state */
export type ImmutableTaskState = TaskState & SeamlessImmutable.ImmutableObject<TaskState>;

/** initial Task state */
const initialState: ImmutableTaskState = SeamlessImmutable({
  tasksById: {},
});

/** the Task reducer function */
export default function reducer(state = initialState, action: TaskActionTypes): ImmutableTaskState {
  switch (action.type) {
    case TASKS_FETCHED:
      if (action.tasksById) {
        return SeamlessImmutable({
          ...state,
          tasksById: action.tasksById,
        });
      }
      return state;
    default:
      return state;
  }
}

// action creators

/** fetch Tasks creator
 * @param {Task[]} tasksList - array of task objects
 */
export const fetchTasks = (tasksList: Task[]): FetchTasksAction => ({
  tasksById: keyBy(tasksList, task => task.task_identifier),
  type: TASKS_FETCHED,
});

// selectors

/** get tasks by id
 * @param {Partial<Store>} state - the redux store
 */
export function getTasksById(state: Partial<Store>): { [key: string]: Task } {
  return (state as any)[reducerName].tasksById;
}

/** get an array of task objects
 * @param {Partial<Store>} state - the redux store
 * @returns {Task[]} an array of tasks
 */
export function getTasksArray(state: Partial<Store>): Task[] {
  return values((state as any)[reducerName].tasksById);
}

/** get an array of task ids
 * @param {Partial<Store>} state - the redux store
 * @returns {string[]} an array of tasks ids
 */
export function getTasksIdArray(state: Partial<Store>): string[] {
  return keys((state as any)[reducerName].tasksById);
}

/** get one task using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} id - the task id
 * @returns {Task|null} a task or null
 */
export function getTaskById(state: Partial<Store>, id: string): Task | null {
  return get((state as any)[reducerName].tasksById, id) || null;
}

/** get tasks by plan id
 * @param {Partial<Store>} state - the redux store
 * @returns {Task[]} an array of tasks
 */
export function getTasksByPlanId(state: Partial<Store>, planId: string): Task[] {
  return values((state as any)[reducerName].tasksById).filter((e: Task) => e.plan_id === planId);
}

/** get tasks by goal id
 * @param {Partial<Store>} state - the redux store
 * @returns {Task[]} an array of tasks
 */
export function getTasksByGoalId(state: Partial<Store>, goalId: string): Task[] {
  return values((state as any)[reducerName].tasksById).filter((e: Task) => e.goal_id === goalId);
}

/** get tasks by jurisdiction id
 * @param {Partial<Store>} state - the redux store
 * @returns {Task[]} an array of tasks
 */
export function getTasksByJurisdictionId(state: Partial<Store>, jurisdictionId: string): Task[] {
  return values((state as any)[reducerName].tasksById).filter(
    (e: Task) => e.jurisdiction_id === jurisdictionId
  );
}

/** get tasks by structure id
 * @param {Partial<Store>} state - the redux store
 * @returns {Task[]} an array of tasks
 */
export function getTasksByStructureId(state: Partial<Store>, structureId: string): Task[] {
  return values((state as any)[reducerName].tasksById).filter(
    (e: Task) => e.structure_id === structureId
  );
}
