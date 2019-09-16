import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { TEAM_LIST_URL } from '../../../../../constants';
import store from '../../../../../store';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedOrgsListView, {
  OrgsListViewPropsType,
  TeamListView,
} from '../../OrganizationListView';

const history = createBrowserHistory();

describe('src/containers/TeamAssignment/TeamListview/', () => {
  it('a  dumb TeamListView correctly', () => {
    const mock: any = jest.fn();
    const props: OrgsListViewPropsType = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: TEAM_LIST_URL,
        url: TEAM_LIST_URL,
      },
      teams: fixtures.organizations,
    };
    const wrapper = mount(
      <Router history={history}>
        <TeamListView {...props} />
      </Router>
    );

    // should display a breadcrumb
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot('Header Breadcrumb');

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

  it('E2E flow for searching a team', () => {
    // questions: how should search be done(probably initiate an api call)
    const mock: any = jest.fn();
    const props: OrgsListViewPropsType = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '' },
        path: TEAM_LIST_URL,
        url: TEAM_LIST_URL,
      },
      teams: fixtures.organizations,
    };
    const wrapper = mount(
      <Router history={history}>
        <TeamListView {...props} />
      </Router>
    );

    // simulating submitting from inlineSearchForm
    const inlineSearchForm = wrapper.find('Form');
    inlineSearchForm.simulate('submit');

    // now what?
    //   expect.assertions(999);
    wrapper.unmount();
  });

  it('TeamListView works correctly when connected to store', () => {
    // questions: how should search be done(probably initiate an api call)
    const mock: any = jest.fn();
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
    const foundProps = wrapper.find('TeamListView').props() as any;
    expect(foundProps.teams).toEqual(fixtures.organizations);
    wrapper.unmount();
  });
});
