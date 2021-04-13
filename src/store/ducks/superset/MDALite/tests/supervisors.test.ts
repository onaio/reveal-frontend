import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import store from '../../../../';
import reducer, {
  fetchMDALiteSupervisors,
  getMDALiteSupervisorById,
  getMDALiteSupervisorsArrayByName,
  getMDALiteSupervisorsArrayByPlanId,
  getMDALiteSupervisorsArrayByWardId,
  makeMDALiteSupervisorsArraySelector,
  MDALiteSupervisor,
  reducerName,
  removeMDALiteSupervisors,
} from '../supervisors';
import { MDALiteSupervisorData } from './fixtures';

reducerRegistry.register(reducerName, reducer);

const MDALiteSupervisorsSelector = makeMDALiteSupervisorsArraySelector();

describe('reducers/MDA-Lite/supervisors', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(MDALiteSupervisorsSelector(store.getState(), {})).toEqual([]);
    expect(getMDALiteSupervisorById(store.getState(), 'test-id')).toEqual(null);
  });

  it('Fetches supervisor data correctly', () => {
    // action creators dispatch
    store.dispatch(fetchMDALiteSupervisors(MDALiteSupervisorData as MDALiteSupervisor[]));

    expect(
      getMDALiteSupervisorById(store.getState(), '13890722-db5d-53a6-a930-a9fb04c7bcc3')
    ).toEqual(MDALiteSupervisorData[0]);

    // RESELECT TESTS
    expect(
      getMDALiteSupervisorsArrayByName()(store.getState(), {
        supervisor_name: 'UHS3:UpperHillWard',
      })
    ).toEqual([MDALiteSupervisorData[1]]);
    expect(
      getMDALiteSupervisorsArrayByPlanId()(store.getState(), {
        plan_id: '5e396185-6094-4817-9dd4-24bcbbc698b0',
      })
    ).toEqual([MDALiteSupervisorData[0], MDALiteSupervisorData[1]]);
    expect(
      getMDALiteSupervisorsArrayByWardId()(store.getState(), {
        base_entity_id: '6cb96ec5-a89f-4eb6-bb5e-83692687095e',
      })
    ).toEqual([MDALiteSupervisorData[2]]);

    expect(
      MDALiteSupervisorsSelector(store.getState(), {
        plan_id: '28713d21-d4f9-49b7-aab7-b07838fb086f',
      })
    ).toEqual([MDALiteSupervisorData[2]]);
    expect(
      MDALiteSupervisorsSelector(store.getState(), {
        supervisor_name: 'onyx',
      })
    ).toEqual([]);
    expect(
      MDALiteSupervisorsSelector(store.getState(), {
        base_entity_id: '9ec52632-7bfb-40f5-9ef7-8804627a65cb',
        supervisor_name: 'UHS3:UpperHillWard',
      })
    ).toEqual([MDALiteSupervisorData[1]]);

    // reset
    store.dispatch(removeMDALiteSupervisors());
    expect(MDALiteSupervisorsSelector(store.getState(), {})).toEqual([]);
  });
});
