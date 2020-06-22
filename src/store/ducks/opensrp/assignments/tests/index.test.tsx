import reducerRegistry from '@onaio/redux-reducer-registry';
import MockDate from 'mockdate';
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
    MockDate.set('12/30/2019', 0);
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

  it('does not override existing Assignments with newly fetched', () => {
    store.dispatch(fetchAssignments([fixtures.assignment5])); // not alpha plan

    store.dispatch(fetchAssignments([fixtures.assignments[0]]));
    let assignmentsNum = getAssignmentsArrayByPlanId(store.getState(), 'alpha').length;
    expect(assignmentsNum).toEqual(1);

    store.dispatch(fetchAssignments([fixtures.assignments[1]]));
    assignmentsNum = getAssignmentsArrayByPlanId(store.getState(), 'alpha').length;
    expect(assignmentsNum).toEqual(2);

    store.dispatch(fetchAssignments([fixtures.assignments[2]]));
    assignmentsNum = getAssignmentsArrayByPlanId(store.getState(), 'alpha').length;
    expect(assignmentsNum).toEqual(3);

    store.dispatch(fetchAssignments([fixtures.assignment6]));
    assignmentsNum = getAssignmentsArrayByPlanId(store.getState(), 'alpha').length;
    expect(assignmentsNum).toEqual(2);

    expect(getAssignmentsArrayByPlanId(store.getState(), 'alpha')).toEqual([
      fixtures.assignments[1],
      fixtures.assignments[2],
    ]);

    store.dispatch(fetchAssignments([fixtures.assignment7]));
    assignmentsNum = getAssignmentsArrayByPlanId(store.getState(), 'alpha').length;
    expect(assignmentsNum).toEqual(3);

    expect(getAssignmentsArrayByPlanId(store.getState(), 'alpha')).toEqual([
      fixtures.assignment7,
      fixtures.assignments[2],
      fixtures.assignments[1],
    ]);

    expect(getAssignmentsArrayByPlanId(store.getState(), 'beta').length).toEqual(1);
  });

  it('is able to overwrite existing Assignments with newly fetched', () => {
    store.dispatch(fetchAssignments([fixtures.assignments[0]]));
    let assignmentsNum = getAssignmentsArrayByPlanId(store.getState(), 'alpha').length;
    expect(assignmentsNum).toEqual(1);

    store.dispatch(fetchAssignments([fixtures.assignments[1]], true));
    assignmentsNum = getAssignmentsArrayByPlanId(store.getState(), 'alpha').length;
    expect(assignmentsNum).toEqual(1);
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
