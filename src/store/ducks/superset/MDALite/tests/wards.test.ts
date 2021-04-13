import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import store from '../../../../';
import reducer, {
  fetchMDALiteWards,
  getMDALiteWardById,
  getMDALiteWardsArrayByName,
  getMDALiteWardsArrayByParentId,
  getMDALiteWardsArrayByPlanId,
  getMDALiteWardsArrayByWardId,
  makeMDALiteWardsArraySelector,
  MDALiteWards,
  reducerName,
  removeMDALiteWards,
} from '../wards';
import { MDALiteWardsData } from './fixtures';

reducerRegistry.register(reducerName, reducer);

const makeMDALiteWardsSelector = makeMDALiteWardsArraySelector();
const defaultProps = {};

describe('reducers/MDA-Lite/wards', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(makeMDALiteWardsSelector(store.getState(), defaultProps)).toEqual([]);
    expect(getMDALiteWardById(store.getState(), 'test-id')).toEqual(null);
  });

  it('Fetches wards data correctly', () => {
    // action creators dispatch
    store.dispatch(fetchMDALiteWards(MDALiteWardsData as MDALiteWards[]));

    expect(getMDALiteWardById(store.getState(), 'a4c3973d-5076-59ea-b2bd-08abbb71894a')).toEqual(
      MDALiteWardsData[0]
    );

    // RESELECT TESTS
    expect(getMDALiteWardsArrayByName()(store.getState(), { ward_name: 'mungoma' })).toEqual([
      MDALiteWardsData[2],
    ]);
    expect(
      getMDALiteWardsArrayByParentId()(store.getState(), {
        parent_id: '3c63f48e-bb86-42e5-b3ff-bc539fbf5295',
      })
    ).toEqual(MDALiteWardsData);
    expect(
      getMDALiteWardsArrayByPlanId()(store.getState(), {
        plan_id: '6b485d4b-1043-40ed-ab8a-c64d24045ada',
      })
    ).toEqual([MDALiteWardsData[1]]);
    expect(
      getMDALiteWardsArrayByWardId()(store.getState(), {
        base_entity_id: '9ec52632-7bfb-40f5-9ef7-8804627a65cb',
      })
    ).toEqual([MDALiteWardsData[2]]);

    expect(
      makeMDALiteWardsSelector(store.getState(), {
        parent_id: '3c63f48e-bb86-42e5-b3ff-bc539fbf5295',
      })
    ).toEqual(MDALiteWardsData);
    expect(
      makeMDALiteWardsSelector(store.getState(), {
        ward_name: 'onyx',
      })
    ).toEqual([]);
    expect(
      makeMDALiteWardsSelector(store.getState(), {
        base_entity_id: '9ec52632-7bfb-40f5-9ef7-8804627a65cb',
        parent_id: '3c63f48e-bb86-42e5-b3ff-bc539fbf5295',
      })
    ).toEqual([MDALiteWardsData[2]]);

    // reset
    store.dispatch(removeMDALiteWards());
    expect(makeMDALiteWardsSelector(store.getState(), defaultProps)).toEqual([]);
  });
});
