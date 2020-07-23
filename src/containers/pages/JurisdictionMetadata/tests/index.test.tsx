import reducerRegistry from '@onaio/redux-reducer-registry';
import { waitFor } from '@testing-library/react';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { JURISDICTION_METADATA } from '../../../../configs/lang';
import { JURISDICTION_METADATA_URL } from '../../../../constants';
import * as helperUtils from '../../../../helpers/utils';
import store from '../../../../store';
import * as orgDucks from '../../../../store/ducks/opensrp/organizations';
import * as fixtures from '../../../../store/ducks/tests/fixtures';
import JurisdictionMetadataImportView, { downloadCsvTemplate } from '../index';

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
        path: `${JURISDICTION_METADATA_URL}`,
        url: `${JURISDICTION_METADATA_URL}`,
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
    expect(wrapper.find('form').length).toEqual(3);

    // page title
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(JURISDICTION_METADATA);

    // breadcrumb
    const breadcrumbWrapper = wrapper.find('Breadcrumb');
    expect(breadcrumbWrapper.length).toEqual(1);

    // and the form?
    const form = wrapper.find('JurisdictionMetadataForm');
    expect(form.length).toEqual(1);

    wrapper.unmount();
  });

  it('downloads CSV template', async () => {
    const mockDownload: any = jest.fn();
    (helperUtils as any).downloadFile = mockDownload;
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        list: () => {
          return Promise.resolve(fixtures.jurisdictionsResponse);
        },
      };
    });
    downloadCsvTemplate(mockedOpenSRPservice);
    await waitFor(() => {
      expect(mockedOpenSRPservice).toHaveBeenCalledTimes(1);
      expect(mockDownload).toBeCalled();
    });
  });
});
