import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import ConnectedOrganizationSelect, { OrganizationSelect } from '..';
import store from '../../../../store';
import assignmentReducer, {
  fetchAssignments,
  reducerName as assignmentReducerName,
  resetPlanAssignments,
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

jest.mock('../../../../helpers/errors');

describe('/containers/forms/OrganizationSelect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<OrganizationSelect />);

    mount(
      <Provider store={store}>
        <ConnectedOrganizationSelect jurisdictionId="" name="" planId="" />
      </Provider>
    );
  });

  it('displays errors ', async () => {
    fetch.mockReject(new Error('Request failed'));
    mount(<OrganizationSelect />);
    await new Promise(resolve => setImmediate(resolve));
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
        <ConnectedOrganizationSelect {...props} />
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

  it('works with store', async () => {
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

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    const passedProps: any = wrapper.find('OrganizationSelect').props();
    // assignments
    expect(passedProps.assignments).toEqual(assignments);
    // jurisdictionId
    expect(passedProps.jurisdictionId).toEqual('');
    // organizations
    expect(passedProps.organizations).toEqual(organizations);
    // planId
    expect(passedProps.planId).toEqual('alpha');

    wrapper.unmount();
  });

  it('handleChange works correctly for nominal case', () => {
    const resetPlansAssignmentMock = jest.fn(args => resetPlanAssignments(args));
    const fetchAssignmentMock = jest.fn(args => fetchAssignments(args));

    const props = {
      assignments: ducksFixtures.assignments,
      fetchAssignmentsAction: fetchAssignmentMock,
      jurisdictionId: '',
      organizations: ducksFixtures.organizations,
      planId: 'alpha',
      resetPlanAssignmentsAction: resetPlansAssignmentMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <OrganizationSelect {...props} />
      </Provider>
    );

    // simulate a change; check fetchAssignments is called correctly
    const selectInstance = wrapper.find('Select').instance();
    (selectInstance as any).selectOption({
      label: 'Demo Team',
      value: '4c506c98-d3a9-11e9-bb65-2a2ae2dbcce4',
    });
    wrapper.update();
    const createdAssignment1 = {
      jurisdiction: '',
      organization: '4c506c98-d3a9-11e9-bb65-2a2ae2dbcce4',
      plan: 'alpha',
    };
    // check that that was successfully picked up
    expect(resetPlansAssignmentMock).not.toHaveBeenCalled();
    expect(fetchAssignmentMock).toHaveBeenCalledWith([
      ...ducksFixtures.assignments,
      createdAssignment1,
    ]);

    fetchAssignmentMock.mockClear();

    // select a second option

    (selectInstance as any).selectOption({
      label: 'Takang 1',
      value: 'd23f7350-d406-11e9-bb65-2a2ae2dbcce4',
    });
    wrapper.update();
    // check second option also picked up.
    const createdAssignment2 = {
      jurisdiction: '',
      organization: 'd23f7350-d406-11e9-bb65-2a2ae2dbcce4',
      plan: 'alpha',
    };

    expect(resetPlansAssignmentMock).not.toHaveBeenCalled();
    expect(fetchAssignmentMock).toHaveBeenCalledWith([
      ...ducksFixtures.assignments,
      createdAssignment2,
    ]);

    wrapper.find('Select').simulate('keyDown', { key: 'Backspace', keyCode: 8 });
    wrapper.update();

    expect(resetPlansAssignmentMock).toHaveBeenCalledWith({
      alpha: ducksFixtures.assignments,
    });
  });

  it('renders select options correctly when parent assignments present', () => {
    const { assignments, organizations } = ducksFixtures;
    // fetch organizations dispatch assignments.
    store.dispatch(fetchAssignments(assignments));
    store.dispatch(fetchOrganizations(organizations));

    const props = {
      jurisdictionId: 'outpost-number-one',
      name: 'plan-assignment-form-outpost-number-one',
      parentAssignments: ['tucker', 'caboose'],
      parentIds: ['blue-base'],
      planId: 'alpha',
    };

    const wrapper = mount(
      <Provider store={store}>
        <ConnectedOrganizationSelect {...props} />
      </Provider>
    );

    expect(wrapper.children().props()).toMatchSnapshot(
      'Organization Select ownProps with parent assignments'
    );
    expect(
      wrapper
        .children()
        .children()
        .props()
    ).toMatchSnapshot('Organization Select Props with parent assignments');
    expect(wrapper.find('.reveal__indicator').length).toBe(4);
  });
});
