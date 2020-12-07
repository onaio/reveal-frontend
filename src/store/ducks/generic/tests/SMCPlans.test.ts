import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import store from '../../..';
import { PlanStatus } from '../../plans';
import reducer, {
  fetchSMCPlans,
  getSMCPlanById,
  getSMCPlansArrayByStatus,
  getSMCPlansArrayByTitle,
  makeSMCPlansArraySelector,
  reducerName,
  removeSMCPlans,
  SMCPlansArrayBaseSelector,
  SMCPLANType,
} from '../SMCPlans';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

const SMCPlansSelector = makeSMCPlansArraySelector();
const defaultProps = {};

describe('reducers/generic/SMCPlans', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(SMCPlansSelector(store.getState(), defaultProps)).toEqual([]);
    expect(getSMCPlanById(store.getState(), fixtures.SMCPlans[0].plan_id)).toEqual(null);
  });

  it('Fetches plan definitions correctly', () => {
    // action creators dispatch
    store.dispatch(fetchSMCPlans(fixtures.SMCPlans as SMCPLANType[]));

    expect(getSMCPlanById(store.getState(), '262526a3-fe86-4cb5-a743-f26db7ff3ce0')).toEqual(
      fixtures.SMCPlans[2]
    );

    expect(SMCPlansArrayBaseSelector(store.getState())).toEqual(fixtures.SMCPlans);

    // RESELECT TESTS
    const statusTypeFilter = {
      statusList: [PlanStatus.DRAFT],
    };
    expect(SMCPlansSelector(store.getState(), statusTypeFilter)).toEqual([fixtures.SMCPlans[2]]);
    expect(getSMCPlansArrayByStatus()(store.getState(), statusTypeFilter)).toEqual([
      fixtures.SMCPlans[2],
    ]);

    const titleFilter = {
      plan_title: 'Dynamic-',
    };
    expect(SMCPlansSelector(store.getState(), titleFilter)).toEqual([fixtures.SMCPlans[0]]);
    expect(getSMCPlansArrayByTitle()(store.getState(), titleFilter)).toEqual([
      fixtures.SMCPlans[0],
    ]);

    const statusAndTitleFilter = {
      plan_title: 'nigeria',
      statusList: [PlanStatus.ACTIVE],
    };
    expect(SMCPlansSelector(store.getState(), statusAndTitleFilter)).toEqual([
      fixtures.SMCPlans[1],
    ]);
  });

  it('clears SMC plans from store', () => {
    // confirm there are SMC plans in store
    expect(SMCPlansArrayBaseSelector(store.getState())).toEqual(fixtures.SMCPlans);

    store.dispatch(removeSMCPlans());
    expect(SMCPlansSelector(store.getState(), defaultProps)).toEqual([]);
  });
});
