import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../../../../index';
import reducer, {
  FetchIRSSOPs,
  getAllIRSSOPsByIds,
  getIRSSOPArrayByCollector,
  getIRSSOPArrayByDistrictId,
  getIRSSOPArrayByPlanId,
  getIRSSOPArrayBySOP,
  IRSSOPPerformance,
  IRSSOPsArrayBaseSelector,
  makeIRSSOPArraySelector,
  reducerName,
  removeIRSSOPs,
} from '../sopReport';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

// reselect selector
const IRSSOPArraySelector = makeIRSSOPArraySelector();

describe('reducers/opensrp/performanceReport/sopReport', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeIRSSOPs());
  });

  it('should have initial state', () => {
    expect(getAllIRSSOPsByIds(store.getState())).toEqual({});
    expect(IRSSOPsArrayBaseSelector(store.getState())).toEqual([]);
    expect(IRSSOPArraySelector(store.getState(), {})).toEqual([]);
  });

  it('should fetch district reports', () => {
    store.dispatch(FetchIRSSOPs(fixtures.sopReport));
    const allDistricts = keyBy(fixtures.sopReport, (district: IRSSOPPerformance) => district.id);

    expect(getAllIRSSOPsByIds(store.getState())).toEqual(allDistricts);

    expect(IRSSOPsArrayBaseSelector(store.getState())).toEqual(values(allDistricts));

    // RESELECT TESTS

    // get SOPs by district id
    expect(getIRSSOPArrayByDistrictId()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSSOPArrayByDistrictId()(store.getState(), {
        district_id: fixtures.sopReport[0].district_id,
      })
    ).toEqual(values(allDistricts));
    expect(getIRSSOPArrayByDistrictId()(store.getState(), { district_id: 'someId' })).toEqual([]);

    // get SOPs by plan id
    expect(getIRSSOPArrayByPlanId()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSSOPArrayByPlanId()(store.getState(), {
        plan_id: fixtures.sopReport[0].plan_id,
      })
    ).toEqual([fixtures.sopReport[0]]);

    // get SOPs by data collector
    expect(getIRSSOPArrayByCollector()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSSOPArrayByCollector()(store.getState(), {
        data_collector: fixtures.sopReport[0].data_collector,
      })
    ).toEqual([fixtures.sopReport[0]]);

    // get SOPs by title
    expect(getIRSSOPArrayBySOP()(store.getState(), {})).toEqual(values(allDistricts));
    expect(getIRSSOPArrayBySOP()(store.getState(), { sop: 'Chomba' })).toEqual([
      fixtures.sopReport[0],
    ]);

    // IRSSOPArraySelector
    expect(IRSSOPArraySelector(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      IRSSOPArraySelector(store.getState(), {
        district_id: fixtures.sopReport[0].district_id,
      })
    ).toEqual(values(allDistricts));

    expect(
      IRSSOPArraySelector(store.getState(), {
        plan_id: fixtures.sopReport[0].plan_id,
      })
    ).toEqual([fixtures.sopReport[0]]);

    expect(
      IRSSOPArraySelector(store.getState(), {
        data_collector: fixtures.sopReport[1].data_collector,
      })
    ).toEqual([fixtures.sopReport[1]]);

    expect(
      IRSSOPArraySelector(store.getState(), {
        sop: 'illunga',
      })
    ).toEqual([fixtures.sopReport[1]]);
  });
});
