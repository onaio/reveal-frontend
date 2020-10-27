import { UpdateType } from '@onaio/utils';
import { Color } from 'csstype';
import intersect from 'fast_array_intersect';
import { get, keyBy, keys, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';
import { MULTI_POLYGON, POLYGON } from '../../constants';
import { FeatureCollection, GeoJSON, getColor, wrapFeatureCollection } from '../../helpers/utils';
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
  task_id?: string;
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
export const REMOVE_TASKS = 'reveal/reducer/tasks/REMOVE_TASKS';

/** interface for authorize action */
export interface FetchTasksAction extends AnyAction {
  tasksById: { [key: string]: Task };
  type: typeof TASKS_FETCHED;
}

/** Interface for reset tasks action */
export interface ResetTaskAction extends AnyAction {
  tasksById: {};
  type: typeof REMOVE_TASKS;
}

/** Create type for Task reducer actions */
export type TaskActionTypes = FetchTasksAction | ResetTaskAction | AnyAction;

/** interface for Task state */
interface TaskState {
  tasksById: { [key: string]: Task } | {};
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
          tasksById: { ...state.tasksById, ...action.tasksById },
        });
      }
      return state;
    case REMOVE_TASKS:
      return SeamlessImmutable({
        ...state,
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
        (task as Task).geojson.properties.task_id = task.task_identifier;
        return task as Task;
      }
    ),
    task => task.task_identifier
  ),
  type: TASKS_FETCHED,
});

// actions

/** remove tasks action */
export const removeTasksAction: ResetTaskAction = {
  tasksById: {},
  type: REMOVE_TASKS,
};

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

/** get tasks filtered by plan and jurisdiction ids
 * @param {Partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 * @param {string} jurisdictionId - the jurisdiction id
 * @returns {Task[]} an array of tasks
 */
