import { Dictionary } from '@onaio/utils/dist/types/types';
import intersect from 'fast_array_intersect';
import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { createSelector } from 'reselect';
import SeamlessImmutable from 'seamless-immutable';
import { PlanDefinition } from '../../../../configs/settings';
import { isPlanDefinitionOfType } from '../../../../helpers/utils';
import { InterventionType } from '../../plans';

/** the reducer name */
export const reducerName = 'PlanDefinition';

// actions

/** PLAN_DEFINITION_FETCHED action type */
export const PLAN_DEFINITIONS_FETCHED =
  'reveal/reducer/opensrp/PlanDefinition/PLAN_DEFINITIONS_FETCHED';

/** PLAN_DEFINITION_FETCHED action type */
export const REMOVE_PLAN_DEFINITIONS =
  'reveal/reducer/opensrp/PlanDefinition/REMOVE_PLAN_DEFINITIONS';

/** PLAN_DEFINITION_FETCHED action type */
export const ADD_PLAN_DEFINITION = 'reveal/reducer/opensrp/PlanDefinition/ADD_PLAN_DEFINITION';

/** interface for fetch PlanDefinitions action */
interface FetchPlanDefinitionsAction extends AnyAction {
  planDefinitionsById: { [key: string]: PlanDefinition };
  planIdsByUserName: { [key: string]: string[] };
  type: typeof PLAN_DEFINITIONS_FETCHED;
}

/** interface for removing PlanDefinitions action */
interface RemovePlanDefinitionsAction extends AnyAction {
  planDefinitionsById: { [key: string]: PlanDefinition };
  planIdsByUserName: Dictionary<string[]>;
  type: typeof REMOVE_PLAN_DEFINITIONS;
}

/** interface for adding a single PlanDefinitions action */
interface AddPlanDefinitionAction extends AnyAction {
  planObj: PlanDefinition;
  type: typeof ADD_PLAN_DEFINITION;
}

/** Create type for PlanDefinition reducer actions */
export type PlanDefinitionActionTypes =
  | FetchPlanDefinitionsAction
  | RemovePlanDefinitionsAction
  | AddPlanDefinitionAction
  | AnyAction;

// action creators

/**
 * Fetch Plan Definitions action creator
 * @param {PlanDefinition[]} planList - list of plan definition objects
 * @param {string[]} userNames - openMRS user who has access to this plans.
 */
export const fetchPlanDefinitions = (
  planList: PlanDefinition[] = [],
  userNames: string[] = []
): FetchPlanDefinitionsAction => {
  const planIdsByUserName: Dictionary<string[]> = {};
  if (userNames.length > 0) {
    const plansIds = planList.map(plan => plan.identifier);
    userNames.forEach(userName => (planIdsByUserName[userName] = plansIds));
  }
  return {
    planDefinitionsById: keyBy(planList, 'identifier'),
    planIdsByUserName,
    type: PLAN_DEFINITIONS_FETCHED,
  };
};

/** Reset plan definitions state action creator */
export const removePlanDefinitions = () => ({
  planDefinitionsById: {},
  planIdsByUserName: {},
  type: REMOVE_PLAN_DEFINITIONS,
});

/**
 * Add one Plan Definition action creator
 * @param {PlanDefinition} planObj - the plan definition object
 */
export const addPlanDefinition = (planObj: PlanDefinition): AddPlanDefinitionAction => ({
  planObj,
  type: ADD_PLAN_DEFINITION,
});

// the reducer

/** interface for PlanDefinition state */
interface PlanDefinitionState {
  planDefinitionsById: { [key: string]: PlanDefinition } | {};
  planIdsByUserName: Dictionary<string[]> | {};
}

/** immutable PlanDefinition state */
export type ImmutablePlanDefinitionState = PlanDefinitionState &
  SeamlessImmutable.ImmutableObject<PlanDefinitionState>;

/** initial PlanDefinition state */
const initialState: ImmutablePlanDefinitionState = SeamlessImmutable({
  planDefinitionsById: {},
  planIdsByUserName: {},
});

/** the PlanDefinition reducer function */
export default function reducer(
  state = initialState,
  action: PlanDefinitionActionTypes
): ImmutablePlanDefinitionState {
  switch (action.type) {
    case PLAN_DEFINITIONS_FETCHED:
      if (action.planDefinitionsById) {
        return SeamlessImmutable({
          ...state,
          planDefinitionsById: { ...state.planDefinitionsById, ...action.planDefinitionsById },
          planIdsByUserName: { ...state.planIdsByUserName, ...action.planIdsByUserName },
        });
      }
      return state;
    case ADD_PLAN_DEFINITION:
      if (action.planObj as PlanDefinition) {
        return SeamlessImmutable({
          ...state,
          planDefinitionsById: {
            ...state.planDefinitionsById,
            [action.planObj.identifier as string]: action.planObj,
          },
        });
      }
      return state;
    case REMOVE_PLAN_DEFINITIONS:
      return SeamlessImmutable({
        ...state,
        planDefinitionsById: action.planDefinitionsById,
        planIdsByUserName: action.planIdsByUserName,
      });
    default:
      return state;
  }
}

// selectors

