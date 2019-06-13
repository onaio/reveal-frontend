import { Color } from 'csstype';
import { get, keyBy, keys, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { GeoJSON, Geometry, getColor } from '../../helpers/utils';

/** the reducer name */
export const reducerName = 'tasks';

/** Interface for task.geojson.properties for task
 *  as received from the fetch request / superset
 */
export interface InitialProperties {
  action_code: string;
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
  task_status: string;
  task_task_for: string;
}

/** Extends InitialProperties to include additional
 *  geojson.properties object properties
 */
export interface AddedProperties extends InitialProperties {
  color: Color;
}

/** interface for task.geojson for
 * task as received from the fetch request / superset
 */
export interface InitialTaskGeoJSON extends GeoJSON {
  properties: InitialProperties;
}

/** interface for task GeoJSON after any properties are added
 * to geojson.properties e.g. color
 */
export interface TaskGeoJSON extends InitialTaskGeoJSON {
  properties: AddedProperties;
}

/** Interface for FeatureCollection */
export interface FeatureCollection {
  type: string;
  features: TaskGeoJSON[];
}

/** interface for task Object for
 * task as received from the fetch request / superset
 */
export interface InitialTask {
  geojson: InitialTaskGeoJSON;
  goal_id: string;
  jurisdiction_id: string;
  plan_id: string;
  task_identifier: string;
}

/** Task interface where geoJson implements InitialProperties
 * interface with added properties e.g .color
 */
export interface Task extends InitialTask {
  geojson: TaskGeoJSON;
}

// actions
/** TASKS_FETCHED action type */
export const TASKS_FETCHED = 'reveal/reducer/tasks/TASKS_FETCHED';
export const RESET_TASKS = 'reveal/reducer/tasks/RESET_TASKS';

/** interface for authorize action */
interface FetchTasksAction extends AnyAction {
  tasksById: { [key: string]: Task };
  type: typeof TASKS_FETCHED;
}

/** Interface for reset tasks action */
interface ResetTaskAction extends AnyAction {
  tasksById: {};
  type: typeof RESET_TASKS;
}

/** Create type for Task reducer actions */
export type TaskActionTypes = FetchTasksAction | ResetTaskAction | AnyAction;

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
    case RESET_TASKS:
      return SeamlessImmutable({
        tasksById: action.tasksById,
      });
    default:
      return state;
  }
}

// action creators

/** fetch Tasks creator
 * @param {Task[]} tasksList - array of task objects
 */
export const fetchTasks = (tasksList: InitialTask[] = []): FetchTasksAction => ({
  tasksById: keyBy(
    tasksList.map(
      (task: InitialTask): Task => {
        /** ensure geojson is parsed */
        if (typeof task.geojson === 'string') {
          task.geojson = JSON.parse(task.geojson);
        }
        /** ensure geometry is parsed */
        if (typeof task.geojson.geometry === 'string') {
          task.geojson.geometry = JSON.parse(task.geojson.geometry);
        }
        (task as Task).geojson.properties.color = getColor(task);
        return task as Task;
      }
    ),
    task => task.task_identifier
  ),
  type: TASKS_FETCHED,
});

