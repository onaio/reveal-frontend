import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import store from '../store';
import reducer, {
  reducerName,
  selectAllMessages,
  sendMessage,
} from '../store/tests/ducks/messages';

reducerRegistry.register(reducerName, reducer);

interface ObjectListOptions {
  listPropName: string;
  dispatchPropName: string;
}

interface ObjectListProps {
  actionCreator: any;
  objectList: any;
}

export class ObjectList {
  public Component: any;
  public options: ObjectListOptions;

  constructor(component: any, options: ObjectListOptions) {
    this.Component = component;
    this.options = options;
  }

  public loadData() {
    store.dispatch(sendMessage({ user: 'bob', message: 'hello' }));
    store.dispatch(sendMessage({ user: 'brayo', message: 'sasa' }));
    store.dispatch(sendMessage({ user: 'Swale', message: 'habari' }));
    store.dispatch(sendMessage({ user: 'ras', message: 'yeiya' }));
  }

  public getHOC() {
    const NewComponent = (props: ObjectListProps) => {
      const { actionCreator, objectList } = props;
      const propsToPass = {
        [this.options.dispatchPropName]: actionCreator,
        [this.options.listPropName]: objectList,
      };
      return <this.Component {...propsToPass} />;
    };

    return NewComponent;
  }

  public getMapDispatchToProps() {
    return { actionCreator: sendMessage };
  }

  public getMapStateToProps() {
    return (state: Partial<Store>): any => {
      return {
        objectList: selectAllMessages(state),
      };
    };
  }

  public getConnectedHOC() {
    /** map dispatch to props */
    const mapDispatchToProps = this.getMapDispatchToProps();
    /** map state to props */
    const mapStateToProps = this.getMapStateToProps();
    /** connect to store */
    return connect(
      mapStateToProps,
      mapDispatchToProps
    )(this.getHOC());
  }

  public render() {
    this.loadData();
    return this.getConnectedHOC();
  }
}
