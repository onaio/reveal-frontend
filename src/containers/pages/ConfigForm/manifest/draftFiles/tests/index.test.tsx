import reducerRegistry from '@onaio/redux-reducer-registry';
import {
  draftReducer,
  draftReducerName,
  fetchManifestDraftFiles,
  ManifestFilesTypes,
} from '@opensrp/form-config-core';
import { OpenSRPService } from '@opensrp/server-service';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { ManifestDraftFilesPage } from '..';
import store from '../../../../../../store';
import { FixManifestDraftFiles } from './fixtures';

const history = createBrowserHistory();

/** register the reducers */
reducerRegistry.register(draftReducerName, draftReducer);

describe('containers/pages/ConfigForm/manifest/draftFiles', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<ManifestDraftFilesPage />);
  });

  it('renders draft files table correctly', async () => {
    store.dispatch(fetchManifestDraftFiles(FixManifestDraftFiles as ManifestFilesTypes[]));
    const mockList = jest.fn();
    OpenSRPService.prototype.list = mockList;
    mockList.mockReturnValueOnce(Promise.resolve(FixManifestDraftFiles));

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ManifestDraftFilesPage />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Draft Files');
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('.page-title').text()).toEqual('Draft Files');

    expect(wrapper.find('DrillDownTable').length).toEqual(1);
    expect(wrapper.find('ManifestDraftFiles').props()).toMatchSnapshot();

    // table renders two rows - equal to data
    expect(wrapper.find('.tbody .tr').length).toEqual(2);

    expect(wrapper.find('SearchBar').length).toEqual(1);
  });
});