/** Reset-tasks-state action creator */
export const resetTasks = (): ResetTaskAction => ({
  tasksById: {},
  type: RESET_TASKS,
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
 * @param {string} planId - the plan id
 * @returns {Task[]} an array of tasks
 */
export function getTasksByPlanId(state: Partial<Store>, planId: string): Task[] {
  return values((state as any)[reducerName].tasksById).filter((e: Task) => e.plan_id === planId);
}

/** get tasks by goal id
 * @param {Partial<Store>} state - the redux store
 * @param {string} goalId - the goal id
 * @returns {Task[]} an array of tasks
 */
export function getTasksByGoalId(state: Partial<Store>, goalId: string): Task[] {
  return values((state as any)[reducerName].tasksById).filter((e: Task) => e.goal_id === goalId);
}

/** get tasks by jurisdiction id
 * @param {Partial<Store>} state - the redux store
 * @param {string} jurisdictionId - the jurisdiction id
 * @returns {Task[]} an array of tasks
 */
export function getTasksByJurisdictionId(state: Partial<Store>, jurisdictionId: string): Task[] {
  return values((state as any)[reducerName].tasksById).filter(
    (e: Task) => e.jurisdiction_id === jurisdictionId
  );
}

/** get tasks by structure id
 * @param {Partial<Store>} state - the redux store
 * @param {string} structureId - the structure id
 * @returns {Task[]} an array of tasks
 */
export function getTasksByStructureId(state: Partial<Store>, structureId: string): Task[] {
  return values((state as any)[reducerName].tasksById).filter((e: Task) => {
    if (e.geojson && e.geojson.properties) {
      return e.geojson.properties.structure_id === structureId;
    }
    return false;
  });
}

/** get goals by plan id and jurisdiction id
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 * @param {string} jurisdictionId - the jurisdiction id
 * @returns {Task[]} an array of tasks
 */
export function getTasksByPlanAndJurisdiction(
  state: Partial<Store>,
  planId: string,
  jurisdictionId: string
): Task[] {
  return values((state as any)[reducerName].tasksById).filter(
    (e: Task) => e.plan_id === planId && e.jurisdiction_id === jurisdictionId
  );
}

/** get goals by plan id and goal id and jurisdiction id
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 * @param {string} goalId - the goal id
 * @param {string} jurisdictionId - the jurisdiction id
 * @returns {Task[]} an array of tasks
 */
export function getTasksByPlanAndGoalAndJurisdiction(
  state: Partial<Store>,
  planId: string,
  goalId: string,
  jurisdictionId: string
): Task[] {
  return values((state as any)[reducerName].tasksById).filter(
    (e: Task) =>
      e.plan_id === planId && e.goal_id === goalId && e.jurisdiction_id === jurisdictionId
  );
}
/** creates an object that wraps geojson features around
 * a standard object format and returns it as the FeatureCollection
 * @param {TaskGeoJSON[]} taskFeatureCollection - a list of preprocessed tasks.geojson objects
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
function wrapFeatureCollection(taskFeatureCollection: TaskGeoJSON[]): FeatureCollection {
  return {
    features: taskFeatureCollection,
    type: 'FeatureCollection',
  };
}

/** get all tasks as a Feature Collection
 * @param {Partial<Store>} state - the redux store
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getAllFC(state: Partial<Store>): FeatureCollection {
  const geoJsonFeatures: TaskGeoJSON[] = values((state as any)[reducerName].tasksById).map(
    e => e.geojson
  );
  return wrapFeatureCollection(geoJsonFeatures);
}

/** get tasks as FeatureCollection filtered by goal_id
 * @param {Partial<Store>} state - the redux store
 * @param {string} goalId - task.geojson.properties.goal_id
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByGoalId(state: Partial<Store>, goalId: string): FeatureCollection {
  const geoJsonFeatures: TaskGeoJSON[] = values((state as any)[reducerName].tasksById)
    .map(e => e.geojson)
    .filter(e => e.properties.goal_id === goalId);
  return wrapFeatureCollection(geoJsonFeatures);
}

/** get tasks as FeatureCollection filtered by plan_id
 * @param {partial<Store>} state - the redux store
 * @param {string} planId - task.geojson.properties.plan_id
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByPlanId(state: Partial<Store>, planId: string): FeatureCollection {
  const geoJsonFeatures: TaskGeoJSON[] = values((state as any)[reducerName].tasksById)
    .map(e => e.geojson)
    .filter(e => e.properties.plan_id === planId);
  return wrapFeatureCollection(geoJsonFeatures);
}

/** get tasks as FeatureCollection filtered by jurisdiction_id
 * @param {partial<Store>} state - the redux store
 * @param {string} jurisdictionId - task.geojson.properties.jurisdiction_id
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByJurisdictionId(
  state: Partial<Store>,
  jurisdictionId: string
): FeatureCollection {
  const geoJsonFeatures: TaskGeoJSON[] = values((state as any)[reducerName].tasksById)
    .map(e => e.geojson)
    .filter(e => e.properties.jurisdiction_id === jurisdictionId);
  return wrapFeatureCollection(geoJsonFeatures);
}

/** get tasks as FeatureCollection filtered by structure_id
 * @param {partial<Store>} state - the redux store
 * @param {string} structureId - task.geojson.properties.structure_id
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByStructureId(state: Partial<Store>, structureId: string): FeatureCollection {
  const geoJsonFeatures: TaskGeoJSON[] = values((state as any)[reducerName].tasksById)
    .map(e => e.geojson)
    .filter(e => e.properties.structure_id === structureId);
  return wrapFeatureCollection(geoJsonFeatures);
}

/** get tasks as FeatureCollection filtered by plan and jurisdiction
 * @param {partial<Store>} state - the redux store
 * @param {string} planId - task.geojson.properties.plan_id
 * @param {string} jurisdictionId - task.geojson.properties.jurisdiction_id
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByPlanAndJurisdiction(
  state: Partial<Store>,
  planId: string,
  jurisdictionId: string
): FeatureCollection {
  const geoJsonFeatures: TaskGeoJSON[] = values((state as any)[reducerName].tasksById)
    .map(e => e.geojson)
    .filter(
      e => e.properties.plan_id === planId && e.properties.jurisdiction_id === jurisdictionId
    );
  return wrapFeatureCollection(geoJsonFeatures);
}

/** get tasks as FeatureCollection filtered by structure_id
 * @param {partial<Store>} state - the redux store
 * @param {string} planId - task.geojson.properties.plan_id
 * @param {string} goalId - task.geojson.properties.goal_id
 * @param {string} jurisdictionId - task.geojson.properties.jurisdiction_id
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByPlanAndGoalAndJurisdiction(
  state: Partial<Store>,
  planId: string,
  goalId: string,
  jurisdictionId: string
): FeatureCollection {
  const geoJsonFeatures: TaskGeoJSON[] = values((state as any)[reducerName].tasksById)
    .map(e => e.geojson)
    .filter(
      e =>
        e.properties.plan_id === planId &&
        e.properties.goal_id === goalId &&
        e.properties.jurisdiction_id === jurisdictionId
    );
  return wrapFeatureCollection(geoJsonFeatures);
}
