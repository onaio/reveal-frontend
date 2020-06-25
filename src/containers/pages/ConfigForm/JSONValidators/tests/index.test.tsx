import reducerRegistry from '@onaio/redux-reducer-registry';
import {
  fetchManifestFiles,
  filesReducerName,
  manifestFilesReducer,
  ManifestFilesTypes,
} from '@opensrp/form-config';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { JSONValidatorListPage } from '..';
import store from '../../../../../store';
import { fixManifestFiles } from './fixtures';

/** register the reducers */
reducerRegistry.register(filesReducerName, manifestFilesReducer);

const history = createBrowserHistory();

describe('containers/pages/ConfigForm/JSONValidator', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<JSONValidatorListPage />);
  });

  it('renders validators list correctly', async () => {
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <JSONValidatorListPage />
        </Router>
      </Provider>
    );
    await flushPromises();
    wrapper.update();
    // dispatch manifest files after store is initialized
    store.dispatch(fetchManifestFiles(fixManifestFiles as ManifestFilesTypes[]));
    wrapper.update();

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('JSON Validators');
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('.page-title').text()).toEqual('JSON Validators');

    expect(wrapper.find('ManifestFilesList').props()).toMatchSnapshot();

    expect(wrapper.find('DrillDownTable').length).toEqual(1);
    // table renders two rows - equal to data
    expect(wrapper.find('.tbody .tr').length).toEqual(2);

    expect(wrapper.find('SearchBar').length).toEqual(1);
  });
});
