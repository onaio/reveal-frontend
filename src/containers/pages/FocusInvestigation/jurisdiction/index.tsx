import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { ObjectList } from '../../../../helpers/cbv';
import reducer, {
  Message,
  reducerName,
  selectAllMessages,
  sendMessage,
  SendMessageAction,
} from '../../../../store/tests/ducks/messages';

reducerRegistry.register(reducerName, reducer);

export interface FIJurisdictionProps {
  messages: Message[];
}

const options = {
  actionCreator: sendMessage,
  dispatchPropName: 'loadMessages',
  listPropName: 'messages',
  selector: selectAllMessages,
};

/** this is our dumb component */
const FIJurisdiction = (props: FIJurisdictionProps) => {
  const { messages } = props;
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
  messages: [] as Message[],
};

const cbv = new ObjectList<SendMessageAction>(FIJurisdiction, options);

/** This represents a fully redux-connected component that fetches data from
 * an API.
 */
export default cbv.render();
