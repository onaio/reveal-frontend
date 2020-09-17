import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../../../../index';
import reducer, {
  FetchIRSDataCollectors,
  getAllIRSCollectorsByIds,
  getIRSCollectorArrayByDistrictId,
  getIRSCollectorArrayByName,
  getIRSCollectorArrayByPlanId,
  IRSCollectorPerformance,
  IRSCollectorsArrayBaseSelector,
  makeIRSCollectorArraySelector,
  reducerName,
  removeIRSDataCollectors,
} from '../dataCollectorReport';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

// reselect selector
const IRSDataCollectorArraySelector = makeIRSCollectorArraySelector();

describe('reducers/opensrp/performanceReport/dataCollectorReport', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeIRSDataCollectors());
  });

  it('should have initial state', () => {
    expect(getAllIRSCollectorsByIds(store.getState())).toEqual({});
    expect(IRSCollectorsArrayBaseSelector(store.getState())).toEqual([]);
    expect(IRSDataCollectorArraySelector(store.getState(), {})).toEqual([]);
  });

  it('should fetch district reports', () => {
    store.dispatch(FetchIRSDataCollectors(fixtures.dataCollectorsReport));
    const allDistricts = keyBy(
      fixtures.dataCollectorsReport,
      (district: IRSCollectorPerformance) => district.id
    );

    expect(getAllIRSCollectorsByIds(store.getState())).toEqual(allDistricts);

    expect(IRSCollectorsArrayBaseSelector(store.getState())).toEqual(fixtures.dataCollectorsReport);

    // RESELECT TESTS

    // get data collectors by id
    expect(getIRSCollectorArrayByDistrictId()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSCollectorArrayByDistrictId()(store.getState(), {
        district_id: fixtures.dataCollectorsReport[0].district_id,
      })
    ).toEqual(values(allDistricts));
    expect(getIRSCollectorArrayByDistrictId()(store.getState(), { district_id: 'someId' })).toEqual(
      []
    );

    // get data collectors by plan id
    expect(getIRSCollectorArrayByPlanId()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSCollectorArrayByPlanId()(store.getState(), {
        plan_id: fixtures.dataCollectorsReport[0].plan_id,
      })
    ).toEqual([fixtures.dataCollectorsReport[0]]);

    // get data collectors by title
    expect(getIRSCollectorArrayByName()(store.getState(), {})).toEqual(values(allDistricts));
    expect(getIRSCollectorArrayByName()(store.getState(), { data_collector: 'Mulubwa' })).toEqual([
      fixtures.dataCollectorsReport[0],
    ]);

    // IRSDataCollectorArraySelector
    expect(IRSDataCollectorArraySelector(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      IRSDataCollectorArraySelector(store.getState(), {
        district_id: fixtures.dataCollectorsReport[0].district_id,
      })
    ).toEqual(values(allDistricts));

    expect(
      IRSDataCollectorArraySelector(store.getState(), {
        plan_id: fixtures.dataCollectorsReport[0].plan_id,
      })
    ).toEqual([fixtures.dataCollectorsReport[0]]);

    expect(
      IRSDataCollectorArraySelector(store.getState(), {
        data_collector: 'Romeo',
      })
    ).toEqual([fixtures.dataCollectorsReport[1]]);
  });
});
