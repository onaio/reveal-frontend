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
  getTasksByPlanAndJurisdiction,
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
    expect(getTasksByPlanAndJurisdiction(store.getState(), 'a', 'b')).toEqual([]);
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
    expect(
      getTasksByPlanAndJurisdiction(
        store.getState(),
        '356b6b84-fc36-4389-a44a-2b038ed2f38d',
        '3952'
      )
    ).toEqual([fixtures.task3]);
  });

  it('should save tasks correctly', () => {
    store.dispatch(fetchTasks([fixtures.task76] as any));
    const task76FromStore = getTaskById(store.getState(), 'moshT');
    expect(task76FromStore).not.toBeNull();
    if (task76FromStore) {
      expect(task76FromStore).toEqual({
        geojson: {
          geometry: {
            coordinates: [
              [
                [101.177725195885, 15.0658221308165],
                [101.177684962749, 15.0657263002127],
                [101.177778840065, 15.0656848599382],
                [101.177832484245, 15.0657781005444],
                [101.177725195885, 15.0658221308165],
              ],
            ],
            type: 'Polygon',
          },
          id: 'moshT',
          properties: {
            action_code: 'Bednet Distribution',
            goal_id: 'RACD_bednet_dist_1km_radius',
            jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
            jurisdiction_name: 'TLv1_01',
            jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
            plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
            structure_code: 'da765947-5e4d-49f7-9eb8-2d2d00681f65',
            structure_id: 'da765947-5e4d-49f7-9eb8-2d2d00681f65',
            structure_name: 'da765947-5e4d-49f7-9eb8-2d2d00681f65',
            structure_type: 'da765947-5e4d-49f7-9eb8-2d2d00681f65',
            task_business_status: 'Not Visited',
            task_execution_end_date: '2019-04-01',
            task_execution_start_date: '2019-04-08',
            task_focus: 'Bednet Distribution',
            task_status: 'Ready',
            task_task_for: 'da765947-5e4d-49f7-9eb8-2d2d00681f65',
          },
          type: 'Feature',
        },
        goal_id: 'RACD_bednet_dist_1km_radius',
        jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
        plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
        task_identifier: 'moshT',
      });
    }
  });
});
