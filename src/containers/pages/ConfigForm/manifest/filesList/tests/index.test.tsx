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
import { ManifestFiles } from '..';
import { MANIFEST_RELEASES } from '../../../../../../configs/lang';
import { MANIFEST_RELEASE_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import { FixManifestReleaseFiles } from './fixtures';

/** register the reducers */
reducerRegistry.register(filesReducerName, manifestFilesReducer);

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
    path: `${MANIFEST_RELEASES}`,
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
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ManifestFiles {...props} />
        </Router>
      </Provider>
    );
    await flushPromises();
    wrapper.update();
    // dispatch manifest files after store is initialized
    store.dispatch(fetchManifestFiles(FixManifestReleaseFiles as ManifestFilesTypes[]));
    wrapper.update();

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Manifest Releases: 1.0.1');
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('.page-title').text()).toEqual('Manifest Releases: 1.0.1');

    expect(wrapper.find('ManifestFilesList').props()).toMatchSnapshot();

    expect(wrapper.find('DrillDownTable').length).toEqual(1);
    // table renders two rows - equal to data
    expect(wrapper.find('.tbody .tr').length).toEqual(2);

    expect(wrapper.find('SearchBar').length).toEqual(1);
  });
});
