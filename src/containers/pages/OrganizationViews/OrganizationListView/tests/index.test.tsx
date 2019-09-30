import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { OPENSRP_ORGANIZATION_ENDPOINT, TEAM_LIST_URL } from '../../../../../constants';
import store from '../../../../../store';
import {
  fetchOrganizations,
  removeOrganizationsAction,
} from '../../../../../store/ducks/organizations';
import * as orgDucks from '../../../../../store/ducks/organizations';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedOrgsListView, { OrganizationListView } from '../../OrganizationListView';
import { state } from './fixtures';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('src/containers/TeamAssignment/TeamListview/', () => {
  beforeEach(() => {
    store.dispatch(removeOrganizationsAction);
    jest.resetAllMocks();
  });

  it('renders a dumb TeamListView correctly', () => {
    fetch.once(JSON.stringify(fixtures.organizations));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: TEAM_LIST_URL,
        url: TEAM_LIST_URL,
      },
      organizations: fixtures.organizations,
    };
    const wrapper = mount(
      <Router history={history}>
        <OrganizationListView {...props} />
      </Router>
    );

    // should display a breadcrumb
    expect(toJson(wrapper.find('Breadcrumb'))).toMatchSnapshot('Breadcrumb');

    // should have link to add team
    expect(wrapper.find(`LinkAsButton`).length).toEqual(1);

    // should have form to search teams
    expect(wrapper.find('input#search').length).toEqual(1);

    // should have a table
    expect(toJson(wrapper.find('tbody tr').first())).toMatchSnapshot(
      'First table record in listview'
    );
    wrapper.unmount();
  });

  it('Makes the expected calls to the opensrpService', async () => {
    const mockList = jest.fn(async () => fixtures.organizations);
    const classMock = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    const fetchedOrgsMock = jest.fn(arg => fetchOrganizations(arg));
    const mock: any = jest.fn();
    const props = {
      fetchOrganizationsAction: fetchedOrgsMock,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: TEAM_LIST_URL,
        url: TEAM_LIST_URL,
      },
      organizations: fixtures.organizations,
      serviceClass: classMock,
    };
    const wrapper = mount(
      <Router history={history}>
        <OrganizationListView {...props} />
      </Router>
    );

    await flushPromises();
    expect(classMock).toBeCalledWith(OPENSRP_ORGANIZATION_ENDPOINT);
    expect(mockList).toHaveBeenCalled();
    expect(fetchedOrgsMock).toHaveBeenCalledWith(fixtures.organizations);
  });

  xit('E2E flow for searching a team', () => {
    // questions: how should search be done(probably initiate an api call)
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: TEAM_LIST_URL,
        url: TEAM_LIST_URL,
      },
      organizations: fixtures.organizations,
    };
    const wrapper = mount(
      <Router history={history}>
        <OrganizationListView {...props} />
      </Router>
    );

    // simulating submitting from inlineSearchForm
    const inlineSearchForm = wrapper.find('Form');
    inlineSearchForm.simulate('submit');

    // now what?
    expect.assertions(999);
    wrapper.unmount();
  });

  it('TeamListView works correctly when connected to store', () => {
    fetch.once(JSON.stringify([]));
    const mock: any = jest.fn();
    store.dispatch(fetchOrganizations(fixtures.organizations));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: TEAM_LIST_URL,
        url: TEAM_LIST_URL,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedOrgsListView {...props} />
        </Router>
      </Provider>
    );

    // check that store data is part of passed props
    const foundProps = wrapper.find('OrganizationListView').props() as any;
    expect(foundProps.organizations).toEqual(fixtures.organizations);
    wrapper.unmount();
  });

  it('calls selectors with the right arguments', () => {
    // spy on selectors
    const organizationsArrayMock = jest.spyOn(orgDucks, 'getOrganizationsArray');

    fetch.once(JSON.stringify([]));
    const mock: any = jest.fn();
    store.dispatch(fetchOrganizations(fixtures.organizations));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: TEAM_LIST_URL,
        url: TEAM_LIST_URL,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedOrgsListView {...props} />
        </Router>
      </Provider>
    );

    expect(organizationsArrayMock).toHaveBeenCalled();
    expect(organizationsArrayMock.mock.calls[0]).toEqual([state]);
  });
});
