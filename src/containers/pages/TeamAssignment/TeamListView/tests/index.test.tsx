import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import ConnectedTeamListView, { TeamListView } from '..';
import { CREATE_TEAM_URL } from '../../../../../constants';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

describe('src/containers/TeamAssignment/TeamListview/', () => {
  it('a  dumb TeamListView correctly', () => {
    const wrapper = mount(<TeamListView />);

    // should display a breadcrumb
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot('Header Breadcrumb');

    // should have link to add team
    expect(wrapper.find('LinkAsButton').length).toEqual(1);

    // should have form to search teams
    expect(wrapper.find('#search').length).toEqual(1);

    // should have a table
    wrapper.unmount();
  });

  it('E2E flow for searching a team', () => {
    // questions: how should search be done(probably initiate an api call)
    const wrapper = mount(<TeamListView />);

    // simulating submitting from inlineSearchForm
    const inlineSearchForm = wrapper.find('Form');
    inlineSearchForm.simulate('submit');

    // now what?

    wrapper.unmount();
  });

  it('E2E flow for adding a team', () => {
    // so basically clicking add team redirects
    const wrapper = mount(<TeamListView />);

    const addTeamLink = wrapper.find('.btn.btn-primary.float-right.mt-5');
    addTeamLink.simulate('click');
    wrapper.update();

    expect(wrapper.props().location.pathname).toEqual(CREATE_TEAM_URL);
    wrapper.unmount();
  });

  it('works with redux store', () => {
    // checking connection btwn dumb component and store
    const wrapper = mount(<ConnectedTeamListView />);

    const receivedProps = wrapper.find(TeamListView).props();

    // expect props from redux store.
    expect(receivedProps.teams).toEqual(fixtures.teams);
    wrapper.unmount();
  });
});
