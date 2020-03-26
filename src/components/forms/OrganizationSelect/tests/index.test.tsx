import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import OrganizationSelect from '..';
import ConnectedOrganizationSelect from '..';
import store from '../../../../store';
import assignmentReducer, {
  fetchAssignments,
  reducerName as assignmentReducerName,
} from '../../../../store/ducks/opensrp/assignments';
import organizationsReducer, {
  fetchOrganizations,
  reducerName as organizationsReducerName,
} from '../../../../store/ducks/opensrp/organizations';
import * as ducksFixtures from '../../../../store/ducks/tests/fixtures';

jest.mock('../../../../configs/env');

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

reducerRegistry.register(assignmentReducerName, assignmentReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);

describe('/containers/forms/OrganizationSelect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<OrganizationSelect />);

    mount(
      <Provider store={store}>
        <OrganizationSelect jurisdictionId="" name="" planId="" />
      </Provider>
    );
  });

  it('renders select options correctly', () => {
    store.dispatch(fetchOrganizations(ducksFixtures.organizations));

    const props = {
      jurisdictionId: 'outpost-number-one',
      name: 'plan-assignment-form-outpost-number-one',
      planId: 'alpha',
    };

    const wrapper = mount(
      <Provider store={store}>
        <OrganizationSelect {...props} />
      </Provider>
    );

    expect(wrapper.children().props()).toMatchSnapshot('Organization Select ownProps');
    expect(
      wrapper
        .children()
        .children()
        .props()
    ).toMatchSnapshot('Organization Select Props');
    expect(wrapper.find('.reveal__indicator').length).toBe(2);
  });

  it('works with store', () => {
    /** check mapState to props passes expected props to dumb component */

    const { assignments, organizations } = ducksFixtures;
    // fetch organizations dispatch assignments.
    store.dispatch(fetchAssignments(assignments));
    fetch.once(JSON.stringify(organizations));
    const props = {
      jurisdictionId: '',
      planId: 'alpha',
    };

    const wrapper = mount(
      <Provider store={store}>
        <ConnectedOrganizationSelect {...props} />
      </Provider>
    );

    const passedProps: any = wrapper.find('OrganizationSelect').props();
    // assignments
    expect(passedProps.assignments).toEqual(assignments);
    // jurisdictionId
    expect(passedProps.jurisdictionId).toEqual('');
    // organizations
    expect(passedProps.organizations).toEqual(organizations);
    // planId
    expect(passedProps.planId).toEqual('alpha');
  });
});
