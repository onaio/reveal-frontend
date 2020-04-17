/** Assignments redux module */
import { Dictionary } from '@onaio/utils';
import { get } from 'lodash';
import { Store } from 'redux';
import { AnyAction } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { setDefaultValues } from '../../../../helpers/utils';

/** The reducer name */
export const reducerName = 'assignments';

/** interface for a Assignment object */
export interface Assignment {
  jurisdiction: string;
  organization: string;
  plan: string;
  fromDate: string;
  toDate: string;
}

// action interfaces

/** action type for action that adds Assignments to store */
export const ASSIGNMENTS_FETCHED = 'src/store/ducks/assignments/reducer/ASSIGNMENTS_FETCHED';
/** action type for REMOVE_TEAMS action */
export const REMOVE_ASSIGNMENTS = 'src/store/ducks/assignments/reducer/REMOVE_ASSIGNMENTS';

/** interface for Assignments fetched action */
interface FetchAssignmentsAction extends AnyAction {
  assignmentsByPlanId: { [key: string]: Assignment[] };
  type: typeof ASSIGNMENTS_FETCHED;
}

/** interface for action that removes assignments from store */
interface RemoveAssignmentsAction extends AnyAction {
  assignmentsByPlanId: { [key: string]: Assignment[] };
  type: typeof REMOVE_ASSIGNMENTS;
}

/** single type for all action types */
type AssignmentActionTypes = FetchAssignmentsAction | RemoveAssignmentsAction | AnyAction;

/** interface describing the assignmentsByPlanId Store */
interface AssignmentsByPlanId {
  [key: string]: Assignment[];
}
/** interface for Assignments state in store */
interface AssignmentsStoreState {
  assignmentsByPlanId: AssignmentsByPlanId | {};
}

// immutable assignments state in dux
export type ImmutableAssignmentsStoreState = AssignmentsStoreState &
  SeamlessImmutable.ImmutableObject<AssignmentsStoreState>;

/** initial state for Assignments records in store */
const initialOrgsStoreState: ImmutableAssignmentsStoreState = SeamlessImmutable({
  assignmentsByPlanId: {},
});

/** the Assignment reducer function */
export default function reducer(state = initialOrgsStoreState, action: AssignmentActionTypes) {
  switch (action.type) {
    case ASSIGNMENTS_FETCHED:
      return SeamlessImmutable({
        ...state,
        assignmentsByPlanId: {
          ...state.assignmentsByPlanId,
          ...action.assignmentsByPlanId,
        },
      });
    case REMOVE_ASSIGNMENTS:
      return SeamlessImmutable({
        ...state,
        assignmentsByPlanId: action.assignmentsByPlanId,
      });
    default:
      return state;
  }
}

/** action to remove assignments form store */
export const removeAssignmentsAction: RemoveAssignmentsAction = {
  assignmentsByPlanId: {},
  type: REMOVE_ASSIGNMENTS,
};

// action creators

/** creates action to add fetched assignments to store
 * @param {Assignment []} assignmentsList - array of assignments to be added to store
 *
 * @returns {FetchAssignmentsAction} - action with assignments payload that is added to store
 */
export const fetchAssignments = (assignmentsList: Assignment[]): FetchAssignmentsAction => {
  // const assignmentsByPlanId: AssignmentsByPlanId = {};
  const defaultArrayAssignmentHandler: ProxyHandler<object> = {
    /**
     * The methods inside the handler object are called traps for our case we use a get trap
     * @param {AssignmentsByPlanId} target
     * @param {string} plan planId the assignmentsByPlanId will be updated by empty arrays keyed by the planId
     */
    get: (target: AssignmentsByPlanId, plan: string) => {
      /**
       * Check if the planId already exists then return the target else add the key with an empty array value
       */
      return setDefaultValues(target, plan);
    },
  };

  let assignmentsByPlanId: AssignmentsByPlanId = {};
  /**
   * Todo:Research on a solution  for Typescript can't infer types when using Proxy
   */
  /**
   * A JavaScript Proxy is an object that wraps another object (target) and intercepts the fundamental operations of the target object
   * @param {AssignmentsByPlanId} assignmentsByPlanId target(is an object to wrap) initial value is an empty object
   * @param {ProxyHandler<object>} defaultArrayAssignmentHandler  object that contains methods to control the behaviors of the target
   */
  const assignmentsByPlanIdProxy = new Proxy(
    assignmentsByPlanId,
    defaultArrayAssignmentHandler
  ) as Dictionary;
  for (const assignment of assignmentsList) {
    assignmentsByPlanId = assignmentsByPlanIdProxy[assignment.plan];
    assignmentsByPlanId[assignment.plan].push(assignment);
  }
  return {
    assignmentsByPlanId,
    type: ASSIGNMENTS_FETCHED,
  };
};

/** creates action to reset plan
 * @param {AssignmentsByPlanId} assignmentsByPlanId object with updated assignment arrays, keyed by planId
 * @returns {FetchAssignmentsAction}
 */
export const resetPlanAssignments = (
  assignmentsByPlanId: AssignmentsByPlanId = {}
): FetchAssignmentsAction => {
  return {
    assignmentsByPlanId,
    type: ASSIGNMENTS_FETCHED,
  };
};

// selectors

/** get assignments as an object where their ids are the keys and the objects
 * the values
 * @param {Partial<Store>} state - Portion of the store
 *
 * @return {[key: string]: Assignment}
 */
export function getAssignmentsByPlanId(state: Partial<Store>): { [key: string]: Assignment[] } {
  return (state as any)[reducerName].assignmentsByPlanId;
}

/** Get all assignments as an array
 * @param {Partial<Store>} state - Part of the redux store
 * @param {string} planId - The id of the plan of which to return associated Assignments
 *
 * @return {Assignment []} - all assignments by planId in store as an array
 */
export function getAssignmentsArrayByPlanId(state: Partial<Store>, planId: string): Assignment[] {
  return get(getAssignmentsByPlanId(state), planId) || [];
}

/** Get all assignments by plan id and by jurisdiction id
 * @param {Partial<Store>} state - Part of the redux store
 * @param {string} planId - The id of the plan of which to return associated Assignments
 * @param {string} jurisdictionId = The id of the jurisdiction of which to return associated Assignments
 *
 * @return {Assignment []} - all assignments by planId in store as an array
 */
export function getAssignmentsArrayByPlanIdByJurisdictionId(
  state: Partial<Store>,
  planId: string,
  jurisdictionId: string
): Assignment[] {
  return getAssignmentsArrayByPlanId(state, planId).filter(
    (a: Assignment) => a.jurisdiction === jurisdictionId
  );
}
