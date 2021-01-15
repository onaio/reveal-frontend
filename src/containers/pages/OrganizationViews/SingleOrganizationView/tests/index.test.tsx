import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { TEAM } from '../../../../../configs/lang';
import { SINGLE_ORGANIZATION_URL } from '../../../../../constants';
import store from '../../../../../store';
import * as organizationDucks from '../../../../../store/ducks/opensrp/organizations';
import * as practitionersDucks from '../../../../../store/ducks/opensrp/practitioners';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedSingleOrgView, { SingleOrganizationView } from '../../SingleOrganizationView';

reducerRegistry.register(practitionersDucks.reducerName, practitionersDucks.default);
reducerRegistry.register(organizationDucks.reducerName, organizationDucks.default);

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

describe('src/containers/pages/OrganizationViews', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(practitionersDucks.removePractitionersAction);
    store.dispatch(organizationDucks.removeOrganizationsAction);
    fetch.resetMocks();
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
        path: `${SINGLE_ORGANIZATION_URL}/:id`,
        url: `${SINGLE_ORGANIZATION_URL}/teamId`,
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
    fetch.once(JSON.stringify(fixtures.organization1)).once(JSON.stringify([]));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: `${SINGLE_ORGANIZATION_URL}/:id`,
        url: `${SINGLE_ORGANIZATION_URL}/teamId`,
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
    expect(toJson(wrapper.find('Breadcrumb'))).toMatchSnapshot('Breadcrumb');

    // text wise : check for the team Name text - should be in the top-most tier header
    const pageTitle = wrapper.find('.page-title');
    expect(pageTitle.length).toEqual(1);
    expect(pageTitle.text()).toEqual(`${fixtures.organization1.name}`);

    // check: team details div(snapshot)
    expect(wrapper.find('#organization-details').length).toEqual(1);

    // check: team members div(snapshot)
    expect(wrapper.find(ListView).length).toEqual(1);
    wrapper.unmount();
  });

  it('Plays well with the store', async () => {
    // it gets data from store correctly
    store.dispatch(organizationDucks.fetchOrganizations([fixtures.organization3]));
    store.dispatch(
      practitionersDucks.fetchPractitioners(
        fixtures.org3Practitioners,
        false,
        fixtures.organization3.identifier
      )
    );

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
        path: `${SINGLE_ORGANIZATION_URL}/:id`,
        url: `${SINGLE_ORGANIZATION_URL}/1`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleOrgView {...props} />
        </Router>
      </Provider>
    );

    const passedProps = wrapper.find(SingleOrganizationView).props() as any;
    expect(passedProps.organization).toEqual(fixtures.organization3);
    expect(passedProps.practitioners).toEqual(fixtures.org3Practitioners);
  });

  it('Deleting api calls for removing a practitioner from an organization', async () => {
    // removing a practitioner from an organization workflow
    fetch
      .once(JSON.stringify(fixtures.organization3))
      .once(JSON.stringify(fixtures.org3Practitioners))
      .once(JSON.stringify([]), { status: 204 })
      .once(JSON.stringify([fixtures.practitioner1, fixtures.practitioner2]));

    const mock: any = jest.fn();

    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.organization3.identifier },
        path: `${SINGLE_ORGANIZATION_URL}/:id`,
        url: `${SINGLE_ORGANIZATION_URL}/${fixtures.organization3.identifier}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleOrgView {...props} />
        </Router>
      </Provider>
    );

    await new Promise<any>(resolve => setImmediate(resolve));
    // simulate removal action
    wrapper.update();
    const practitioner4RemoveLink = wrapper.findWhere(node => node.key() === 'healer');
    expect(toJson(practitioner4RemoveLink)).toMatchSnapshot('Practitioner 4 removal link');
    practitioner4RemoveLink.simulate('click');
    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    // now search & expect a delete request from fetch
    const expectedRequest = [
      'https://test.smartregister.org/opensrp/rest/practitionerRole/deleteByPractitioner?organization=d23f7350-d406-11e9-bb65-2a2ae2dbcce4&practitioner=healer',
      {
        headers: {
          accept: 'application/json',
          authorization: 'Bearer null',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'DELETE',
      },
    ];

    expect(fetch.mock.calls[2]).toEqual(expectedRequest);
  });
});
