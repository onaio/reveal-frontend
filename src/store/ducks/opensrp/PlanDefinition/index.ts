import { get, keyBy, keys, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { PlanDefinition } from '../../../../configs/settings';
import { InterventionType } from '../../plans';

/** the reducer name */
export const reducerName = 'PlanDefinition';

// actions

/** PLAN_DEFINITION_FETCHED action type */
export const PLAN_DEFINITIONS_FETCHED =
  'reveal/reducer/opensrp/PlanDefinition/PLAN_DEFINITIONS_FETCHED';

/** interface for fetch PlanDefinitions action */
interface FetchPlanDefinitionsAction extends AnyAction {
  planDefinitionsById: { [key: string]: PlanDefinition };
  type: typeof PLAN_DEFINITIONS_FETCHED;
}

// action creators

/** Fetch Plan Definitions action creator */
export const fetchPlanDefinitions = (
  planList: PlanDefinition[] = []
): FetchPlanDefinitionsAction => ({
  planDefinitionsById: keyBy(planList, 'identifier'),
  type: PLAN_DEFINITIONS_FETCHED,
});

/** Create type for PlanDefinition reducer actions */
export type PlanDefinitionActionTypes = FetchPlanDefinitionsAction | AnyAction;

/** interface for PlanDefinition state */
interface PlanDefinitionState {
  planDefinitionsById: { [key: string]: PlanDefinition };
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
          planDefinitionsById: action.planDefinitionsById,
        });
      }
      return state;
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
  return values((state as any)[reducerName].planDefinitionsById);
}
