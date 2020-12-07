import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../../../../index';
import reducer, {
  FetchIRSDistricts,
  getAllIRSDistrictsByIds,
  getIRSDistrictArrayByDistrictId,
  getIRSDistrictArrayByDistrictName,
  getIRSDistrictArrayByPlanId,
  IRSDistrictPerformance,
  IRSDistrictsArrayBaseSelector,
  makeIRSDistrictArraySelector,
  reducerName,
  removeIRSDistricts,
} from '../districtReport';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

// reselect selector
const IRSDistrictsArraySelector = makeIRSDistrictArraySelector();

describe('reducers/opensrp/performanceReport/districtReport', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeIRSDistricts());
  });

  it('should have initial state', () => {
    expect(getAllIRSDistrictsByIds(store.getState())).toEqual({});
    expect(IRSDistrictsArrayBaseSelector(store.getState())).toEqual([]);
    expect(IRSDistrictsArraySelector(store.getState(), {})).toEqual([]);
  });

  it('should fetch district reports', () => {
    store.dispatch(FetchIRSDistricts(fixtures.districtsReport));
    const allDistricts = keyBy(
      fixtures.districtsReport,
      (district: IRSDistrictPerformance) => district.id
    );

    expect(getAllIRSDistrictsByIds(store.getState())).toEqual(allDistricts);

    expect(IRSDistrictsArrayBaseSelector(store.getState())).toEqual(fixtures.districtsReport);

    // RESELECT TESTS

    // get districts by id
    expect(getIRSDistrictArrayByDistrictId()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSDistrictArrayByDistrictId()(store.getState(), {
        district_id: fixtures.districtsReport[0].district_id,
      })
    ).toEqual(values(allDistricts));
    expect(getIRSDistrictArrayByDistrictId()(store.getState(), { district_id: 'someId' })).toEqual(
      []
    );

    // get district by plan id
    expect(getIRSDistrictArrayByPlanId()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSDistrictArrayByPlanId()(store.getState(), {
        plan_id: fixtures.districtsReport[0].plan_id,
      })
    ).toEqual([fixtures.districtsReport[0]]);

    // get districts by name
    expect(getIRSDistrictArrayByDistrictName()(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      getIRSDistrictArrayByDistrictName()(store.getState(), { district_name: '2020' })
    ).toEqual([fixtures.districtsReport[0]]);

    // IRSDistrictsArraySelector
    expect(IRSDistrictsArraySelector(store.getState(), {})).toEqual(values(allDistricts));
    expect(
      IRSDistrictsArraySelector(store.getState(), {
        district_id: fixtures.districtsReport[0].district_id,
      })
    ).toEqual(values(allDistricts));

    expect(
      IRSDistrictsArraySelector(store.getState(), {
        plan_id: fixtures.districtsReport[0].plan_id,
      })
    ).toEqual([fixtures.districtsReport[0]]);

    expect(
      IRSDistrictsArraySelector(store.getState(), {
        district_name: '2019',
      })
    ).toEqual([fixtures.districtsReport[1]]);
  });
});