/** get PlanDefinitions by id
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType | null} interventionType - the PlanDefinition intervention Type
 * @returns {{ [key: string]: PlanDefinition }} PlanDefinitions by id
 */
export function getPlanDefinitionsById(
  state: Partial<Store>,
  interventionType: InterventionType | null = null
): { [key: string]: PlanDefinition } {
  if (interventionType) {
    return keyBy(getPlanDefinitionsArray(state, interventionType), 'identifier');
  }
  return (state as any)[reducerName].planDefinitionsById;
}

/** get one PlanDefinition using its id
 * @param {Partial<Store>} state - the redux store
 * @param {string} id - the PlanDefinition id
 * @returns {PlanDefinition|null} a PlanDefinition object or null
 */
export function getPlanDefinitionById(state: Partial<Store>, id: string): PlanDefinition | null {
  return get((state as any)[reducerName].planDefinitionsById, id) || null;
}

/** get an array of PlanDefinition objects
 * @param {Partial<Store>} state - the redux store
 * @param {InterventionType | null} interventionType - the PlanDefinition intervention Type
 * @returns {PlanDefinition[]} an array of PlanDefinition objects
 */
export function getPlanDefinitionsArray(
  state: Partial<Store>,
  interventionType: InterventionType | null = null
): PlanDefinition[] {
  const result = values((state as any)[reducerName].planDefinitionsById);
  if (interventionType) {
    return result.filter((e: PlanDefinition) => isPlanDefinitionOfType(e, interventionType));
  }
  return result;
}

/** RESELECT USAGE STARTS HERE */

/** This interface represents the structure of plan definition filter options/params */
export interface PlanDefinitionFilters {
  title?: string /** plan object title */;
  userName?: string /** openMRS user, filter out plans that the user does not have access to */;
}

/** planDefinitionsArrayBaseSelector select an array of all plans
 * @param state - the redux store
 */
export const planDefinitionsArrayBaseSelector = (planKey = 'planDefinitionsById') => (
  state: Partial<Store>
) => values((state as any)[reducerName][planKey]);

/** getTitle
 * Gets title from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getTitle = (_: Partial<Store>, props: PlanDefinitionFilters) => props.title;

/** non_memoized function that gets value of reducerSlice.planDefinitionsById
 * @param {Partial<Store>} state -  the redux store
 */
export const basePlanDefinitionsByIds = (state: Partial<Store>): Dictionary<PlanDefinition> =>
  (state as any)[reducerName].planDefinitionsById;

/** non_memoized function that gets value of reducerSlice.planIdsByUserName
 * * @param {Partial<Store>} state -  the redux store
 */
export const basePlanIdsByUserNamesSelector = (state: Partial<Store>): Dictionary<string[]> => {
  return (state as any)[reducerName].planIdsByUserName;
};

/** getUserName
 * Gets userName from PlanFilters
 * @param state - the redux store
 * @param props - the plan filters object
 */
export const getUserName = (_: Partial<Store>, props: PlanDefinitionFilters) => props.userName;

/** gets all planIds associated with a userName
 * @param {Registry} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan definition filters object
 */
export const getPlanIdsByUserName = () => {
  return createSelector(
    basePlanIdsByUserNamesSelector,
    getUserName,
    (planIdsByUserName, userName) => {
      let planIdsArray = userName ? planIdsByUserName[userName] : [];
      planIdsArray = planIdsArray ? planIdsArray : [];
      return planIdsArray;
    }
  );
};

/** filters out plans that the given user does not have access to.
 * @param {Registry} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan definition filters object
 */
export const getPlansByUserName = () => {
  return createSelector(
    getPlanIdsByUserName(),
    getUserName,
    basePlanDefinitionsByIds,
    (planIds, userName, allPlansDictionary) => {
      const plansOfInterest = userName
        ? planIds.map((planId: string) => allPlansDictionary[planId])
        : values(allPlansDictionary);
      return plansOfInterest;
    }
  );
};

/** getPlansArrayByTitle
 * Gets an array of Plan objects filtered by plan title
 * @param {Registry} state - the redux store
 * @param {PlanDefinitionFilters} props - the plan definition filters object
 */
export const getPlanDefinitionsArrayByTitle = (planKey?: string) =>
  createSelector([planDefinitionsArrayBaseSelector(planKey), getTitle], (plans, title) =>
    title ? plans.filter(plan => plan.title.toLowerCase().includes(title.toLowerCase())) : plans
  );

/** makePlanDefinitionsArraySelector
 * Returns a selector that gets an array of IRSPlan objects filtered by one or all
 * of the following:
 *    - title
 *
 * These filter params are all optional and are supplied via the prop parameter.
 *
 * This selector is meant to be a memoized replacement for getPlanDefinitionsArray.
 *
 * To use this selector, do something like:
 *    const PlanDefinitionsArraySelector = makeIRSPlansArraySelector();
 *
 * @param {Partial<Store>} state - the redux store
 * @param {PlanFilters} props - the plan filters object
 * @param {string} sortField - sort by field
 */
export const makePlanDefinitionsArraySelector = (planKey?: string) => {
  return createSelector(
    [getPlanDefinitionsArrayByTitle(planKey), getPlansByUserName()],
    (plans1, plans2) => {
      return intersect([plans1, plans2], JSON.stringify);
    }
  );
};
