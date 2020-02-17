import { ActionCreator, AnyAction, Store } from 'redux';

export const reducerName = 'messages';

// actions
export const SEND_MESSAGE = 'reveal-test/reducer/SEND_MESSAGE';

export interface Message {
  user: string;
  message: string;
}

export interface SendMessageAction extends AnyAction {
  payload?: Message;
  type: typeof SEND_MESSAGE;
}

export type MessageActionTypes = SendMessageAction;

interface MessageState {
  messages: Message[];
}

const initialState: MessageState = {
  messages: [],
};

export default function reducer(state = initialState, action: MessageActionTypes): MessageState {
  switch (action.type) {
    case SEND_MESSAGE:
      if (action.payload) {
        return { messages: [...state.messages, action.payload] };
      }
      return state;
    default:
      return state;
  }
}

// action creators
export const sendMessage: ActionCreator<SendMessageAction> = (newMessage: Message) => ({
  payload: newMessage,
  type: SEND_MESSAGE,
});

// selectors
export function selectAllMessages(state: Partial<Store>): Message[] {
  return (state as any)[reducerName].messages;
}
