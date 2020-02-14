import * as React from 'react';
import { ObjectList } from '../../../../helpers/cbv';
import { Message } from '../../../../store/tests/ducks/messages';

interface Props {
  messages: Message[];
}

const options = {
  dispatchPropName: 'loadMessages',
  listPropName: 'messages',
};

/** this is our dumb component */
const FIJurisdiction = (props: Props) => {
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

const cbv = new ObjectList(FIJurisdiction, options);

/** This represents a fully redux-connected component that fetches data from
 * an API.
 */
export default cbv.render();
