import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../../../../index';
import reducer, {
  FetchIRSSOPByDate,
  getAllIRSSOPDateByIds,
  getIRSSOPDateArrayByCollector,
  getIRSSOPDateArrayByDate,
  getIRSSOPDateArrayByDistrictId,
  getIRSSOPDateArrayByPlanId,
  getIRSSOPDateArrayBySOP,
  IRSSOPByDatePerformance,
  IRSSOPDatesBaseSelector,
  makeIRSSODateArraySelector,
  OrderOptions,
  reducerName,
  removeIRSSOPByDate,
} from '../sopByDateReport';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

// reselect selector
const IRSSOPByDateArraySelector = makeIRSSODateArraySelector();

describe('reducers/opensrp/performanceReport/sopByDateReport', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeIRSSOPByDate());
  });

  it('should have initial state', () => {
    expect(getAllIRSSOPDateByIds(store.getState())).toEqual({});
    expect(IRSSOPDatesBaseSelector(store.getState())).toEqual([]);
    expect(IRSSOPByDateArraySelector(store.getState(), {})).toEqual([]);
  });

  it('should fetch district reports', () => {
    store.dispatch(FetchIRSSOPByDate(fixtures.sopByDateReport));
    const allDistricts = keyBy(
      fixtures.sopByDateReport,
      (district: IRSSOPByDatePerformance) => district.id
    );

    expect(getAllIRSSOPDateByIds(store.getState())).toEqual(allDistricts);

    expect(IRSSOPDatesBaseSelector(store.getState())).toEqual(values(allDistricts));

    // RESELECT TESTS

    // get events by district id
    expect(getIRSSOPDateArrayByDistrictId()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSSOPDateArrayByDistrictId()(store.getState(), {
        district_id: fixtures.sopByDateReport[0].district_id,
      })
    ).toEqual(values(allDistricts));
    expect(getIRSSOPDateArrayByDistrictId()(store.getState(), { district_id: 'someId' })).toEqual(
      []
    );

    // get events by plan id
    expect(getIRSSOPDateArrayByPlanId()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSSOPDateArrayByPlanId()(store.getState(), {
        plan_id: fixtures.sopByDateReport[0].plan_id,
      })
    ).toEqual([fixtures.sopByDateReport[0]]);

    // get events by data collector
    expect(getIRSSOPDateArrayByCollector()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSSOPDateArrayByCollector()(store.getState(), {
        data_collector: fixtures.sopByDateReport[0].data_collector,
      })
    ).toEqual([fixtures.sopByDateReport[0]]);

    // get events by sop
    expect(getIRSSOPDateArrayBySOP()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSSOPDateArrayBySOP()(store.getState(), { sop: fixtures.sopByDateReport[0].sop })
    ).toEqual([fixtures.sopByDateReport[0]]);

    // get event by date
    expect(getIRSSOPDateArrayByDate()(store.getState(), {})).toEqual(values(allDistricts));
    expect(getIRSSOPDateArrayByDate()(store.getState(), { date: '25' })).toEqual([
      fixtures.sopByDateReport[0],
    ]);

    // IRSSOPByDateArraySelector
    expect(IRSSOPByDateArraySelector(store.getState(), {})).toEqual(values(allDistricts));
    expect(makeIRSSODateArraySelector(OrderOptions.ascending)(store.getState(), {})).toEqual(
      values(allDistricts)
    );
    const allDistrictsCopy = values({ ...allDistricts });
    expect(makeIRSSODateArraySelector(OrderOptions.descending)(store.getState(), {})).toEqual([
      allDistrictsCopy[1],
      allDistrictsCopy[0],
    ]);
    expect(
      IRSSOPByDateArraySelector(store.getState(), {
        district_id: fixtures.sopByDateReport[0].district_id,
      })
    ).toEqual(values(allDistricts));

    expect(
      IRSSOPByDateArraySelector(store.getState(), {
        plan_id: fixtures.sopByDateReport[0].plan_id,
      })
    ).toEqual([fixtures.sopByDateReport[0]]);

    expect(
      IRSSOPByDateArraySelector(store.getState(), {
        data_collector: fixtures.sopByDateReport[1].data_collector,
      })
    ).toEqual([fixtures.sopByDateReport[1]]);

    expect(
      IRSSOPByDateArraySelector(store.getState(), {
        sop: fixtures.sopByDateReport[1].sop,
      })
    ).toEqual([fixtures.sopByDateReport[1]]);

    expect(
      IRSSOPByDateArraySelector(store.getState(), {
        date: '26',
      })
    ).toEqual([fixtures.sopByDateReport[1]]);
  });
});
