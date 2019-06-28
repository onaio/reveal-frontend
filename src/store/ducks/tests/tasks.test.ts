import reducerRegistry from '@onaio/redux-reducer-registry';
import { cloneDeep, keyBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import { FeatureCollection } from '../../../helpers/utils';
import store from '../../index';
import reducer, {
  fetchTasks,
  getAllFC,
  getFCByGoalId,
  getFCByJurisdictionId,
  getFCByPlanAndGoalAndJurisdiction,
  getFCByPlanAndJurisdiction,
  getFCByPlanId,
  getFCByStructureId,
  getStructuresByJurisdictionId,
  getStructuresFCByJurisdictionId,
  getTaskById,
  getTasksArray,
  getTasksByGoalId,
  getTasksById,
  getTasksByJurisdictionId,
  getTasksByPlanAndGoalAndJurisdiction,
  getTasksByPlanAndJurisdiction,
  getTasksByPlanId,
  getTasksByStructureId,
  getTasksGeoJsonData,
  getTasksIdArray,
  InitialTaskGeoJSON,
  reducerName,
  resetTasks,
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

  afterEach(() => {
    store.dispatch(resetTasks());
  });

  it('should have initial state', () => {
    expect(getTasksById(store.getState())).toEqual({});
    expect(getTasksIdArray(store.getState())).toEqual([]);
    expect(getTasksArray(store.getState())).toEqual([]);
    expect(getTaskById(store.getState(), 'someId')).toEqual(null);
    expect(getTasksByPlanId(store.getState(), 'someId')).toEqual([]);
    expect(getTasksByGoalId(store.getState(), 'someId')).toEqual([]);
    expect(getStructuresByJurisdictionId(store.getState(), 'someId')).toEqual([]);
    expect(getTasksByJurisdictionId(store.getState(), 'someId')).toEqual([]);
    expect(getTasksByStructureId(store.getState(), 'someId')).toEqual([]);
    expect(getTasksByPlanAndJurisdiction(store.getState(), 'a', 'b')).toEqual([]);
    expect(getTasksByPlanAndGoalAndJurisdiction(store.getState(), 'a', 'b', 'c')).toEqual([]);
  });

  it('should fetch tasks', () => {
    store.dispatch(fetchTasks(cloneDeep(fixtures.tasks)));
    const expected = keyBy(fixtures.coloredTasks, (task: Task) => task.task_identifier);
    expect(getTasksById(store.getState())).toEqual(expected);
    expect(getTasksIdArray(store.getState())).toEqual(fixtures.taskIdsArray);
    expect(getTasksArray(store.getState())).toEqual(values(expected));
    expect(getTaskById(store.getState(), '01d0b84c-df06-426c-a272-6858e84fea31')).toEqual(
      fixtures.coloredTasks.task4
    );
    expect(getTasksByPlanId(store.getState(), '10f9e9fa-ce34-4b27-a961-72fab5206ab6')).toEqual([
      fixtures.coloredTasks.task1,
      fixtures.coloredTasks.task2,
      fixtures.coloredTasks.task4,
    ]);
    expect(getTasksByGoalId(store.getState(), 'RACD_bednet_dist_1km_radius')).toEqual([
      fixtures.coloredTasks.task2,
    ]);
    expect(getTasksByJurisdictionId(store.getState(), '3952')).toEqual([
      fixtures.coloredTasks.task3,
    ]);
    expect(
      getStructuresByJurisdictionId(store.getState(), '450fc15b-5bd2-468a-927a-49cb10d3bcac')
    ).toEqual([fixtures.coloredTasks.task1, fixtures.coloredTasks.task2]);
    expect(getTasksByStructureId(store.getState(), 'a19eeb63-45d0-4744-9a9d-76d0694103f6')).toEqual(
      [fixtures.coloredTasks.task1]
    );
    expect(
      getTasksByPlanAndJurisdiction(
        store.getState(),
        '356b6b84-fc36-4389-a44a-2b038ed2f38d',
        '3952'
      )
    ).toEqual([fixtures.coloredTasks.task3]);
    expect(
      getTasksByPlanAndGoalAndJurisdiction(
        store.getState(),
        '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
        'RACD_blood_screening_1km_radius',
        '450fc15b-5bd2-468a-927a-49cb10d3bcac'
      )
    ).toEqual([fixtures.coloredTasks.task4]);
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
            color: '#FFCA16',
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

// goeJSON Feature Collection selectors tests
describe('reducers/tasks/FeatureCollectionSelectors', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  afterEach(() => {
    store.dispatch(resetTasks());
  });

  it('works for initial state', () => {
    const expected: FeatureCollection<InitialTaskGeoJSON> = {
      features: [],
      type: 'FeatureCollection',
    };
    const placebo = 'randomId';
    expect(getAllFC(store.getState())).toEqual(expected);
    expect(getFCByGoalId(store.getState(), placebo)).toEqual(expected);
    expect(getFCByPlanAndGoalAndJurisdiction(store.getState(), placebo, placebo, placebo)).toEqual(
      expected
    );
    expect(getFCByJurisdictionId(store.getState(), placebo)).toEqual(expected);
    expect(getFCByPlanId(store.getState(), placebo)).toEqual(expected);
    expect(getFCByPlanAndJurisdiction(store.getState(), placebo, placebo)).toEqual(expected);
    expect(getFCByStructureId(store.getState(), placebo)).toEqual(expected);
  });

  it('gets all tasks as Feature Collection', () => {
    store.dispatch(fetchTasks([fixtures.task1, fixtures.task2]));
    const expected: FeatureCollection<InitialTaskGeoJSON> = {
      features: [fixtures.task1.geojson, fixtures.task2.geojson],
      type: 'FeatureCollection',
    };
    expect(getAllFC(store.getState())).toEqual(expected);
  });

  it('filters tasks as FeatureCollection by plan', () => {
    store.dispatch(fetchTasks(fixtures.tasks));
    const planId = '356b6b84-fc36-4389-a44a-2b038ed2f38d';
    const expected: FeatureCollection<InitialTaskGeoJSON> = {
      features: [fixtures.task3.geojson],
      type: 'FeatureCollection',
    };
    expect(getFCByPlanId(store.getState(), planId)).toEqual(expected);
  });

  it('filters tasks as FeatureCollection by goal', () => {
    store.dispatch(fetchTasks(fixtures.tasks));
    const goalId = 'RACD_blood_screening_1km_radius';
    const expected: FeatureCollection<InitialTaskGeoJSON> = {
      features: [fixtures.task4.geojson],
      type: 'FeatureCollection',
    };
    expect(getFCByGoalId(store.getState(), goalId)).toEqual(expected);
  });

  it('filters tasks as FeatureCollection by jurisdiction', () => {
    store.dispatch(fetchTasks(fixtures.tasks));
    const JurisdictionId = '450fc15b-5bd2-468a-927a-49cb10d3bcac';
    const expected: FeatureCollection<InitialTaskGeoJSON> = {
      features: [fixtures.task1.geojson, fixtures.task2.geojson, fixtures.task4.geojson],
      type: 'FeatureCollection',
    };
    expect(getFCByJurisdictionId(store.getState(), JurisdictionId)).toEqual(expected);
  });

  it('filters tasks as structures FeatureCollection by jurisdiction', () => {
    store.dispatch(fetchTasks(fixtures.tasks));
    const JurisdictionId = '450fc15b-5bd2-468a-927a-49cb10d3bcac';
    const expected: FeatureCollection<InitialTaskGeoJSON> = {
      features: [fixtures.task1.geojson, fixtures.task2.geojson],
      type: 'FeatureCollection',
    };
    expect(getStructuresFCByJurisdictionId(store.getState(), JurisdictionId)).toEqual(expected);
  });

  it('filters tasks as FeatureCollection by plan && jurisdiction', () => {
    store.dispatch(fetchTasks(fixtures.tasks));
    const planId = '10f9e9fa-ce34-4b27-a961-72fab5206ab6';
    const jurisdictionId = '450fc15b-5bd2-468a-927a-49cb10d3bcac';
    const expected: FeatureCollection<InitialTaskGeoJSON> = {
      features: [fixtures.task1.geojson, fixtures.task2.geojson, fixtures.task4.geojson],
      type: 'FeatureCollection',
    };
    expect(getFCByPlanAndJurisdiction(store.getState(), planId, jurisdictionId)).toEqual(expected);
  });

  it('filters tasks as FeatureCollection by plan && jurisdiction && goal', () => {
    store.dispatch(fetchTasks(fixtures.tasks));
    const planId = '10f9e9fa-ce34-4b27-a961-72fab5206ab6';
    const jurisdictionId = '450fc15b-5bd2-468a-927a-49cb10d3bcac';
    const goalId = 'RACD_bednet_dist_1km_radius';

    const expected: FeatureCollection<InitialTaskGeoJSON> = {
      features: [fixtures.task2.geojson],
      type: 'FeatureCollection',
    };
    expect(
      getFCByPlanAndGoalAndJurisdiction(store.getState(), planId, goalId, jurisdictionId)
    ).toEqual(expected);
  });

  it('filters tasks as FeatureCollection by structure', () => {
    store.dispatch(fetchTasks(fixtures.tasks));
    const structureId = 'a19eeb63-45d0-4744-9a9d-76d0694103f6';
    const expected = {
      features: [fixtures.task1.geojson],
      type: 'FeatureCollection',
    };
    expect(getFCByStructureId(store.getState(), structureId)).toEqual(expected);
  });

  it('filters out tasks with null geoms', () => {
    const thisTasks = cloneDeep(fixtures.tasks);
    store.dispatch(fetchTasks(thisTasks));
    const expected = [fixtures.task1.geojson, fixtures.task2.geojson, fixtures.task3.geojson];
    expect(getTasksGeoJsonData(store.getState(), false)).toEqual(expected);
  });
});
