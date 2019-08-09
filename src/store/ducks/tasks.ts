import { Color } from 'csstype';
import { get, keyBy, keys, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { MULTI_POLYGON, POLYGON } from '../../constants';
import {
  FeatureCollection,
  GeoJSON,
  getColor,
  UpdateType,
  wrapFeatureCollection,
} from '../../helpers/utils';

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

interface ColorUpdate {
  color: Color;
}
/** Extends InitialProperties to include additional
 *  geojson.properties object properties
 */
export type UpdatedProperties = UpdateType<InitialProperties, ColorUpdate>;

interface InitialPropertiesUpdate {
  properties: InitialProperties;
}
/** interface for task.geojson for
 * task as received from the fetch request / superset
 */
export type InitialTaskGeoJSON = UpdateType<GeoJSON, InitialPropertiesUpdate>;

interface UpdatedPropertiesUpdate {
  properties: UpdatedProperties;
}
/** interface for task GeoJSON after any properties are added
 * to geojson.properties
 */
export type TaskGeoJSON = UpdateType<InitialTaskGeoJSON, UpdatedPropertiesUpdate>;

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

interface GeoJSONUpdate {
  geojson: TaskGeoJSON;
}
/** Task interface where geoJson implements InitialProperties
 * interface with added properties e.g .color
 */
export type Task = UpdateType<InitialTask, GeoJSONUpdate>;

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

/** get Structures by jurisdiction id
 * Structures are tasks whose geometry is of type Polygon
 * @param {Partial<Store>} state - the redux store
 * @param {string} jurisdictionId - the jurisdiction id
 * @returns {Task[]} an array of tasks
 */
export function getStructuresByJurisdictionId(
  state: Partial<Store>,
  jurisdictionId: string
): Task[] {
  return getTasksByJurisdictionId(state, jurisdictionId).filter((e: Task) => {
    return (
      e.geojson.geometry &&
      (e.geojson.geometry.type === POLYGON || e.geojson.geometry.type === MULTI_POLYGON)
    );
  });
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

/** responsible for only getting task geojson data for all tasks from reducer
 * @param {Partial<Store>} state - the store state
 * @param {boolean} includeNullGeoms - if to include features with null geometries in FC
 * @return {TaskGeoJSON []} - returns a list of all tasks' geojson whose geoms are not null
 */
export function getTasksGeoJsonData(
  state: Partial<Store>,
  includeNullGeoms: boolean = true,
  structureType: string[] | null = null
): TaskGeoJSON[] {
  let results = values((state as any)[reducerName].tasksById).map(e => e.geojson);
  if (!includeNullGeoms || structureType) {
    if (structureType) {
      results = results.filter(e => e && e.geometry && structureType.includes(e.geometry.type));
    } else {
      results = results.filter(e => e && e.geometry);
    }
  }
  return results;
}

/** get all tasks as a Feature Collection
 * @param {Partial<Store>} state - the redux store
 * @param {boolean} includeNullGeoms - if to include features with null geometries in FC
 * @return {FeatureCollection<TaskGeoJSON>} - an geoJSON Feature Collection object
 */
export function getAllFC(
  state: Partial<Store>,
  includeNullGeoms: boolean = true
): FeatureCollection<TaskGeoJSON> {
  const allGeojsonFeatures = getTasksGeoJsonData(state, includeNullGeoms);
  return wrapFeatureCollection(allGeojsonFeatures);
}

/** get tasks as FeatureCollection filtered by goal_id
 * @param {Partial<Store>} state - the redux store
 * @param {string} goalId - the goal id
 * @param {boolean} includeNullGeoms - if to include features with null geometries in FC
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByGoalId(
  state: Partial<Store>,
  goalId: string,
  includeNullGeoms: boolean = true
): FeatureCollection<TaskGeoJSON> {
  const geoJsonFeatures: TaskGeoJSON[] = getTasksGeoJsonData(state, includeNullGeoms).filter(
    e => e.properties.goal_id === goalId
  );
  return wrapFeatureCollection(geoJsonFeatures);
}

/** get tasks as FeatureCollection filtered by plan_id
 * @param {partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 * @param {boolean} includeNullGeoms - if to include features with null geometries in FC
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByPlanId(
  state: Partial<Store>,
  planId: string,
  includeNullGeoms: boolean = true
): FeatureCollection<TaskGeoJSON> {
  const geoJsonFeatures: TaskGeoJSON[] = getTasksGeoJsonData(state, includeNullGeoms).filter(
    e => e.properties.plan_id === planId
  );
  return wrapFeatureCollection(geoJsonFeatures);
}

/** get tasks as FeatureCollection filtered by jurisdiction_id
 * @param {partial<Store>} state - the redux store
 * @param {string} jurisdictionId - the jurisdiction id
 * @param {boolean} includeNullGeoms - if to include features with null geometries in FC
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByJurisdictionId(
  state: Partial<Store>,
  jurisdictionId: string,
  includeNullGeoms: boolean = true
): FeatureCollection<TaskGeoJSON> {
  const geoJsonFeatures: TaskGeoJSON[] = getTasksGeoJsonData(state, includeNullGeoms).filter(
    e => e.properties.jurisdiction_id === jurisdictionId
  );
  return wrapFeatureCollection(geoJsonFeatures);
}

/** get Structures FeatureCollection by jurisdiction id
 * Structures are tasks whose geometry is of type Polygon
 * @param {Partial<Store>} state - the redux store
 * @param {string} jurisdictionId - the jurisdiction id
 * @returns {FeatureCollection} - a geoJSON Feature Collection object
 */
export function getStructuresFCByJurisdictionId(
  state: Partial<Store>,
  jurisdictionId: string
): FeatureCollection<TaskGeoJSON> {
  const structures = getStructuresByJurisdictionId(state, jurisdictionId);
  return wrapFeatureCollection(values(structures.map(e => e.geojson)));
}

/** get tasks as FeatureCollection filtered by structure_id
 * @param {partial<Store>} state - the redux store
 * @param {string} structureId - the structure id
 * @param {boolean} includeNullGeoms - if to include features with null geometries in FC
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByStructureId(
  state: Partial<Store>,
  structureId: string,
  includeNullGeoms: boolean = true
): FeatureCollection<TaskGeoJSON> {
  const geoJsonFeatures: TaskGeoJSON[] = getTasksGeoJsonData(state, includeNullGeoms).filter(
    e => e.properties.structure_id === structureId
  );
  return wrapFeatureCollection(geoJsonFeatures);
}

/** get tasks as FeatureCollection filtered by plan and jurisdiction
 * @param {partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 * @param {string} jurisdictionId - the jurisdiction id
 * @param {boolean} includeNullGeoms - if to include features with null geometries in FC
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByPlanAndJurisdiction(
  state: Partial<Store>,
  planId: string,
  jurisdictionId: string,
  includeNullGeoms: boolean = true
): FeatureCollection<TaskGeoJSON> {
  const geoJsonFeatures: TaskGeoJSON[] = getTasksGeoJsonData(state, includeNullGeoms).filter(
    e => e.properties.plan_id === planId && e.properties.jurisdiction_id === jurisdictionId
  );
  return wrapFeatureCollection(geoJsonFeatures);
}

/** get tasks as FeatureCollection filtered by structure_id
 * @param {partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 * @param {string} goalId - the goal id
 * @param {string} jurisdictionId - the jurisdiction id
 * @param {boolean} includeNullGeoms - if to include features with null geometries in FC
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByPlanAndGoalAndJurisdiction(
  state: Partial<Store>,
  planId: string,
  goalId: string,
  jurisdictionId: string,
  includeNullGeoms: boolean = true,
  structureType: string[] | null = null
): FeatureCollection<TaskGeoJSON> {
  const geoJsonFeatures: TaskGeoJSON[] = getTasksGeoJsonData(
    state,
    includeNullGeoms,
    structureType
  ).filter(
    e =>
      e.properties.plan_id === planId &&
      e.properties.goal_id === goalId &&
      e.properties.jurisdiction_id === jurisdictionId
  );
  return wrapFeatureCollection(geoJsonFeatures);
}
