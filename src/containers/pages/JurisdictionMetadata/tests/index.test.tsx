import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { UPLOAD_JURISDICTION_METADATA } from '../../../../configs/lang';
import { UPLOAD_JURISDICTION_METADATA_URL } from '../../../../constants';
import store from '../../../../store';
import * as orgDucks from '../../../../store/ducks/opensrp/organizations';
import JurisdictionMetadataImportView from '../index';

reducerRegistry.register(orgDucks.reducerName, orgDucks.default);

const history = createBrowserHistory();

describe('src/containers/pages/JurisdictionMetadata', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(orgDucks.removeOrganizationsAction);
  });

  it('renders page correctly', () => {
    // see it renders form when organization is null
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: `${UPLOAD_JURISDICTION_METADATA_URL}`,
        url: `${UPLOAD_JURISDICTION_METADATA_URL}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <JurisdictionMetadataImportView {...props} />
        </Router>
      </Provider>
    );
    // look for crucial components or pages that should be displayed

    // expect a form
    expect(wrapper.find('form').length).toEqual(1);

    // page title
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(UPLOAD_JURISDICTION_METADATA);

    // breadcrumb
    const breadcrumbWrapper = wrapper.find('Breadcrumb');
    expect(breadcrumbWrapper.length).toEqual(1);

    // and the form?
    const form = wrapper.find('JurisdictionMetadataForm');
    expect(form.length).toEqual(1);

    wrapper.unmount();
  });
});
