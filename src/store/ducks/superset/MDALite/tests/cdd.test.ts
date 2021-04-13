import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import store from '../../../../';
import reducer, {
  fetchMDALiteCDDs,
  getMDALiteCDDById,
  getMDALiteCDDsArrayByName,
  getMDALiteCDDsArrayByPlanId,
  getMDALiteCDDsArrayBySupervisorId,
  getMDALiteCDDsArrayBySupervisorName,
  getMDALiteCDDsArrayByWardId,
  makeMDALiteCDDsArraySelector,
  MDALiteCDDData,
  reducerName,
  removeMDALiteCDDs,
} from '../cdd';
import { MDALiteCDDReportData } from './fixtures';

reducerRegistry.register(reducerName, reducer);

const MDALiteCDDsArraySelector = makeMDALiteCDDsArraySelector();
const defaultProps = {};

describe('reducers/MDA-Lite/wards', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(MDALiteCDDsArraySelector(store.getState(), defaultProps)).toEqual([]);
    expect(getMDALiteCDDById(store.getState(), 'test-id')).toEqual(null);
  });

  it('Fetches wards data correctly', () => {
    // action creators dispatch
    store.dispatch(fetchMDALiteCDDs(MDALiteCDDReportData as MDALiteCDDData[]));

    expect(getMDALiteCDDById(store.getState(), '2d5530cd-0008-5727-ac86-d658441ac750')).toEqual(
      MDALiteCDDReportData[0]
    );

    // RESELECT TESTS
    expect(
      getMDALiteCDDsArrayByName()(store.getState(), { cdd_name: 'UHCDD1:UpperHillWard' })
    ).toEqual([MDALiteCDDReportData[0]]);
    expect(
      getMDALiteCDDsArrayBySupervisorName()(store.getState(), {
        supervisor_name: 'UHS3:UpperHillWard',
      })
    ).toEqual([MDALiteCDDReportData[0], MDALiteCDDReportData[1]]);
    expect(
      getMDALiteCDDsArrayBySupervisorId()(store.getState(), {
        supervisor_id: 'a8c6bbda-4ce1-51fa-b68d-b525a3e4da86',
      })
    ).toEqual([MDALiteCDDReportData[2]]);
    expect(
      getMDALiteCDDsArrayByPlanId()(store.getState(), {
        plan_id: '23da5624-707a-5055-81e8-5a0e6800d7ef',
      })
    ).toEqual([MDALiteCDDReportData[2]]);
    expect(
      getMDALiteCDDsArrayByWardId()(store.getState(), {
        base_entity_id: '6cb96ec5-a89f-4eb6-bb5e-83692687095e',
      })
    ).toEqual([MDALiteCDDReportData[2]]);

    expect(
      MDALiteCDDsArraySelector(store.getState(), {
        supervisor_id: 'a8c6bbda-4ce1-51fa-b68d-b525a3e4da86',
      })
    ).toEqual([MDALiteCDDReportData[2]]);
    expect(
      MDALiteCDDsArraySelector(store.getState(), {
        supervisor_name: 'onyx',
      })
    ).toEqual([]);
    expect(
      MDALiteCDDsArraySelector(store.getState(), {
        base_entity_id: '6cb96ec5-a89f-4eb6-bb5e-83692687095e',
        plan_id: '23da5624-707a-5055-81e8-5a0e6800d7ef',
      })
    ).toEqual([MDALiteCDDReportData[2]]);

    // reset
    store.dispatch(removeMDALiteCDDs());
    expect(MDALiteCDDsArraySelector(store.getState(), defaultProps)).toEqual([]);
  });
});
