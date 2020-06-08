import intersect from 'fast_array_intersect';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';

/** the reducer name */
export const reducerName = 'MDASchoolReport';

/** school report interface */
export interface SchoolReport {
  plan_id: string;
  school_location_id: string;
  client_age_category: string;
  jurisdiction_id: string;
  jurisdiction_depth: number;
  jurisdiction_id_path: string[];
  jurisdiction_name_path: string[];
  sacregistered: number;
  mmacov: number;
  mmacovper: number;
  sacrefused: number;
  sacrefmedreason: number;
  mmaadr: number;
  mmaadrsev: number;
  albdist: number;
}

// actions

/** MDA_SCHOOL_REPORT_FETCHED action type */
export const MDA_POINT_SCHOOL_REPORT_FETCHED =
  'reveal/reducer/MDAPoint/MDASchoolReport/MDA_Point_SCHOOL_REPORT_FETCHED';

/** MDA_SCHOOL_REPORT_FETCHED action type */
export const REMOVE_MDA_SCHOOL_REPORT_PLANS =
  'reveal/reducer/MDAPoint/MDASchoolReport/REMOVE_MDA_POINT_SCHOOL_REPORT';

/** MDA_SCHOOL_REPORT_FETCHED action type */
export const ADD_MDA_SCHOOL_REPORT_PLAN =
  'reveal/reducer/MDAPoint/MDASchoolReport/ADD_MDA_SCHOOL_REPORT';

/** interface for fetch MDAPointSchoolReport action */
interface FetchMDAPointSchoolReportAction extends AnyAction {
  schoolReportByPlanId: { [key: string]: SchoolReport[] };
  type: typeof MDA_POINT_SCHOOL_REPORT_FETCHED;
}

/** interface for removing MDAPointSchoolReport action */
interface RemoveMDAPointSchoolReportAction extends AnyAction {
  schoolReportByPlanId: { [key: string]: SchoolReport[] };
  type: typeof REMOVE_MDA_SCHOOL_REPORT_PLANS;
}

/** Create type for MDAPointSchoolReportPlan reducer actions */
export type MDAPointSchoolReportActionTypes =
  | FetchMDAPointSchoolReportAction
  | RemoveMDAPointSchoolReportAction
  | AnyAction;

/**
 * Fetch Plan Definitions action creator
 * @param {MDAPointPlan[]} MDAPointPlanList - list of plan definition objects
 */
export const FetchMDAPointSchoolReportAction = (
  schoolReportList: SchoolReport[] = []
): FetchMDAPointSchoolReportAction => {
  const schoolReportByPlanId = {};
  schoolReportList.forEach((report: SchoolReport) => {
    (schoolReportByPlanId as any)[report.plan_id]
      ? (schoolReportByPlanId as any)[report.plan_id].push(report)
      : ((schoolReportByPlanId as any)[report.plan_id] = [report]);
  });
  return {
    schoolReportByPlanId,
    type: MDA_POINT_SCHOOL_REPORT_FETCHED,
  };
};

/** Reset plan definitions state action creator */
export const removeMDAPointSchoolReports = () => ({
  schoolReportByPlanId: {},
  type: REMOVE_MDA_SCHOOL_REPORT_PLANS,
});

// the reducer

/** interface for MDAPointSchoolReport state */
interface MDAPointSchoolReport {
  schoolReportByPlanId: { [key: string]: SchoolReport } | {};
}

/** immutable MDAPointPlan state */
export type ImmutableSchoolReportState = SeamlessImmutable.ImmutableObject<MDAPointSchoolReport> &
  MDAPointSchoolReport;

/** initial MDAPointPlan state */
const initialState: ImmutableSchoolReportState = SeamlessImmutable({
  schoolReportByPlanId: {},
});

/** the MDAPointPlan reducer function */
export default function reducer(
  state = initialState,
  action: MDAPointSchoolReportActionTypes
): ImmutableSchoolReportState {
  switch (action.type) {
    case MDA_POINT_SCHOOL_REPORT_FETCHED:
      if (action.schoolReportByPlanId) {
        return SeamlessImmutable({
          ...state,
          schoolReportByPlanId: { ...state.schoolReportByPlanId, ...action.schoolReportByPlanId },
        });
      }
      return state;
    case REMOVE_MDA_SCHOOL_REPORT_PLANS:
      return SeamlessImmutable({
        ...state,
        schoolReportByPlanId: action.schoolReportByPlanId,
      });
    default:
      return state;
  }
}

/** This interface represents the structure of MDAPointSchoolReport filter options/params */
export interface SchoolReportFilters {
  jurisdiction_id?: string /** schoolReport jurisdiction */;
}

/** MDAPointSchoolReportArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const MDAPointSchoolReportsArrayBaseSelector = (planId: string, schoolKey?: string) => (
  state: Partial<Store>
): SchoolReport[] => {
  return (state as any)[reducerName][schoolKey ? schoolKey : 'schoolReportByPlanId'][planId] || [];
};

/** getMDAPointSchoolReportArrayByLocation
 * Gets jurisdiction id from PlanFilters
 * @param state - the redux store
 * @param props - the school report filters object
 */
export const getJurisdictionId = (_: Partial<Store>, props: SchoolReportFilters) =>
  props.jurisdiction_id;

/** getShoolReportArrayByLocationId
 * Gets an array of schools objects filtered by plan title
 * @param {Partial<Store>} state - the redux store
 * @param {SchoolReportFilter} props - the schools filters object
 */
export const getMDAPointSchoolReportsArrayByTitle = (planId: string, schoolKey?: string) =>
  createSelector(
    [MDAPointSchoolReportsArrayBaseSelector(planId, schoolKey), getJurisdictionId],
    (schools, id) => (id ? schools.filter(sch => sch.jurisdiction_id.includes(id)) : schools)
  );

/** makeMDAPointSchoolReportsArraySelector
 * Returns a selector that gets an array of MDAPointSchols objects filtered by one or all
 * of the following:
 *    - jurisdiction identifier
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * This selector is meant to be a memoized replacement for getMDASchoolReportsPlansArray.
 *
 * To use this selector, do something like:
 *    const MDAPointSchoolReportsArraySelector = makeMDAPointSchollReportsArraySelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {SchoolFilters} props - the schools filters object
 */
export const makeMDAPointSchoolReportsArraySelector = (planId: string, schoolKey?: string) => {
  return createSelector([getMDAPointSchoolReportsArrayByTitle(planId, schoolKey)], schools =>
    intersect([schools], JSON.stringify)
  );
};
