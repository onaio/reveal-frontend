import intersect from 'fast_array_intersect';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';

/** the reducer name */
export const reducerName = 'MDALocationReport';

/** Location report interface */
export interface LocationReport {
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

/** MDA_LOCATION_REPORT_FETCHED action type */
export const MDA_POINT_LOCATION_REPORT_FETCHED =
  'reveal/reducer/MDAPoint/MDALocationReport/MDA_Point_LOCATION_REPORT_FETCHED';

/** MDA_LOCATION_REPORT_FETCHED action type */
export const REMOVE_MDA_LOCATION_REPORT_PLANS =
  'reveal/reducer/MDAPoint/MDALocationReport/REMOVE_MDA_POINT_LOCATION_REPORT';

/** MDA_LOCATION_REPORT_FETCHED action type */
export const ADD_MDA_LOCATION_REPORT_PLAN =
  'reveal/reducer/MDAPoint/MDALocationReport/ADD_MDA_LOCATION_REPORT';

/** interface for fetch MDAPointLocationReport action */
interface FetchMDAPointLocationReport extends AnyAction {
  locationReportByPlanId: { [key: string]: LocationReport[] };
  type: typeof MDA_POINT_LOCATION_REPORT_FETCHED;
}

/** interface for removing MDAPointLocationReport action */
interface RemoveMDAPointLocationReportAction extends AnyAction {
  locationReportByPlanId: { [key: string]: LocationReport[] };
  type: typeof REMOVE_MDA_LOCATION_REPORT_PLANS;
}

/** Create type for MDAPointLocationReportPlan reducer actions */
export type MDAPointLocationReportActionTypes =
  | FetchMDAPointLocationReport
  | RemoveMDAPointLocationReportAction
  | AnyAction;

/**
 * Fetch Plan Definitions action creator
 * @param {MDAPointLocation[]} MDAPointPlanList - list of location report objects
 */
export const FetchMDAPointLocationReportAction = (
  locReportList: LocationReport[] = []
): FetchMDAPointLocationReport => {
  const locationReportByPlanId = {};
  locReportList.forEach((report: LocationReport) => {
    (locationReportByPlanId as any)[report.plan_id]
      ? (locationReportByPlanId as any)[report.plan_id].push(report)
      : ((locationReportByPlanId as any)[report.plan_id] = [report]);
  });
  return {
    locationReportByPlanId,
    type: MDA_POINT_LOCATION_REPORT_FETCHED,
  };
};

/** Reset plan definitions state action creator */
export const removeMDAPointLocationReports = () => ({
  locationReportByPlanId: {},
  type: REMOVE_MDA_LOCATION_REPORT_PLANS,
});

// the reducer

/** interface for MDAPointLocationReport state */
interface MDAPointLocationReport {
  locationReportByPlanId: { [key: string]: LocationReport } | {};
}

/** immutable MDAPointLocationReport state */
export type ImmutableLocationReportState = SeamlessImmutable.ImmutableObject<
  MDAPointLocationReport
> &
  MDAPointLocationReport;

/** initial MDAPointLocationReport state */
const initialState: ImmutableLocationReportState = SeamlessImmutable({
  locationReportByPlanId: {},
});

/** the MDAPointLocationReport reducer function */
export default function reducer(
  state = initialState,
  action: MDAPointLocationReportActionTypes
): ImmutableLocationReportState {
  switch (action.type) {
    case MDA_POINT_LOCATION_REPORT_FETCHED:
      if (action.locationReportByPlanId) {
        return SeamlessImmutable({
          ...state,
          locationReportByPlanId: {
            ...state.locationReportByPlanId,
            ...action.locationReportByPlanId,
          },
        });
      }
      return state;
    case REMOVE_MDA_LOCATION_REPORT_PLANS:
      return SeamlessImmutable({
        ...state,
        locationReportByPlanId: action.locationReportByPlanId,
      });
    default:
      return state;
  }
}

/** This interface represents the structure of LocationReportFilters filter options/params */
export interface LocationReportFilters {
  jurisdiction_id?: string /** LocationReport jurisdiction */;
}

/** MDAPointLocationReportsArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const MDAPointLocationReportsArrayBaseSelector = (planId: string, locKey?: string) => (
  state: Partial<Store>
): LocationReport[] => {
  return (state as any)[reducerName][locKey ? locKey : 'locationReportByPlanId'][planId] || [];
};

/** getMDAPointLocationReportArrayByLocation
 * Gets jurisdiction id from PlanFilters
 * @param state - the redux store
 * @param props - the Location report filters object
 */
export const getJurisdictionId = (_: Partial<Store>, props: LocationReportFilters) =>
  props.jurisdiction_id;

/** getMDAPointLocationReportsArrayByTitle
 * Gets an array of Locations objects filtered by plan title
 * @param {Partial<Store>} state - the redux store
 * @param {LocationReportFilter} props - the Locations filters object
 */
export const getMDAPointLocationReportsArrayByTitle = (planId: string, locKey?: string) =>
  createSelector(
    [MDAPointLocationReportsArrayBaseSelector(planId, locKey), getJurisdictionId],
    (locations, loc) =>
      loc ? locations.filter(sch => sch.jurisdiction_id.includes(loc)) : locations
  );

/** makeMDAPointLocationReportsArraySelector
 * Returns a selector that gets an array of MDAPointSchols objects filtered by one or all
 * of the following:
 *    - jurisdiction identifier
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * This selector is meant to be a memoized replacement for getMDALocationReportsPlansArray.
 *
 * To use this selector, do something like:
 *    const MDAPointLocationReportsArraySelector = makeMDAPointSchollReportsArraySelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {LocationReportFilters} props - the Locations filters object
 */
export const makeMDAPointLocationReportsArraySelector = (planId: string, locKey?: string) => {
  return createSelector([getMDAPointLocationReportsArrayByTitle(planId, locKey)], locations =>
    intersect([locations], JSON.stringify)
  );
};
