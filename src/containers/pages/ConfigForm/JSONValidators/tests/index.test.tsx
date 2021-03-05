import reducerRegistry from '@onaio/redux-reducer-registry';
import { fetchManifestFiles, filesReducer, filesReducerName } from '@opensrp/form-config-core';
import { OpenSRPService } from '@opensrp/server-service';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { JSONValidatorListPage } from '..';
import store from '../../../../../store';
import { fixManifestFiles } from './fixtures';

/** register the reducers */
reducerRegistry.register(filesReducerName, filesReducer);

const history = createBrowserHistory();

describe('containers/pages/ConfigForm/JSONValidator', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<JSONValidatorListPage />);
  });

  it('renders validators list correctly', async () => {
    const mockList = jest.fn();
    OpenSRPService.prototype.list = mockList;
    mockList.mockReturnValueOnce(Promise.resolve(fixManifestFiles));

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <JSONValidatorListPage />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    store.dispatch(fetchManifestFiles(fixManifestFiles));
    wrapper.update();

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('JSON Validators');
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('.page-title').text()).toEqual('JSON Validators');

    expect(wrapper.find('ManifestFilesList').props()).toMatchSnapshot();

    expect(wrapper.find('DrillDownTable').length).toEqual(1);
    await flushPromises();
    wrapper.update();
    // table renders two rows - equal to data
    expect(wrapper.find('.tbody .tr').length).toEqual(2);

    expect(wrapper.find('SearchBar').length).toEqual(1);
  });
});
