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
import { ManifestFiles } from '..';
import { RELEASES_LABEL } from '../../../../../../configs/lang';
import { MANIFEST_RELEASE_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import { FixManifestFiles } from './fixtures';

/** register the reducers */
reducerRegistry.register(filesReducerName, filesReducer);

const history = createBrowserHistory();

const props = {
  history,
  location: {
    hash: '',
    pathname: MANIFEST_RELEASE_URL,
    search: '',
    state: undefined,
  },
  match: {
    isExact: true,
    params: {
      id: '1.0.1',
    },
    path: `${RELEASES_LABEL}`,
    url: `${MANIFEST_RELEASE_URL}`,
  },
};

describe('containers/pages/ConfigForm/manifest/ManifestFiles', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<ManifestFiles {...props} />);
  });

  it('renders release file table correctly', async () => {
    const mockList = jest.fn();
    OpenSRPService.prototype.list = mockList;
    mockList.mockReturnValueOnce(Promise.resolve(FixManifestFiles));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ManifestFiles {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    store.dispatch(fetchManifestFiles(FixManifestFiles));
    wrapper.update();

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Releases: 1.0.1');
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('.page-title').text()).toEqual('Releases: 1.0.1');

    expect(wrapper.find('ManifestFilesList').props()).toMatchSnapshot();

    expect(wrapper.find('DrillDownTable').length).toEqual(1);
    await flushPromises();
    wrapper.update();
    // table renders two rows - equal to data
    expect(wrapper.find('.tbody .tr').length).toEqual(2);

    expect(wrapper.find('SearchBar').length).toEqual(1);
  });
});
