import { mount } from 'enzyme';
import React from 'react';
import ConnectedTeamListView, { TeamListView } from '..';

describe('src/containers/TeamAssignment/TeamListview/', () => {
  it('a  dumb TeamListView correctly', () => {
    const wrapper = mount(<TeamListView />);

    // should display a breadcrumb

    // should have link to add team

    // should have form to search teams

    // should have a table
    wrapper.unmount();
  });

  it('E2E flow for searching a team', () => {
    // questions: how should search be done(probably initiate an api call)
    const wrapper = mount(<TeamListView />);

    // on submiting inlineSearchForm check for api queries
    // mock api query with result data check wrapper update
    wrapper.unmount();
  });

  it('works with redux store', () => {
    // checking connected component gets props from store
    const wrapper = mount(<ConnectedTeamListView />);

    // expect props from redux store.
    wrapper.unmount();
  });
});
