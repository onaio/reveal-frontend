import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import {
  EDIT_ORGANIZATION_URL,
  NEW_TEAM,
  OPENSRP_ORGANIZATION_ENDPOINT,
} from '../../../../../constants';
import store from '../../../../../store';
import * as orgDucks from '../../../../../store/ducks/organization';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedCreateEditTeamView, { CreateEditTeamView } from '../../CreateEditOrgView';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('src/containers/pages/NewTeamView', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(orgDucks.removeOrganizations);
  });

  it('renders NewTeamView without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${EDIT_ORGANIZATION_URL}/:id`,
        url: `${EDIT_ORGANIZATION_URL}/teamId`,
      },
      team: fixtures.organization1,
    };
    shallow(
      <Router history={history}>
        <CreateEditTeamView {...props} />
      </Router>
    );
  });

  it('renders NewTeamsView correctly', () => {
    fetch.once(JSON.stringify([]));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${EDIT_ORGANIZATION_URL}/:id`,
        url: `${EDIT_ORGANIZATION_URL}/teamId`,
      },
      team: fixtures.organization1,
    };
    const wrapper = mount(
      <Router history={history}>
        <CreateEditTeamView {...props} />
      </Router>
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

  it('Calls the correct endpoints', () => {
    const serviceMock: any = jest.fn();
    // loads a single organization,
    fetch.once(JSON.stringify([]));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${EDIT_ORGANIZATION_URL}/:id`,
        url: `${EDIT_ORGANIZATION_URL}/teamId`,
      },
      serviceClass: serviceMock,
      team: fixtures.organization1,
    };
    mount(
      <Router history={history}>
        <CreateEditTeamView {...props} />
      </Router>
    );

    expect(serviceMock).toHaveBeenCalled();
    expect(serviceMock).toHaveBeenCalledWith(
      `${OPENSRP_ORGANIZATION_ENDPOINT}/${fixtures.organization1.id}`
    );
  });

  it('calls selectors with the correct arguments', () => {
    const organizationByIdMock = jest.spyOn(orgDucks, 'getOrganizationById');
    fetch.once(JSON.stringify([]));
    store.dispatch(orgDucks.fetchOrganizations(fixtures.organizations));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${EDIT_ORGANIZATION_URL}/:id`,
        url: `${EDIT_ORGANIZATION_URL}/fixtures.organization1`,
      },
    };
    mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedCreateEditTeamView {...props} />
        </Router>
      </Provider>
    );

    expect(organizationByIdMock.mock.calls[0]).toEqual([]);
  });

  it('works correctly with the store', () => {
    // check after connection if props are as they should be
    fetch.once(JSON.stringify([]));
    store.dispatch(orgDucks.fetchOrganizations(fixtures.organizations));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${EDIT_ORGANIZATION_URL}/:id`,
        url: `${EDIT_ORGANIZATION_URL}/fixtures.organization1`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedCreateEditTeamView {...props} />
        </Router>
      </Provider>
    );

    const connectedProps = wrapper.find('ConnectedCreateEditTeamView').props();
    expect(connectedProps.organization).toEqual(fixtures.organization1);
  });
});
