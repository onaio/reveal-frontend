import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import store from '../../..';
import reducer, {
  FetchMDAPointLocationReportAction,
  getJurisdictionId,
  makeMDAPointLocationReportsArraySelector,
  MDAPointLocationReportsArrayBaseSelector,
  reducerName,
  removeMDAPointLocationReports,
} from '../MDALocationsReport';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/MDAPoint/MDAPointPlan', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(
      MDAPointLocationReportsArrayBaseSelector('40357eff-81b6-4e32-bd3d-484019689f7c')(
        store.getState()
      )
    ).toEqual([]);
  });

  it('Fetches school reports correctly', () => {
    const { MDAPointSchoolReportData } = fixtures;
    store.dispatch(FetchMDAPointLocationReportAction(MDAPointSchoolReportData));

    const MDAPointSchoolReportsArraySelector = makeMDAPointLocationReportsArraySelector(
      '40357eff-81b6-4e32-bd3d-484019689f7c'
    );

    expect(getJurisdictionId(store.getState(), {})).toEqual(undefined);

    expect(getJurisdictionId(store.getState(), { jurisdiction_id: '3951' })).toEqual('3951');

    expect(
      MDAPointLocationReportsArrayBaseSelector('9f19b77c-b9a5-5832-a4e5-4b461d18fce7')(
        store.getState()
      )
    ).toEqual([MDAPointSchoolReportData[3], MDAPointSchoolReportData[4]]);

    expect(
      MDAPointLocationReportsArrayBaseSelector('40357eff-81b6-4e32-bd3d-484019689f7c')(
        store.getState()
      )
    ).toEqual([
      MDAPointSchoolReportData[0],
      MDAPointSchoolReportData[1],
      MDAPointSchoolReportData[2],
    ]);

    expect(MDAPointSchoolReportsArraySelector(store.getState(), {})).toEqual([
      MDAPointSchoolReportData[0],
      MDAPointSchoolReportData[1],
      MDAPointSchoolReportData[2],
    ]);

    expect(
      MDAPointSchoolReportsArraySelector(store.getState(), { jurisdiction_id: '3951' })
    ).toEqual([MDAPointSchoolReportData[0], MDAPointSchoolReportData[1]]);

    // clear store
    store.dispatch(removeMDAPointLocationReports());
    expect(MDAPointSchoolReportsArraySelector(store.getState(), {})).toEqual([]);
  });
});
