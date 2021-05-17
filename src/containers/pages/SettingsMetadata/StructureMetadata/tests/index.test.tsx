import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import {
  JURISDICTION_UPLOAD_STEP_1,
  JURISDICTION_UPLOAD_STEP_2,
  JURISDICTION_UPLOAD_STEP_3,
  JURISDICTION_UPLOAD_STEP_4,
  JURISDICTION_UPLOAD_STEP_5,
} from '../../../../../configs/lang';
import store from '../../../../../store';
import * as orgDucks from '../../../../../store/ducks/opensrp/organizations';
import StructureMetadataImportView from '../index';

reducerRegistry.register(orgDucks.reducerName, orgDucks.default);

const history = createBrowserHistory();

describe('src/containers/pages/StructureMetadata', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(orgDucks.removeOrganizationsAction);
  });

  it('renders page correctly', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <StructureMetadataImportView />
        </Router>
      </Provider>
    );
    // look for crucial components or pages that should be displayed

    // page title
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Structure Metadata');
    expect(wrapper.find('h3').text()).toEqual('Structure Metadata');

    // page card titles
    expect(wrapper.find('h5').map(title => title.text())).toEqual([
      'How To Update The Structure Metadata',
      'Upload Structure Metadata',
      'Download Structure Metadata',
    ]);

    // update structure metadata instructions
    expect(
      wrapper
        .find('ol')
        .at(1)
        .text()
    ).toEqual(
      `${JURISDICTION_UPLOAD_STEP_1}${JURISDICTION_UPLOAD_STEP_2}${JURISDICTION_UPLOAD_STEP_3}${JURISDICTION_UPLOAD_STEP_4}${JURISDICTION_UPLOAD_STEP_5}`
    );

    // breadcrumb
    const breadcrumbWrapper = wrapper.find('Breadcrumb');
    expect(breadcrumbWrapper.length).toEqual(1);
    expect(
      wrapper
        .find('ol')
        .at(0)
        .text()
    ).toEqual('HomeStructure Metadata');

    // GenericSettingsMetadata component
    expect(wrapper.find('GenericSettingsMetadata').length).toEqual(1);
    expect(wrapper.find('GenericSettingsMetadata').props()).toMatchSnapshot();

    // expect a form
    expect(wrapper.find('form').length).toEqual(3);
    expect(wrapper.find('JurisdictionMetadataForm').length).toEqual(1);
    expect(wrapper.find('JurisdictionMetadataDownloadForm').length).toEqual(1);
    expect(wrapper.find('JurisdictionHierachyDownloadForm').length).toEqual(1);

    wrapper.unmount();
  });
});
