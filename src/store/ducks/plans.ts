import { Dictionary } from '@onaio/utils';
import intersect from 'fast_array_intersect';
import { get, keyBy, keys, pickBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';
import { FIReasonType, FIStatusType } from '../../components/forms/PlanForm/types';
import { PlanAction, PlanGoal, UseContext } from '../../configs/settings';
import { descendingOrderSort, removeNullJurisdictionPlans } from '../../helpers/utils';

/** the reducer name */
export const reducerName = 'plans';

/** Enum representing the possible intervention types */
export enum InterventionType {
  DynamicFI = 'Dynamic-FI',
  DynamicIRS = 'Dynamic-IRS',
  DynamicMDA = 'Dynamic-MDA',
  FI = 'FI',
  IRS = 'IRS',
  IRSLite = 'IRS-Lite',
  MDA = 'MDA',
  MDALite = 'MDA-Lite',
  MDAPoint = 'MDA-Point',
}
/** interface for plan Objects */
/** Enum representing the possible intervention types */
export enum PlanStatus {
  ACTIVE = 'active',
  COMPLETE = 'complete',
  DRAFT = 'draft',
  RETIRED = 'retired',
}
/** PlanRecordResponse - interface for response objects from SUPERSET_PLANS_TABLE_SLICE */
export interface PlanRecordResponse {
  date: string;
  effective_period_end: string;
  effective_period_start: string;
  identifier: string;
  intervention_type: InterventionType;
  jurisdictions?: string[];
  fi_reason: FIReasonType;
  fi_status: FIStatusType;
  name: string;
  status: string;
  title: string;
  useContext?: UseContext[];
  version: string;
}

/** PlanRecord - base Plan interface for plan objects,  keyed by `id` in state */
export interface PlanRecord {
  case_classification?: string;
  id: string;
  plan_date: string;
  plan_effective_period_end: string;
  plan_effective_period_start: string;
  plan_fi_reason: FIReasonType | '';
  plan_fi_status: FIStatusType | '';
  plan_id: string;
  plan_intervention_type: InterventionType;
  plan_status: PlanStatus;
  plan_title: string;
  plan_useContext?: UseContext[];
  plan_version?: string;
  plan_jurisdictions_ids?: string[];
}

// todo - Rename?
/** Plan - interface for plan[-jurisdiction] objects */
export interface Plan extends PlanRecord {
  jurisdiction_depth: number;
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_name_path: string[];
  jurisdiction_parent_id: string;
  jurisdiction_path: string[];
}

/** PlanPayload - interface for the payload used when creating/updating a plan via OpenSRP plans Endpoint */
export interface PlanPayload {
  action: PlanAction[];
  date: string;
  effectivePeriod: {
    start: string;
    end: string;
  };
  goal: PlanGoal[];
  identifier: string;
  jurisdiction: Array<{
    code: string;
  }>;
  name: string;
  serverVersion: number;
  status: string;
  title: string;
  useContext: UseContext[];
  version: string;
}

/** PlanEventType - enum for Plan Event logging */
export enum PlanEventType {
  CREATE = 'Create Plan',
  UPDATE = 'Update Plan',
}

/** PlanEvent - interface for upload used when logging create/update Plan events */
export interface PlanEventPayload {
  baseEntityId: string;
  dateCreated: string;
  details: Dictionary;
  duration: number;
  entityType: InterventionType;
  eventDate: string;
  eventType: PlanEventType;
  formSubmissionId: string;
  identifiers: Dictionary;
  obs: Array<{
    fieldType: 'concept';
    fieldDataType: string;
    fieldCode: string;
    parentCode: string;
    values: string[];
    set: any[];
    formSubmissionField: string;
    humanReadableValues: string[];
  }>;
  providerId: string;
  type: 'Event';
  version: number;
}

// actions
/** PLANS_FETCHED action type */
export const PLANS_FETCHED = 'reveal/reducer/plans/PLANS_FETCHED';
/** PLAN_RECORDS_FETCHED action type */
export const PLAN_RECORDS_FETCHED = 'reveal/reducer/plans/PLAN_RECORDS_FETCHED';
/** REMOVE_PLANS action_type */
export const REMOVE_PLANS = 'reveal/reducer/plans/REMOVE_PLANS';

/** FetchPlansAction interface for PLANS_FETCHED */
export interface FetchPlansAction extends AnyAction {
  plansById: { [key: string]: Plan };
  type: typeof PLANS_FETCHED;
}
/** FetchPlanRecordsAction interface for PLAN_RECORDS_FETCHED */
export interface FetchPlanRecordsAction extends AnyAction {
  planRecordsById: { [key: string]: PlanRecord };
  type: typeof PLAN_RECORDS_FETCHED;
}

/** removePlansAction interface for REMOVE_PLANS */
interface RemovePlansAction extends AnyAction {
  type: typeof REMOVE_PLANS;
  plansById: {};
}

/** Create type for Plan reducer actions */
export type PlanActionTypes =
  | FetchPlansAction
  | FetchPlanRecordsAction
  | RemovePlansAction
  | AnyAction;

/** interface for Plan state */
interface PlanState {
  planRecordsById: { [key: string]: PlanRecord } | {};
  plansById: { [key: string]: Plan } | {};
}

/** immutable Plan state */
export type ImmutablePlanState = PlanState & SeamlessImmutable.ImmutableObject<PlanState>;

/** initial Plan state */
const initialState: ImmutablePlanState = SeamlessImmutable({
  planRecordsById: {},
  plansById: {},
});

/** the Plan reducer function */
export default function reducer(state = initialState, action: PlanActionTypes): ImmutablePlanState {
  switch (action.type) {
    case PLANS_FETCHED:
      return SeamlessImmutable({
        ...state,
        plansById: { ...state.plansById, ...action.plansById },
      });
    case PLAN_RECORDS_FETCHED:
      return SeamlessImmutable({
        ...state,
        planRecordsById: { ...state.planRecordsById, ...action.planRecordsById },
      });
    case REMOVE_PLANS:
      return SeamlessImmutable({
        ...state,
        plansById: action.plansById,
      });
    default:
      return state;
  }
}

// action creators

/** removePlansAction */
export const removePlansAction: RemovePlansAction = {
  plansById: {},
  type: REMOVE_PLANS,
};

/** fetchPlans - action creator setting plansById
 * @param {Plan[]} plansList - array of plan objects
 */
export const fetchPlans = (plansList: Plan[] = []): FetchPlansAction => {
  const plansArray = removeNullJurisdictionPlans(plansList);

  return {
    plansById: keyBy(
      plansArray.map((plan: Plan) => {
        /** ensure jurisdiction_name_path is parsed */
        if (typeof plan.jurisdiction_name_path === 'string') {
          plan.jurisdiction_name_path = JSON.parse(plan.jurisdiction_name_path);
        }
        /** ensure jurisdiction_path is parsed */
        if (typeof plan.jurisdiction_path === 'string') {
          plan.jurisdiction_path = JSON.parse(plan.jurisdiction_path);
        }
        return plan;
      }),
      plan => plan.id
    ),
    type: PLANS_FETCHED,
  };
};

/** fetchPlanRecords - action creator setting planRecordsById
 * @param {PlanRecord[]} planList - an array of plan record objects
 */
export const fetchPlanRecords = (planList: PlanRecordResponse[] = []): FetchPlanRecordsAction => ({
  planRecordsById: keyBy(
    planList.map((plan: PlanRecordResponse) => {
      const thePlan: PlanRecord = {
        id: plan.identifier,
        plan_date: plan.date,
        plan_effective_period_end: plan.effective_period_end,
        plan_effective_period_start: plan.effective_period_start,
        plan_fi_reason: plan.fi_reason,
        plan_fi_status: plan.fi_status,
        plan_id: plan.identifier,
        plan_intervention_type: plan.intervention_type,
        plan_status: plan.status as PlanStatus,
        plan_title: plan.title,
        plan_useContext: plan.useContext,
        plan_version: plan.version,
      };
      if (plan.jurisdictions) {
        thePlan.plan_jurisdictions_ids = [...plan.jurisdictions];
      }
      return thePlan;
    }),
    plan => plan.id
  ),
  type: PLAN_RECORDS_FETCHED,
});

// selectors

/** getPlansById - get plansById
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 * @param {string[]} statusList - the plan statuses
 * @param {string} reason - the plan reason
 */
export function getPlansById(
  state: Partial<Store>,
  intervention: InterventionType | null = null,
  statusList: string[] = [PlanStatus.ACTIVE],
  reason: string | null = null
): { [key: string]: Plan } {
  const plansById = (state as any)[reducerName].plansById;
  return pickBy(
    plansById,
    (plan: Plan) =>
      (intervention ? plan.plan_intervention_type === intervention : true) &&
      (statusList.length ? statusList.includes(plan.plan_status) : true) &&
      (reason ? plan.plan_fi_reason === reason : true)
  );
}

/** getPlansArray - get an array of Plans
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 * @param {string[]} statusList - a list of the desired the plan statuses
 * @param {string} reason - the plan reason
 * @param {string} parentJurisdictionId - The jurisdiction_parent_id of the plan
 * @param {string[]} jurisdictions - jurisdiction IDs list to find plan's jurisdiction_id within
 */
export function getPlansArray(
  state: Partial<Store>,
  intervention: InterventionType | null = null,
  statusList: string[] = [],
  reason: string | null = null,
  jurisdictions: string[] = [],
  parentJurisdictionId: string | null = null
): Plan[] {
  return values((state as any)[reducerName].plansById).filter(
    (plan: Plan) =>
      (intervention ? plan.plan_intervention_type === intervention : true) &&
      (statusList.length ? statusList.includes(plan.plan_status) : true) &&
      (reason ? plan.plan_fi_reason === reason : true) &&
      (jurisdictions.length ? jurisdictions.includes(plan.jurisdiction_id) : true) &&
      (parentJurisdictionId && !plan.jurisdiction_path ? false : true) &&
      (parentJurisdictionId && plan.jurisdiction_path
        ? plan.jurisdiction_path.includes(parentJurisdictionId)
        : true)
  );
}

/** getPlanById - get one Plan by id
 * @param {Partial<Store>} state - the redux store
 * @param {string} id - the plan id
 */
export function getPlanById(state: Partial<Store>, id: string): Plan | null {
  return get((state as any)[reducerName].plansById, id) || null;
}

/** getPlanRecordsById - get planRecordsById
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 * @param {string[]} statusList - the plan statuses
 * @param {string} reason - the plan reason
 */
export function getPlanRecordsById(
  state: Partial<Store>,
  intervention: InterventionType | null = null,
  statusList: string[] = [PlanStatus.ACTIVE],
  reason: string | null = null
): { [key: string]: PlanRecord } {
  const planRecordsById = (state as any)[reducerName].planRecordsById;
  return pickBy(
    planRecordsById,
    (plan: PlanRecord) =>
      (intervention ? plan.plan_intervention_type === intervention : true) &&
      (statusList.length ? statusList.includes(plan.plan_status) : true) &&
      (reason ? plan.plan_fi_reason === reason : true)
  );
}

/** getPlanRecordsIdArray - get an array of PlanRecord ids
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType} intervention - the intervention type
 * @param {string[]} status - the plan statuses
 * @param {string} reason - the plan reason
 */
export function getPlanRecordsIdArray(
  state: Partial<Store>,
  intervention: InterventionType | null = null,
  statusList: string[] = [PlanStatus.ACTIVE],
  reason: string | null = null
): string[] {
  return keys(getPlanRecordsById(state, intervention, statusList, reason));
}

/** getPlanRecordById - get one PlanRecord by id
 * @param {Partial<Store>} state - the redux store
 * @param {string} id - the plan id
 */
export function getPlanRecordById(state: Partial<Store>, id: string): PlanRecord | null {
  return get((state as any)[reducerName].planRecordsById, id) || null;
}

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of plan filter options/params */
export interface PlanFilters {
  interventionType?: InterventionType | InterventionType[] /** allowed intervention type(s) */;
  jurisdictionIds?: string[] /** an array of jurisdiction ids */;
  parentJurisdictionId?: string /** jurisdiction parent id */;
  reason?: FIReasonType /** plan FI reason */;
  statusList?: string[] /** array of plan statuses */;
  title?: string /** plan title */;
  planIds?: string[] | null /** an array of plan ids to get */;
}

/** plansArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const plansArrayBaseSelector = (planKey?: string) => (state: Partial<Store>): Plan[] =>
  values((state as any)[reducerName][planKey ? planKey : 'plansById']);

/** getInterventionType
 * Gets interventionType from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getInterventionType = (_: Partial<Store>, props: PlanFilters) =>
  props.interventionType;

/** getJurisdictionIds
 * Gets jurisdictionIds from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getJurisdictionIds = (_: Partial<Store>, props: PlanFilters) => props.jurisdictionIds;

/** getParentJurisdictionId
 * Gets parentJurisdictionId from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getParentJurisdictionId = (_: Partial<Store>, props: PlanFilters) =>
  props.parentJurisdictionId;

/** getStatusList
 * Gets statusList from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getStatusList = (_: Partial<Store>, props: PlanFilters) => props.statusList;

/** getReason
 * Gets reason from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getReason = (_: Partial<Store>, props: PlanFilters) => props.reason;

/** getTitle
 * Gets title from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getTitle = (_: Partial<Store>, props: PlanFilters) => props.title;

/** getTitle
 * Gets title from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getPlanIds = (_: Partial<Store>, props: PlanFilters) => props.planIds;

/** getPlansArrayByInterventionType
 * Gets an array of Plan objects filtered by interventionType
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 */
export const getPlansArrayByInterventionType = (planKey?: string) => {
  return createSelector(
    [plansArrayBaseSelector(planKey), getInterventionType],
    (plans, interventionType) => {
      if (interventionType === undefined) {
        return plans;
      }
      const interventionTypes = Array.isArray(interventionType)
        ? interventionType
        : [interventionType];

      return plans.filter(plan => interventionTypes.includes(plan.plan_intervention_type));
    }
  );
};

/** getPlansArrayByJurisdictionIds
 * Gets an array of Plan objects filtered by jurisdictionIds
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 */
export const getPlansArrayByJurisdictionIds = (planKey?: string) =>
  createSelector([plansArrayBaseSelector(planKey), getJurisdictionIds], (plans, jurisdictionIds) =>
    jurisdictionIds
      ? plans.filter(plan =>
          jurisdictionIds.length ? jurisdictionIds.includes(plan.jurisdiction_id) : true
        )
      : plans
  );

/** getPlansArrayByStatus
 * Gets an array of Plan objects filtered by plan status
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 */
export const getPlansArrayByStatus = (plantype?: string) =>
  createSelector([plansArrayBaseSelector(plantype), getStatusList], (plans, statusList) =>
    statusList
      ? plans.filter(plan => (statusList.length ? statusList.includes(plan.plan_status) : true))
      : plans
  );

/** getPlansArrayByReason
 * Gets an array of Plan objects filtered by FI plan reason
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 */
export const getPlansArrayByReason = (planKey?: string) =>
  createSelector([plansArrayBaseSelector(planKey), getReason], (plans, reason) =>
    reason ? plans.filter(plan => plan.plan_fi_reason === reason) : plans
  );

/** getPlansArrayByParentJurisdictionId
 * Gets an array of Plan objects filtered by plan jurisdiction parent_id
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 */
export const getPlansArrayByParentJurisdictionId = (planKey?: string) =>
  createSelector(
    [plansArrayBaseSelector(planKey), getParentJurisdictionId],
    (plans, parentJurisdictionId) =>
      plans.filter(
        plan =>
          (parentJurisdictionId && !plan.jurisdiction_path ? false : true) &&
          (parentJurisdictionId && plan.jurisdiction_path
            ? plan.jurisdiction_path.includes(parentJurisdictionId)
            : true)
      )
  );

/** filter plans to only include those of the given identifiers
 * @param {Partial<Store>} state -the redux store
 * @param {PlanFilters} props - the plan filters object
 */
export const getPlansArrayByPlanIds = (planKey?: string) => {
  return createSelector(plansArrayBaseSelector(planKey), getPlanIds, (allPlans, planIds) => {
    const plansOfInterest: Plan[] = [];
    if (!planIds) {
      return allPlans;
    }
    planIds.forEach(planId => {
      allPlans.forEach(plan => {
        if (plan.plan_id === planId) {
          plansOfInterest.push(plan);
        }
      });
    });
    return plansOfInterest;
  });
};

/** getPlansArrayByTitle
 * Gets an array of Plan objects filtered by plan title
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 */
export const getPlansArrayByTitle = (planKey?: string) =>
  createSelector([plansArrayBaseSelector(planKey), getTitle], (plans, title) => {
    return title
      ? plans.filter(plan => {
          const thisPlansTitle = plan.plan_title;
          if (!thisPlansTitle) {
            return false;
          }
          return plan.plan_title.toLowerCase().includes(title.toLowerCase());
        })
      : plans;
  });

/** makePlansArraySelector
 * Returns a selector that gets an array of Plan objects filtered by one or all
 * of the following:
 *    - interventionType
 *    - jurisdictionIds
 *    - plan status
 *    - FI plan reason
 *    - plan jurisdiction parent_id
 *    - plan title
 *    - a list of plan ids
 * The plans returned are further filtered based on the enabled plan types
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * This selector is meant to be a memoized replacement for getPlanRecordsArray.
 *
 * To use this selector, do something like:
 *    const plansArraySelector = makePlansArraySelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 * @param {string} sortField - sort by field
 */
export const makePlansArraySelector = (planKey?: string, sortField?: string) => {
  return createSelector(
    [
      getPlansArrayByInterventionType(planKey),
      getPlansArrayByJurisdictionIds(planKey),
      getPlansArrayByStatus(planKey),
      getPlansArrayByReason(planKey),
      getPlansArrayByParentJurisdictionId(planKey),
      getPlansArrayByTitle(planKey),
      getPlansArrayByPlanIds(planKey),
    ],
    (plans, plans2, plans3, plans4, plans5, plans6, plans7) => {
      return sortField
        ? descendingOrderSort(
            intersect([plans, plans2, plans3, plans4, plans5, plans6, plans7], JSON.stringify),
            sortField
          )
        : intersect([plans, plans2, plans3, plans4, plans5, plans6, plans7], JSON.stringify);
    }
  );
};
