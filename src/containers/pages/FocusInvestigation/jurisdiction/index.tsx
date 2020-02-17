import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect } from 'react';
import { ObjectList } from '../../../../helpers/cbv';
import { displayError } from '../../../../helpers/errors';
import { getURL } from '../../../../services/opensrp';
import reducer, {
  Message,
  reducerName,
  selectAllMessages,
  sendMessage,
  SendMessageAction,
} from '../../../../store/tests/ducks/messages';

reducerRegistry.register(reducerName, reducer);

/** Interface for props that come from the URL */
export interface RouteParams {
  jurisdiction_id: string;
}

export interface FIJurisdictionProps {
  loadMessages: typeof sendMessage;
  messages: Message[];
}

const options = {
  actionCreator: sendMessage,
  dispatchPropName: 'loadMessages',
  listPropName: 'messages',
  selector: selectAllMessages,
};

/** This component is meant to display a list of focus investigations for a
 * given jurisdiction.  It is meant to display for the focus area i.e. the
 * lowest level jurisdiction
 */
const FIJurisdiction = (props: FIJurisdictionProps) => {
  const { loadMessages, messages } = props;

  useEffect(() => {
    const requestOptions: RequestInit = {
      method: 'GET',
      mode: 'no-cors',
    };
    const params = { user: 'jaya', message: 'hello' };
    const url = getURL('https://postman-echo.com/get', params);
    fetch(url, requestOptions)
      .then(result => {
        loadMessages({ message: result.ok, user: result.type });
      })
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

FIJurisdiction.defaultProps = {
  loadMessages: sendMessage,
  messages: [] as Message[],
};

const cbv = new ObjectList<Message, SendMessageAction, typeof selectAllMessages>(
  FIJurisdiction,
  options
);

/** This represents a fully redux-connected component that fetches data from
 * an API.
 */
export default cbv.render();
