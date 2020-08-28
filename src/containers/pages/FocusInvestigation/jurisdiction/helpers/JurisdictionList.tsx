import { ObjectList } from '@onaio/cbv';
import { Registry } from '@onaio/redux-reducer-registry';
import { FIReasons } from '../../../../../configs/settings';
import { SORT_BY_EFFECTIVE_PERIOD_START_FIELD } from '../../../../../constants';
import {
  InterventionType,
  makePlansArraySelector,
  PlanFilters,
  PlanStatus,
} from '../../../../../store/ducks/plans';

/** Custom implementation of ObjectList where we override the getMapStateToProps method */
export default class JurisdictionList<
  ObjectType,
  ActionType,
  SelectorType,
  PropsType
> extends ObjectList<ObjectType, ActionType, SelectorType, PropsType> {
  /** Custom getMapStateToProps
   * Gets plans for the current jurisdiction
   */
  public getMapStateToProps() {
    return (state: Registry, ownProps: any) => {
      const getPlansArray = makePlansArraySelector(undefined, SORT_BY_EFFECTIVE_PERIOD_START_FIELD);

      const jurisdictionId = ownProps.match.params.jurisdictionId;

      const reactiveFilters: PlanFilters = {
        interventionType: [InterventionType.FI, InterventionType.DynamicFI],
        jurisdictionIds: [jurisdictionId],
        reason: FIReasons[1],
      };

      const routineFilters: PlanFilters = {
        ...reactiveFilters,
        reason: FIReasons[0],
      };

      return {
        completeReactivePlans: getPlansArray(state, {
          ...reactiveFilters,
          statusList: [PlanStatus.COMPLETE],
        }),
        completeRoutinePlans: getPlansArray(state, {
          ...routineFilters,
          statusList: [PlanStatus.COMPLETE],
        }),
        currentReactivePlans: getPlansArray(state, {
          ...reactiveFilters,
          statusList: [PlanStatus.ACTIVE],
        }),
        currentRoutinePlans: getPlansArray(state, {
          ...routineFilters,
          statusList: [PlanStatus.ACTIVE],
        }),
      };
    };
  }
}
