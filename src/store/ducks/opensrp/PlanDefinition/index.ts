import { get, keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
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
  type: typeof PLAN_DEFINITIONS_FETCHED;
}

/** interface for removing PlanDefinitions action */
interface RemovePlanDefinitionsAction extends AnyAction {
  planDefinitionsById: { [key: string]: PlanDefinition };
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
 */
export const fetchPlanDefinitions = (
  planList: PlanDefinition[] = []
): FetchPlanDefinitionsAction => ({
  planDefinitionsById: keyBy(planList, 'identifier'),
  type: PLAN_DEFINITIONS_FETCHED,
});

/** Reset plan definitions state action creator */
export const removePlanDefinitions = () => ({
  planDefinitionsById: {},
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
}

/** immutable PlanDefinition state */
export type ImmutablePlanDefinitionState = PlanDefinitionState &
  SeamlessImmutable.ImmutableObject<PlanDefinitionState>;

/** initial PlanDefinition state */
const initialState: ImmutablePlanDefinitionState = SeamlessImmutable({
  planDefinitionsById: {},
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
