import reducerRegistry from '@onaio/redux-reducer-registry';
import {
  fetchManifestReleases,
  ManifestReleasesTypes,
  releasesReducer,
  releasesReducerName,
} from '@opensrp/form-config-core';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { ManifestReleasesPage } from '..';
import store from '../../../../../../store';
import { fixManifestReleases } from './fixtures';

/** register the reducers */
reducerRegistry.register(releasesReducerName, releasesReducer);

const history = createBrowserHistory();

describe('containers/pages/ConfigForm/manifest/releases', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<ManifestReleasesPage />);
  });

  it('renders manifest releases table correctly', async () => {
    store.dispatch(fetchManifestReleases(fixManifestReleases as ManifestReleasesTypes[]));

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ManifestReleasesPage />
        </Router>
      </Provider>
    );
    await flushPromises();
    wrapper.update();

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Releases');
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('.page-title').text()).toEqual('Releases');

    expect(wrapper.find('ManifestReleases').props()).toMatchSnapshot();

    expect(wrapper.find('DrillDownTable').length).toEqual(1);
    // table renders two rows - equal to data
    expect(wrapper.find('.tbody .tr').length).toEqual(2);

    expect(wrapper.find('SearchBar').length).toEqual(1);
  });
});
