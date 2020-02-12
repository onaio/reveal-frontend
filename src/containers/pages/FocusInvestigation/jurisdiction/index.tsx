import * as React from 'react';
import { ObjectList } from '../../../../helpers/cbv';
import { Message, sendMessage } from '../../../../store/tests/ducks/messages';

interface Props {
  dispatchObjects: typeof sendMessage;
  messages: Message[];
}

const FIJurisdiction = (props: Props) => {
  const { dispatchObjects, messages } = props;
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

  const xxx = () => {
    dispatchObjects({ user: 'bob', message: 'hello' });
  };

  return (
    <div>
      {messageList}
      <hr />
      <span onClick={xxx}>Add Message</span>
    </div>
  );
};

FIJurisdiction.defaultProps = {
  messages: [] as Message[],
};

const objectList = new ObjectList(FIJurisdiction);

export default objectList.render();
