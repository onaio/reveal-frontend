import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { EDIT_TEAM, NEW_TEAM } from '../../../../../configs/lang';
import { EDIT_ORGANIZATION_URL, OPENSRP_ORGANIZATION_ENDPOINT } from '../../../../../constants';
import store from '../../../../../store';
import * as orgDucks from '../../../../../store/ducks/opensrp/organizations';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedCreateEditOrgView, { CreateEditOrgView } from '../../CreateEditOrgView';

reducerRegistry.register(orgDucks.reducerName, orgDucks.default);

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('src/containers/pages/CreateEditOrganization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(orgDucks.removeOrganizationsAction);
  });

  it('renders EditTeamView without crashing', () => {
    fetch.once(JSON.stringify(fixtures.organization1));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.organization1.identifier },
        path: `${EDIT_ORGANIZATION_URL}/:id`,
        url: `${EDIT_ORGANIZATION_URL}/${fixtures.organization1.identifier}`,
      },
      organization: fixtures.organization1,
    };
    shallow(
      <Router history={history}>
        <CreateEditOrgView {...props} />
      </Router>
    );
  });

  it('renders EditTeamsView correctly', () => {
    fetch.once(JSON.stringify(fixtures.organization1));
    store.dispatch(orgDucks.fetchOrganizations([fixtures.organization1]));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.organization1.identifier },
        path: `${EDIT_ORGANIZATION_URL}/:id`,
        url: `${EDIT_ORGANIZATION_URL}/${fixtures.organization1.identifier}`,
      },
      organization: fixtures.organization1,
    };
    const wrapper = mount(
      <Router history={history}>
        <CreateEditOrgView {...props} />
      </Router>
    );
    // look for crucial components or pages that should be displayed

    // expect a form
    expect(wrapper.find('form').length).toEqual(1);

    // page title
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(EDIT_TEAM);

    // breadcrumb
    const breadcrumbWrapper = wrapper.find('Breadcrumb');
    expect(breadcrumbWrapper.length).toEqual(1);

    // and the form?
    const form = wrapper.find('OrganizationForm');
    expect(form.length).toEqual(1);

    wrapper.unmount();
  });

  it('Calls the correct endpoints', async () => {
    const mockRead: any = jest.fn(async () => []);
    const serviceMock = jest.fn().mockImplementation(() => {
      return {
        read: mockRead,
      };
    });
    // loads a single organization,
    store.dispatch(orgDucks.fetchOrganizations([fixtures.organization1]));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.organization1.identifier },
        path: `${EDIT_ORGANIZATION_URL}/:id`,
        url: `${EDIT_ORGANIZATION_URL}/${fixtures.organization1.identifier}`,
      },
      organization: fixtures.organization1,
      serviceClass: serviceMock,
    };
    mount(
      <Router history={history}>
        <CreateEditOrgView {...props} />
      </Router>
    );

    expect(serviceMock).toHaveBeenCalled();
    expect(serviceMock).toHaveBeenCalledWith(OPENSRP_ORGANIZATION_ENDPOINT);
  });

  it('works correctly with the store', async () => {
    // check after connection if props are as they should be
    fetch.once(JSON.stringify(fixtures.organization1));
    store.dispatch(orgDucks.fetchOrganizations(fixtures.organizations));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.organization1.identifier },
        path: `${EDIT_ORGANIZATION_URL}/:id`,
        url: `${EDIT_ORGANIZATION_URL}/${fixtures.organization1.identifier}`,
      },
      organization: fixtures.organization1, // intentionally different
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedCreateEditOrgView {...props} />
        </Router>
      </Provider>
    );

    const connectedProps = wrapper.find('CreateEditOrgView').props();
    expect((connectedProps as any).organization).toEqual(fixtures.organization1);
  });
});

describe('src/containers/organizationViews/createEditview.createView', () => {
  it('renders page correctly on create Organization view', () => {
    // see it renders form when organization is null
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: `${EDIT_ORGANIZATION_URL}`,
        url: `${EDIT_ORGANIZATION_URL}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedCreateEditOrgView {...props} />
        </Router>
      </Provider>
    );
    // look for crucial components or pages that should be displayed

    // expect a form
    expect(wrapper.find('form').length).toEqual(1);

    // page title
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(NEW_TEAM);

    // breadcrumb
    const breadcrumbWrapper = wrapper.find('Breadcrumb');
    expect(breadcrumbWrapper.length).toEqual(1);

    // and the form?
    const form = wrapper.find('OrganizationForm');
    expect(form.length).toEqual(1);

    wrapper.unmount();
  });
});
