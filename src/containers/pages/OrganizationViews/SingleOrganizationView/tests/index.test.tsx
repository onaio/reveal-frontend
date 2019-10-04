import ListView from '@onaio/list-view';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { SINGLE_TEAM_URL, TEAM } from '../../../../../constants';
import store from '../../../../../store';
import * as organizationDucks from '../../../../../store/ducks/opensrp/organizations';
import * as practitionersDucks from '../../../../../store/ducks/opensrp/practitioners';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedSingleOrgView, { SingleOrganizationView } from '../../SingleOrganizationView';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('src/containers/pages/TeamAssignment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders SingleTeamView without crashing', () => {
    // clean test: check for conditions resulting in errors
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${SINGLE_TEAM_URL}/:id`,
        url: `${SINGLE_TEAM_URL}/teamId`,
      },
      organization: fixtures.organization1,
      practitioners: fixtures.practitioners,
    };

    shallow(
      <Router history={history}>
        <SingleOrganizationView {...props} />
      </Router>
    );
  });

  it('renders SingleTeamView correctly', () => {
    // clean test: check for stuff that can only be present if page loaded
    fetch.once(JSON.stringify([])).once(JSON.stringify([]));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${SINGLE_TEAM_URL}/:id`,
        url: `${SINGLE_TEAM_URL}/teamId`,
      },
      organization: fixtures.organization1,
      practitioners: [fixtures.practitioner1],
    };

    const wrapper = mount(
      <Router history={history}>
        <SingleOrganizationView {...props} />
      </Router>
    );

    // check for page title is set
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(`${TEAM} - ${fixtures.organization1.name}`);

    // check for breadcrumbs is set
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot('HeaderBreadcrumb');

    // text wise : check for the team Name text - should be in the top-most tier header
    const pageTitle = wrapper.find('.page-title');
    expect(pageTitle.length).toEqual(1);
    expect(pageTitle.text()).toEqual(`${fixtures.organization1.name}`);

    // check: team details div(snapshot)
    expect(toJson(wrapper.find('#team-details'))).toMatchSnapshot('TeamDetails');

    // check: team members div(snapshot)
    expect(wrapper.find(ListView).length).toEqual(1);
    wrapper.unmount();
  });

  it('Plays well with the store', async () => {
    // it gets data from store correctly
    store.dispatch(organizationDucks.fetchOrganizations([fixtures.organization3]));
    store.dispatch(
      practitionersDucks.fetchPractitionerRoles(
        fixtures.org3Practitioners,
        fixtures.organization3.identifier
      )
    );

    fetch
      .once(JSON.stringify([fixtures.organization3]))
      .once(JSON.stringify(fixtures.org3Practitioners));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: `${fixtures.organization3.identifier}` },
        path: `${SINGLE_TEAM_URL}/:id`,
        url: `${SINGLE_TEAM_URL}/1`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleOrgView {...props} />
        </Router>
      </Provider>
    );

    await new Promise(resolve => setImmediate(resolve));

    const passedProps = wrapper.find(SingleOrganizationView).props() as any;
    expect(passedProps.team).toEqual(fixtures.organization1);
    expect(passedProps.teamMembers).toEqual([fixtures.practitioner1]);
  });

  it('calls api correctly', async () => {
    // api calls are correct.
    const mock: any = jest.fn();
    const mockRead: any = jest.fn(async () => []);
    const mockList: any = jest.fn(async () => []);
    const serviceMock: any = jest.fn(() => {
      return {
        list: mockList,
        read: mockRead,
      };
    });

    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: `${fixtures.organization3.identifier}` },
        path: `${SINGLE_TEAM_URL}/:id`,
        url: `${SINGLE_TEAM_URL}/1`,
      },
    };
    mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleOrgView {...props} />
        </Router>
      </Provider>
    );
    await new Promise(resolve => setImmediate(resolve));

    expect(serviceMock).toHaveBeenCalledTimes(2);
    expect(mockRead.mock.calls).toHaveBeenCalledWith(fixtures.organization3.identifier);
    // expect(mockList.mock.calls).toHaveBeenCalledWith();
    expect.assertions(3);
  });

  xit('Deleting api calls for removing a practitioner from an organization', async () => {
    // removing a practitioner from an organization workflow
    fetch
      .once(JSON.stringify(fixtures.organization3))
      .once(JSON.stringify(fixtures.org3Practitioners));
    const mock: any = jest.fn();
    const mockDelete: any = jest.fn(async () => []);
    const serviceMock: any = jest.fn(() => {
      return {
        delete: mockDelete,
      };
    });

    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '1' },
        path: `${SINGLE_TEAM_URL}/:id`,
        url: `${SINGLE_TEAM_URL}/1`,
      },
    };
    mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleOrgView {...props} />
        </Router>
      </Provider>
    );
    await new Promise(resolve => setImmediate(resolve));
    // simulate removal action

    expect(serviceMock).toHaveBeenCalledTimes(3);
    expect(mockDelete.mock.calls).toHaveBeenCalledWith();
    expect.assertions(3);
  });
});

describe('src/../singleOrganization.selectors', () => {
  it('selectors are called with the correct arguments', async () => {
    // calls selectors correctly
    const organizationByIdMock = jest.spyOn(organizationDucks, 'getOrganizationById');
    const practitionerByOrgIdMock = jest.spyOn(practitionersDucks, 'getPractitionersByOrgId');

    fetch
      .once(JSON.stringify(fixtures.organization3))
      .once(JSON.stringify(fixtures.org3Practitioners));

    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: `${fixtures.organization3.identifier}` },
        path: `${SINGLE_TEAM_URL}/:id`,
        url: `${SINGLE_TEAM_URL}/1`,
      },
    };
    mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleOrgView {...props} />
        </Router>
      </Provider>
    );

    await new Promise(resolve => setImmediate(resolve));
    expect(organizationByIdMock.mock.calls).toEqual([
      selectorState,
      fixtures.organization3.identifier,
    ]);
    expect(practitionerByOrgIdMock.mock.calls).toEqual([
      selectorState,
      fixtures.organization3.identifier,
    ]);
  });
});
