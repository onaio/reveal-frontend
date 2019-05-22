import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, {
  fetchTasks,
  getTaskById,
  getTasksArray,
  getTasksById,
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
  });
});
