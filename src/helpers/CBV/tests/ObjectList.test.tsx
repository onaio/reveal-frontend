import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import store from '../../../store';
import reducer, {
  Message,
  reducerName,
  selectAllMessages,
  sendMessage,
  SendMessageAction,
} from '../../../store/tests/ducks/messages';
import { ObjectList } from '../ObjectList';

/** register reducers */
reducerRegistry.register(reducerName, reducer);

interface TestProps {
  actionCreator: typeof sendMessage;
  callbackFunc?: () => void;
  messages: Message[];
}

const TestComponent = (_: TestProps) => <div>mosh</div>;

/** ObjectList options */
const objectListOptions = {
  actionCreator: sendMessage,
  dispatchPropName: 'actionCreator',
  returnPropName: 'messages',
  selector: selectAllMessages,
};

const ClassBasedView = new ObjectList<
  Message,
  SendMessageAction,
  typeof selectAllMessages,
  TestProps
>(TestComponent, objectListOptions);

describe('cbv/ObjectList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('getMapStateToProps works as expected', () => {
    const mapStateToProps = ClassBasedView.getMapStateToProps();

    expect(typeof mapStateToProps === 'function').toBeTruthy();

    expect(mapStateToProps(store.getState(), {} as any)).toEqual({ messages: [] });

    store.dispatch(sendMessage({ user: 'bob', message: 'hello' }));
    store.dispatch(sendMessage({ user: 'bobbie', message: 'hello hello' }));

    expect(mapStateToProps(store.getState(), {} as any)).toEqual({
      messages: [{ user: 'bob', message: 'hello' }, { user: 'bobbie', message: 'hello hello' }],
    });
  });

  it('getMapDispatchToProps works as expected', () => {
    const mapDispatchToProps = ClassBasedView.getMapDispatchToProps();
    expect(typeof mapDispatchToProps === 'function').toBeFalsy();
    expect(mapDispatchToProps).toEqual({ actionCreator: sendMessage });
  });

  it('getHOC works as expected', () => {
    const HoC = ClassBasedView.getHOC();

    const wrapper = mount(
      <Provider store={store}>
        <HoC />
      </Provider>
    );

    const expected = {
      actionCreator: sendMessage,
      objectList: [],
    };

    expect(wrapper.find('HoC').props()).toEqual(expected);
    expect(wrapper.find('HoC>TestComponent').props()).toEqual(expected);
  });

  // it('getConnectedHOC works as expected', () => {
  // });
  // it('render works as expected', () => {
  // });
});
