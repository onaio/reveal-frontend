import { fetchManifestReleases, ManifestReleasesTypes } from '@opensrp/form-config';
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

const history = createBrowserHistory();

describe('containers/pages/ConfigForm/manifest/releases', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<ManifestReleasesPage />);
  });

  it('renders correctly', async () => {
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ManifestReleasesPage />
        </Router>
      </Provider>
    );
    await flushPromises();
    wrapper.update();
    // dispatch manifest files after store is initialized
    store.dispatch(fetchManifestReleases(fixManifestReleases as ManifestReleasesTypes[]));
    wrapper.update();

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Manifest Releases');
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('.page-title').text()).toEqual('Manifest Releases');

    expect(wrapper.find('ManifestReleases').props()).toMatchSnapshot();

    expect(wrapper.find('DrillDownTable').length).toEqual(1);
    // table renders two rows - equal to data
    expect(wrapper.find('.tbody .tr').length).toEqual(2);

    expect(wrapper.find('SearchBar').length).toEqual(1);
  });
});
