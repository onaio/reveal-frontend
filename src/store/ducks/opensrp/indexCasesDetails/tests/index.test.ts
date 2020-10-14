import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  fetchIndexCaseDetails,
  getAllIndexCaseDetailsByIds,
  getIndexCasesArrayByGoalId,
  getIndexCasesArrayByJurisdictionId,
  getIndexCasesArrayByPlanId,
  getIndexCasesArrayByTaskId,
  indexCasesArrayBaseSelector,
  IndexCasesDetails,
  makeIndexCasesArraySelector,
  reducerName,
  removeIndexCaseDetailsAction,
} from '..';
import store from '../../../../index';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

// reselect selector
const indexCasesArraySelector = makeIndexCasesArraySelector();

describe('reducers/opensrp/indexcasesDetails', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeIndexCaseDetailsAction());
  });

  it('should have initial state', () => {
    expect(getAllIndexCaseDetailsByIds(store.getState())).toEqual({});
    expect(indexCasesArrayBaseSelector(store.getState())).toEqual([]);
    expect(indexCasesArraySelector(store.getState(), {})).toEqual([]);
  });

  it('should fetch cases', () => {
    store.dispatch(fetchIndexCaseDetails(fixtures.indexCasesDetails));
    const allIndexCases = keyBy(
      fixtures.indexCasesDetails,
      (indexCases: IndexCasesDetails) => indexCases.id
    );

    expect(getAllIndexCaseDetailsByIds(store.getState())).toEqual(allIndexCases);

    expect(indexCasesArrayBaseSelector(store.getState())).toEqual(fixtures.indexCasesDetails);

    // RESELECT TESTS

    // get case by plan id
    expect(getIndexCasesArrayByPlanId()(store.getState(), {})).toEqual(values(allIndexCases));
    expect(
      getIndexCasesArrayByPlanId()(store.getState(), {
        plan_id: fixtures.indexCasesDetails[0].plan_id,
      })
    ).toEqual([fixtures.indexCasesDetails[0]]);

    // get case by goal id
    expect(getIndexCasesArrayByGoalId()(store.getState(), {})).toEqual(values(allIndexCases));
    expect(
      getIndexCasesArrayByGoalId()(store.getState(), {
        goal_id: fixtures.indexCasesDetails[0].goal_id,
      })
    ).toEqual(fixtures.indexCasesDetails);

    // get case by jurisdiction id
    expect(getIndexCasesArrayByJurisdictionId()(store.getState(), {})).toEqual(
      values(allIndexCases)
    );
    expect(
      getIndexCasesArrayByJurisdictionId()(store.getState(), {
        jurisdiction_id: fixtures.indexCasesDetails[2].jurisdiction_id,
      })
    ).toEqual([fixtures.indexCasesDetails[2]]);

    // get case by task id
    expect(getIndexCasesArrayByTaskId()(store.getState(), {})).toEqual(values(allIndexCases));
    expect(
      getIndexCasesArrayByTaskId()(store.getState(), {
        task_id: fixtures.indexCasesDetails[0].task_id,
      })
    ).toEqual([fixtures.indexCasesDetails[0]]);

    // indexCasesArraySelector
    expect(indexCasesArraySelector(store.getState(), {})).toEqual(values(allIndexCases));
    expect(
      indexCasesArraySelector(store.getState(), {
        goal_id: fixtures.indexCasesDetails[0].goal_id,
        jurisdiction_id: fixtures.indexCasesDetails[0].jurisdiction_id,
        plan_id: fixtures.indexCasesDetails[0].plan_id,
        task_id: fixtures.indexCasesDetails[0].task_id,
      })
    ).toEqual([fixtures.indexCasesDetails[0]]);
  });
});
