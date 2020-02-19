import reducerRegistry, { Registry } from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import { FIReasons } from '../../../../configs/settings';
import { ObjectList } from '../../../../helpers/cbv';
import { displayError } from '../../../../helpers/errors';
import supersetFetch from '../../../../services/superset';
import plansReducer, {
  fetchPlans,
  FetchPlansAction,
  InterventionType,
  makePlansArraySelector,
  Plan,
  PlanFilters,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import reducer, { Message, reducerName, sendMessage } from '../../../../store/tests/ducks/messages';

reducerRegistry.register(reducerName, reducer);
reducerRegistry.register(plansReducerName, plansReducer);

/** Interface for props that come from the URL */
export interface RouteParams {
  jurisdictionId: string;
}

/** Interface for FIJurisdiction component props */
export interface FIJurisdictionProps {
  caseTriggeredPlans: Plan[] | null;
  fetchPlansActionCreator: typeof fetchPlans;
  loadMessages: typeof sendMessage;
  messages: Message[];
  routinePlans: Plan[] | null;
  supersetService: typeof supersetFetch;
}

/** default props for ActiveFI component */
export const defaultActiveFIProps: FIJurisdictionProps = {
  caseTriggeredPlans: null,
  fetchPlansActionCreator: fetchPlans,
  loadMessages: sendMessage,
  messages: [] as Message[],
  routinePlans: null,
  supersetService: supersetFetch,
};

/** This component is meant to display a list of focus investigations for a
 * given jurisdiction.  It is meant to display for the focus area i.e. the
 * lowest level jurisdiction
 */
const FIJurisdiction = (props: FIJurisdictionProps & RouteComponentProps<RouteParams>) => {
  const { caseTriggeredPlans, fetchPlansActionCreator, routinePlans, supersetService } = props;

  const jurisdictionId =
    '59ad4fa0-1945-4b50-a6e3-a056a7cdceb2' || props.match.params.jurisdictionId;

  // this gets FI plans for the current jurisdiction
  const supersetParams = superset.getFormData(2000, [
    { comparator: jurisdictionId, operator: '==', subject: 'jurisdiction_id' },
    { comparator: InterventionType.FI, operator: '==', subject: 'plan_intervention_type' },
  ]);

  useEffect(() => {
    supersetService(SUPERSET_PLANS_SLICE, supersetParams)
      .then((result: Plan[]) => fetchPlansActionCreator(result))
      .catch(err => displayError(err));
  }, []);

  console.log('routinePlans >>>> ', routinePlans);
  console.log('caseTriggeredPlans >>>> ', caseTriggeredPlans);
  return (
    <div>
      xxx
      <hr />
    </div>
  );
};

FIJurisdiction.defaultProps = defaultActiveFIProps;

const getPlansArray = makePlansArraySelector();

/** ObjectList options */
const objectListOptions = {
  actionCreator: fetchPlans,
  dispatchPropName: 'fetchPlansActionCreator',
  listPropName: 'routinePlans',
  selector: getPlansArray,
};

class JurisdictionList<ObjectType, ActionType, SelectorType, PropsType> extends ObjectList<
  ObjectType,
  ActionType,
  SelectorType,
  PropsType
> {
  public getMapStateToProps() {
    return (state: Registry, ownProps: any) => {
      const jurisdictionId =
        '59ad4fa0-1945-4b50-a6e3-a056a7cdceb2' || ownProps.match.params.jurisdictionId;

      const caseTriggeredFilters: PlanFilters = {
        interventionType: InterventionType.FI,
        jurisdictionIds: [jurisdictionId],
        reason: FIReasons[1],
        statusList: [PlanStatus.ACTIVE, PlanStatus.COMPLETE],
      };

      const routineFilters: PlanFilters = {
        ...caseTriggeredFilters,
        reason: FIReasons[0],
      };

      return {
        caseTriggeredPlans: getPlansArray(state, caseTriggeredFilters),
        routinePlans: getPlansArray(state, routineFilters),
      };
    };
  }
}

const cbv = new JurisdictionList<
  Plan,
  FetchPlansAction,
  typeof getPlansArray,
  FIJurisdictionProps & RouteComponentProps<RouteParams>
>(FIJurisdiction, objectListOptions);

/** This represents a fully redux-connected component that fetches data from
 * an API.
 */
export default cbv.render();
