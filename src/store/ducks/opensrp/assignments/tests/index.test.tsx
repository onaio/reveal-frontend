import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  fetchAssignments,
  getAssignmentsArrayByPlanId,
  getAssignmentsArrayByPlanIdByJurisdictionId,
  getAssignmentsByPlanId,
  reducerName,
  removeAssignmentsAction,
  resetPlanAssignments,
} from '..';
import { setDefaultValues } from '../../../../../helpers/utils';
import store from '../../../../index';
import * as fixtures from '../../../tests/fixtures';
reducerRegistry.register(reducerName, reducer);

describe('reducers/assignments', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeAssignmentsAction);
  });

  it('should have initial state', () => {
    expect(getAssignmentsArrayByPlanId(store.getState(), 'randomId')).toEqual([]);
    expect(getAssignmentsByPlanId(store.getState())).toEqual({});
    expect(
      getAssignmentsArrayByPlanIdByJurisdictionId(
        store.getState(),
        'randomId',
        'outpost-number-one'
      )
    ).toEqual([]);
  });

  it('should fetch Assignments', () => {
    store.dispatch(fetchAssignments(fixtures.assignments));
    const planAssignments = getAssignmentsArrayByPlanId(store.getState(), 'alpha');
    expect(planAssignments.length).toBe(4);
    const jurisdictionAssignments = getAssignmentsArrayByPlanIdByJurisdictionId(
      store.getState(),
      'alpha',
      'outpost-number-one'
    );
    expect(jurisdictionAssignments).toEqual([fixtures.assignment1, fixtures.assignment2]);
  });

  it('should reset existing Assignments', () => {
    store.dispatch(fetchAssignments(fixtures.assignments));
    store.dispatch(
      resetPlanAssignments({
        [fixtures.assignment1.plan]: [fixtures.assignment1],
      })
    );
    const assignments = getAssignmentsArrayByPlanId(store.getState(), fixtures.assignment1.plan);
    expect(assignments.length).toBe(1);
  });
  it('should set default value', () => {
    expect(setDefaultValues({}, 'planId')).toEqual({ planId: [] });
  });
});
