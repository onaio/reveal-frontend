import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, {
  fetchTasks,
  getTaskById,
  getTasksArray,
  getTasksByGoalId,
  getTasksById,
  getTasksByJurisdictionId,
  getTasksByPlanId,
  getTasksByStructureId,
  getTasksIdArray,
  reducerName,
  Task,
} from '../tasks';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/tasks', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getTasksById(store.getState())).toEqual({});
    expect(getTasksIdArray(store.getState())).toEqual([]);
    expect(getTasksArray(store.getState())).toEqual([]);
    expect(getTaskById(store.getState(), 'someId')).toEqual(null);
    expect(getTasksByPlanId(store.getState(), 'someId')).toEqual([]);
    expect(getTasksByGoalId(store.getState(), 'someId')).toEqual([]);
    expect(getTasksByJurisdictionId(store.getState(), 'someId')).toEqual([]);
    expect(getTasksByStructureId(store.getState(), 'someId')).toEqual([]);
  });

  it('should fetch tasks', () => {
    store.dispatch(fetchTasks(fixtures.tasks));
    const expected = keyBy(fixtures.tasks, (task: Task) => task.task_identifier);
    expect(getTasksById(store.getState())).toEqual(expected);
    expect(getTasksIdArray(store.getState())).toEqual(fixtures.taskIdsArray);
    expect(getTasksArray(store.getState())).toEqual(values(expected));
    expect(getTaskById(store.getState(), '01d0b84c-df06-426c-a272-6858e84fea31')).toEqual(
      fixtures.task4
    );
    expect(getTasksByPlanId(store.getState(), '10f9e9fa-ce34-4b27-a961-72fab5206ab6')).toEqual([
      fixtures.task1,
      fixtures.task2,
      fixtures.task4,
    ]);
    expect(getTasksByGoalId(store.getState(), 'RACD_bednet_dist_1km_radius')).toEqual([
      fixtures.task2,
    ]);
    expect(getTasksByJurisdictionId(store.getState(), '3952')).toEqual([fixtures.task3]);
    expect(getTasksByStructureId(store.getState(), 'a19eeb63-45d0-4744-9a9d-76d0694103f6')).toEqual(
      [fixtures.task1]
    );
  });
});
