import reducerRegistry from '@onaio/redux-reducer-registry';
import { connect } from 'react-redux';
import { Store } from 'redux';
import reducer, { selectAllMessages, sendMessage } from '../store/tests/ducks/messages';

reducerRegistry.register('messages', reducer);

export class ObjectList {
  public Component: any;

  constructor(component: any) {
    this.Component = component;
  }

  public render() {
    // map dispatch to props
    const mapDispatchToProps = { dispatchObjects: sendMessage };
    /** map state to props */
    const mapStateToProps = (state: Partial<Store>): any => {
      return {
        messages: selectAllMessages(state),
      };
    };

    return connect(
      mapStateToProps,
      mapDispatchToProps
    )(this.Component);
  }
}