export function getTasksByPlanJurisdictionIds(
  state: Partial<Store>,
  planId: string,
  jurisdictionId: string
): Task[] {
  const tasksByPlanId = getTasksByPlanId(state, planId);
  return tasksByPlanId.filter((t: Task) => t.jurisdiction_id === jurisdictionId);
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

/** get tasks as FeatureCollection filtered by plan_id & goal_id & jurisdiction_id
 * @param {partial<Store>} state - the redux store
 * @param {string} planId - the plan id
 * @param {string[]} goalIds - A list of goal_ids
 * @param {string} jurisdictionId - the jurisdiction id
 * @param {boolean} includeNullGeoms - if to include features with null geometries in FC
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getFCByPlanAndGoalAndJurisdiction(
  state: Partial<Store>,
  planId: string,
  goalIds: string[],
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
      goalIds.includes(e.properties.goal_id) &&
      e.properties.jurisdiction_id === jurisdictionId
  );
  return wrapFeatureCollection(geoJsonFeatures);
}

/** RESELECT USAGE STARTS HERE */

export interface TaskFCSelectorFilters {
  actionCode?: string /** filter tasks for given action code */;
  planId?: string /** filter tasks for given planId */;
  jurisdictionId?: string /** filter tasks withing given jurisdiction */;
  includeNullGeoms?: boolean /** include features with null geometries in Feature Collection */;
  structureType?: string[] /** e.g points, polygons, lines e.t.c */;
  taskBusinessStatus?: string /** filter tasks with given task_businessStatus */;
  excludePlanId?: string /** filters out tasks that belong to plan that has this id */;
}

/** get tasks by id
 * @param {Partial<Store>} state - the redux store
 */
export const baseTasksByIdSelector = getTasksById;

/** factory function to create non_memorized functions that only return the value
 * of  the given propKey from the TaskSelectorFilters props
 */
export const getPropValue = <T extends object, U extends keyof T>(propKey: U) => {
  /** get <propKey>from TaskSelectorFilters
   * @param {Partial<Store>} _ - the redux store state
   * @param {TaskSelectorFilters} props - filter props
   * @return {string | undefined}
   */
  return (_: Partial<Store>, props: T) => props[propKey];
};

// non memoized functions that return the value of their propKeys in TaskSelectorFilters
// without applying any transformations to the value

export const getActionCode = getPropValue<TaskFCSelectorFilters, 'actionCode'>('actionCode');
export const getPlanId = getPropValue<TaskFCSelectorFilters, 'planId'>('planId');
export const getJurisdictionId = getPropValue<TaskFCSelectorFilters, 'jurisdictionId'>(
  'jurisdictionId'
);
export const getIncludeNullGeoms = getPropValue<TaskFCSelectorFilters, 'includeNullGeoms'>(
  'includeNullGeoms'
);
export const getStructureType = getPropValue<TaskFCSelectorFilters, 'structureType'>(
  'structureType'
);
export const getTasksBusinessStatus = getPropValue<TaskFCSelectorFilters, 'taskBusinessStatus'>(
  'taskBusinessStatus'
);
export const getExcludePlanID = getPropValue<TaskFCSelectorFilters, 'excludePlanId'>(
  'excludePlanId'
);

/** get tasks by value selector */
export const baseTasksGeoJsonData = createSelector(
  baseTasksByIdSelector,
  getIncludeNullGeoms,
  getStructureType,
  (tasksById, includeNullGeoms, structureType) => {
    let results = values(tasksById).map(e => e.geojson);
    if (!includeNullGeoms || structureType) {
      if (structureType) {
        results = results.filter(e => e && e.geometry && structureType.includes(e.geometry.type));
      } else {
        results = results.filter(e => e && e.geometry);
      }
    }
    return results;
  }
);

/** get tasks' Feature Collection filtered by action_code
 * @param {Partial<Store>} state - the redux store
 * @param {TaskFCSelectorFilters} props - the taskFC selector filters object
 */
export const selectFCByActionCode = () =>
  createSelector(baseTasksGeoJsonData, getActionCode, (tasksGeoJsonArray, actionCode) => {
    const geoJsonFeatures = actionCode
      ? tasksGeoJsonArray.filter(task => task.properties.action_code === actionCode)
      : tasksGeoJsonArray;
    return wrapFeatureCollection(geoJsonFeatures);
  });

/** get tasks' Feature Collection filtered by jurisdiction_id
 * @param {Partial<Store>} state - the redux store
 * @param {TaskFCSelectorFilters} props - the taskFC selector filters object
 */
export const selectFCByJurisdictionId = () =>
  createSelector(baseTasksGeoJsonData, getJurisdictionId, (tasksGeoJsonArray, jurisdictionId) => {
    const geoJsonFeatures = jurisdictionId
      ? tasksGeoJsonArray.filter(task => task.properties.jurisdiction_id === jurisdictionId)
      : tasksGeoJsonArray;
    return wrapFeatureCollection(geoJsonFeatures);
  });

/** get tasks' Feature Collection filtered by plan_id
 * @param {Partial<Store>} state - the redux store
 * @param {TaskFCSelectorFilters} props - the taskFC selector filters object
 */
export const selectFCByPlanId = () =>
  createSelector(baseTasksGeoJsonData, getPlanId, (tasksGeoJsonArray, planId) => {
    const geoJsonFeatures = planId
      ? tasksGeoJsonArray.filter(task => task.properties.plan_id === planId)
      : tasksGeoJsonArray;
    return wrapFeatureCollection(geoJsonFeatures);
  });

/** get tasks' Feature Collection that do not belong to plan_id
 * @param {Partial<Store>} state - the redux store
 * @param {TaskFCSelectorFilters} props - the taskFC selector filters object
 */
export const selectFCExcludingPlanId = () =>
  createSelector(baseTasksGeoJsonData, getExcludePlanID, (tasksGeoJsonArray, excludePlanId) => {
    const geoJsonFeatures = excludePlanId
      ? tasksGeoJsonArray.filter(task => task.properties.plan_id !== excludePlanId)
      : tasksGeoJsonArray;
    return wrapFeatureCollection(geoJsonFeatures);
  });

/** get tasks' Feature Collection filtered by task_business_status
 * @param {Partial<Store>} state - the redux store
 * @param {TaskFCSelectorFilters} props - the taskFC selector filters object
 */
export const selectFCByTaskBusinessStatus = () =>
  createSelector(
    baseTasksGeoJsonData,
    getTasksBusinessStatus,
    (tasksGeoJsonArray, taskBusinessStatus) => {
      const geoJsonFeatures = taskBusinessStatus
        ? tasksGeoJsonArray.filter(
            task => task.properties.task_business_status === taskBusinessStatus
          )
        : tasksGeoJsonArray;
      return wrapFeatureCollection(geoJsonFeatures);
    }
  );

/** tasksFCSelectorFactory
 * Returns a selector that gets an array of tasks feature Collection objects filtered by one or all
 * of the following:
 *    - actionCode
 *    - jurisdictionId
 *    - plan id
 *    - task_business_status
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * To use this selector, do something like:
 *    const tasksFCSelector = tasksFCSelectorFactory();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {TaskFCSelectorFilters} props - the plan filters object
 */
export const tasksFCSelectorFactory = () =>
  createSelector(
    selectFCByActionCode(),
    selectFCByJurisdictionId(),
    selectFCByPlanId(),
    selectFCByTaskBusinessStatus(),
    selectFCExcludingPlanId(),
    (actionFC, jurisdictionFC, planFC, taskBusinessStatusFC, excludedPlanFC) => {
      const featuresArrays = [
        actionFC,
        jurisdictionFC,
        planFC,
        taskBusinessStatusFC,
        excludedPlanFC,
      ].map((featureCollection: FeatureCollection<TaskGeoJSON>) => featureCollection.features);
      const intersectedArrays = intersect(featuresArrays, JSON.stringify);
      return wrapFeatureCollection(intersectedArrays);
    }
  );
