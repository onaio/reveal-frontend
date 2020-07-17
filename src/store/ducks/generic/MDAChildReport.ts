import intersect from 'fast_array_intersect';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';

/** the reducer name */
export const reducerName = 'MDAChildReport';

/** Child report interface */
export interface ChildReport {
  id: string;
  plan_id: string;
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_name_path: string[];
  jurisdiction_path: string[];
  jurisdiction_parent_id: string;
  client_first_name: string;
  client_last_name: string;
  sactanationalid: number | string;
  sactacurrenroll: number | string;
  mmadrugadmin: number | string;
  mmanodrugadminreason: number | string;
  mmaadr: number | string;
  mmapzqdosagegiven: number | string;
  mmaalbgiven: number | string;
  [key: string]: any;
}

// actions

/** MDA_CHILD_REPORT_FETCHED action type */
export const MDA_POINT_CHILD_REPORT_FETCHED =
  'reveal/reducer/MDAPoint/MDAChildReport/MDA_Point_CHILD_REPORT_FETCHED';

/** MDA_CHILD_REPORT_FETCHED action type */
export const REMOVE_MDA_CHILD_REPORT_PLANS =
  'reveal/reducer/MDAPoint/MDAChildReport/REMOVE_MDA_POINT_CHILD_REPORT';

/** MDA_CHILD_REPORT_FETCHED action type */
export const ADD_MDA_CHILD_REPORT_PLAN =
  'reveal/reducer/MDAPoint/MDAChildReport/ADD_MDA_CHILD_REPORT';

/** interface for fetch MDAPointChildReport action */
interface FetchMDAPointChildReport extends AnyAction {
  childReportByPlanId: { [key: string]: ChildReport[] };
  type: typeof MDA_POINT_CHILD_REPORT_FETCHED;
}

/** interface for removing MDAPointChildReport action */
interface RemoveMDAPointChildReportAction extends AnyAction {
  childReportByPlanId: { [key: string]: ChildReport[] };
  type: typeof REMOVE_MDA_CHILD_REPORT_PLANS;
}

/** Create type for MDAPointChildReportPlan reducer actions */
export type MDAPointChildReportActionTypes =
  | FetchMDAPointChildReport
  | RemoveMDAPointChildReportAction
  | AnyAction;

/**
 * Fetch Plan Definitions action creator
 * @param childReportList - list of child report objects
 */
export const FetchMDAPointChildReportAction = (
  childReportList: ChildReport[] = []
): FetchMDAPointChildReport => {
  const childReportByPlanId = {};
  childReportList.forEach((report: ChildReport) => {
    (childReportByPlanId as ChildReport)[report.plan_id]
      ? (childReportByPlanId as ChildReport)[report.plan_id].push(report)
      : ((childReportByPlanId as ChildReport)[report.plan_id] = [report]);
  });
  return {
    childReportByPlanId,
    type: MDA_POINT_CHILD_REPORT_FETCHED,
  };
};

/** Reset plan definitions state action creator */
export const removeMDAPointChildReports = () => ({
  childReportByPlanId: {},
  type: REMOVE_MDA_CHILD_REPORT_PLANS,
});

// the reducer

/** interface for MDAPointChildReport state */
interface MDAPointChildReport {
  childReportByPlanId: { [key: string]: ChildReport } | {};
}

/** immutable MDAPointChildReport state */
export type ImmutableChildReportState = SeamlessImmutable.ImmutableObject<MDAPointChildReport> &
  MDAPointChildReport;

/** initial MDAPointChildReport state */
const initialState: ImmutableChildReportState = SeamlessImmutable({
  childReportByPlanId: {},
});

/** the MDAPointChildReport reducer function */
export default function reducer(
  state = initialState,
  action: MDAPointChildReportActionTypes
): ImmutableChildReportState {
  switch (action.type) {
    case MDA_POINT_CHILD_REPORT_FETCHED:
      if (action.childReportByPlanId) {
        return SeamlessImmutable({
          ...state,
          childReportByPlanId: {
            ...state.childReportByPlanId,
            ...action.childReportByPlanId,
          },
        });
      }
      return state;
    case REMOVE_MDA_CHILD_REPORT_PLANS:
      return SeamlessImmutable({
        ...state,
        childReportByPlanId: action.childReportByPlanId,
      });
    default:
      return state;
  }
}

/** This interface represents the structure of ChildReportFilters filter options/params */
export interface ChildReportFilters {
  jurisdiction_id?: string /** ChildReport jurisdiction */;
}

/** MDAPointChildReportsArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const MDAPointChildReportsArrayBaseSelector = (planId: string, locKey?: string) => (
  state: Partial<Store>
): ChildReport[] => {
  return (state as any)[reducerName][locKey ? locKey : 'childReportByPlanId'][planId] || [];
};

/** getMDAPointChildReportArrayByChild
 * Gets jurisdiction id from PlanFilters
 * @param state - the redux store
 * @param props - the Child report filters object
 */
export const getJurisdictionId = (_: Partial<Store>, props: ChildReportFilters) =>
  props.jurisdiction_id;

/** getMDAPointChildReportsArrayByTitle
 * Gets an array of Childs objects filtered by plan title
 * @param {Partial<Store>} state - the redux store
 * @param {ChildReportFilter} props - the Childs filters object
 */
export const getMDAPointChildReportsArrayByTitle = (planId: string, locKey?: string) =>
  createSelector(
    [MDAPointChildReportsArrayBaseSelector(planId, locKey), getJurisdictionId],
    (children, child) =>
      child ? children.filter(sch => sch.jurisdiction_id.includes(child)) : children
  );

/** makeMDAPointChildReportsArraySelector
 * Returns a selector that gets an array of MDAPointSchols objects filtered by one or all
 * of the following:
 *    - jurisdiction identifier
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * This selector is meant to be a memoized replacement for getMDAChildReportsPlansArray.
 *
 * To use this selector, do something like:
 *    const MDAPointChildReportsArraySelector = makeMDAPointSchollReportsArraySelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {ChildReportFilters} props - the Childs filters object
 */
export const makeMDAPointChildReportsArraySelector = (planId: string, locKey?: string) => {
  return createSelector([getMDAPointChildReportsArrayByTitle(planId, locKey)], children =>
    intersect([children], JSON.stringify)
  );
};
