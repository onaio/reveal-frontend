import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import store from '../../..';
import reducer, {
  FetchMDAPointChildReportAction,
  getJurisdictionId,
  makeMDAPointChildReportsArraySelector,
  MDAPointChildReportsArrayBaseSelector,
  reducerName,
  removeMDAPointChildReports,
} from '../MDAChildReport';
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
      MDAPointChildReportsArrayBaseSelector('40357eff-81b6-4e32-bd3d-484019689f7c')(
        store.getState()
      )
    ).toEqual([]);
  });

  it('Fetches child reports correctly', () => {
    const { MDAPointChildReportData } = fixtures;
    store.dispatch(FetchMDAPointChildReportAction(MDAPointChildReportData));

    const MDAPointSchoolReportsArraySelector = makeMDAPointChildReportsArraySelector(
      '40357eff-81b6-4e32-bd3d-484019689f7c'
    );

    expect(getJurisdictionId(store.getState(), {})).toEqual(undefined);

    expect(getJurisdictionId(store.getState(), { jurisdiction_id: '3951' })).toEqual('3951');

    expect(
      MDAPointChildReportsArrayBaseSelector('40357eff-81b6-4e32-bd3d-484019689f7c')(
        store.getState()
      )
    ).toEqual([MDAPointChildReportData[0], MDAPointChildReportData[1]]);

    expect(MDAPointSchoolReportsArraySelector(store.getState(), {})).toEqual([
      MDAPointChildReportData[0],
      MDAPointChildReportData[1],
    ]);

    expect(
      MDAPointSchoolReportsArraySelector(store.getState(), { jurisdiction_id: '3951' })
    ).toEqual([MDAPointChildReportData[0], MDAPointChildReportData[1]]);

    // clear store
    store.dispatch(removeMDAPointChildReports());
    expect(MDAPointSchoolReportsArraySelector(store.getState(), {})).toEqual([]);
  });
});
