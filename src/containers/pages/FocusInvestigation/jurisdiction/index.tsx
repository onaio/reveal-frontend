import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import Loading from '../../../../components/page/Loading';
import { SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import { displayError } from '../../../../helpers/errors';
import supersetFetch from '../../../../services/superset';
import plansReducer, {
  fetchPlans,
  FetchPlansAction,
  InterventionType,
  makePlansArraySelector,
  Plan,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import reducer, { Message, reducerName, sendMessage } from '../../../../store/tests/ducks/messages';
import JurisdictionList from './JurisdictionList';

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
  const [loading, setLoading] = useState(true);

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
      .then((result: Plan[]) => {
        if (result) {
          fetchPlansActionCreator(result);
        } else {
          displayError(new Error('An error occurred'));
        }
      })
      .finally(() => setLoading(false))
      .catch(err => displayError(err));
  }, []);

  if (loading === true) {
    return <Loading />;
  }

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
