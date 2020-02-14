import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { displayError } from '../helpers/errors';
import { getURL } from '../services/opensrp';
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

  public async fetchData() {
    const requestOptions: RequestInit = {
      method: 'GET',
      mode: 'no-cors',
    };
    const params = { user: 'jaya', message: 'hello' };
    const url = getURL('https://postman-echo.com/get', params);
    return await fetch(url, requestOptions);
  }

  public getHOC() {
    const NewComponent = (props: ObjectListProps) => {
      const { actionCreator, objectList } = props;

      useEffect(() => {
        this.fetchData()
          .then(result => actionCreator({ message: result.ok, user: result.type }))
          .catch(err => displayError(err));
      }, []);

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
    return this.getConnectedHOC();
  }
}
