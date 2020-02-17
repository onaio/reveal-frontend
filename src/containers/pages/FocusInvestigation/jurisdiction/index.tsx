import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import { ObjectList } from '../../../../helpers/cbv';
import { displayError } from '../../../../helpers/errors';
import supersetFetch from '../../../../services/superset';
import plansReducer, {
  fetchPlans,
  InterventionType,
  Plan,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import reducer, {
  Message,
  reducerName,
  selectAllMessages,
  sendMessage,
  SendMessageAction,
} from '../../../../store/tests/ducks/messages';

reducerRegistry.register(reducerName, reducer);
reducerRegistry.register(plansReducerName, plansReducer);

/** Interface for props that come from the URL */
export interface RouteParams {
  jurisdiction_id: string;
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
  const { fetchPlansActionCreator, messages, supersetService } = props;

  const jurisdiction_id = props.match.params.jurisdiction_id;

  // this gets FI plans for the current jurisdiction
  const supersetParams = superset.getFormData(2000, [
    { comparator: jurisdiction_id, operator: '==', subject: 'jurisdiction_id' },
    { comparator: InterventionType.FI, operator: '==', subject: 'plan_intervention_type' },
  ]);

  useEffect(() => {
    supersetService(SUPERSET_PLANS_SLICE, supersetParams)
      .then((result: Plan[]) => fetchPlansActionCreator(result))
      .catch(err => displayError(err));
  }, []);

  const messageList =
    messages.length > 0 ? (
      <ul>
        {messages.map(e => (
          <li>
            {e.user}: {e.message}
          </li>
        ))}
      </ul>
    ) : (
      <div>nothing</div>
    );

  return (
    <div>
      {messageList}
      <hr />
    </div>
  );
};

FIJurisdiction.defaultProps = defaultActiveFIProps;

/** ObjectList options */
const objectListOptions = {
  actionCreator: sendMessage,
  dispatchPropName: 'loadMessages',
  listPropName: 'messages',
  selector: selectAllMessages,
};

const cbv = new ObjectList<Message, SendMessageAction, typeof selectAllMessages>(
  FIJurisdiction,
  objectListOptions
);

/** This represents a fully redux-connected component that fetches data from
 * an API.
 */
export default cbv.render();
