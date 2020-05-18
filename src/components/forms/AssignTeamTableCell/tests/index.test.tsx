import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { Provider } from 'react-redux';
import AssignTeamTableCell from '..';
import store from '../../../../store';
import assignmentReducer, {
  fetchAssignments,
  reducerName as assignmentReducerName,
} from '../../../../store/ducks/opensrp/assignments';
import organizationsReducer, {
  fetchOrganizations,
  reducerName as organizationsReducerName,
} from '../../../../store/ducks/opensrp/organizations';
import * as fixtures from '../../../../store/ducks/tests/fixtures';
import { AssignTeamPopoverProps } from '../../../AssignTeamPopover';

jest.mock('../../../../configs/env');

reducerRegistry.register(assignmentReducerName, assignmentReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);

describe('/containers/forms/AssignTeamTableCell', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<AssignTeamTableCell />);
  });

  it('renders correctly', () => {
    const props = {
      assignPopover: <div id="custom-popover" />,
      jurisdictionId: 'outpost-number-one',
      planId: 'alpha',
    };

    const wrapper = mount(
      <Provider store={store}>
        <AssignTeamTableCell {...props} />
      </Provider>
    );
    expect(toJson(wrapper.find('button#plan-assignment-outpost-number-one'))).toMatchSnapshot(
      'AssignTeamButton'
    );
    expect(toJson(wrapper.find('span.assignment-label'))).toMatchSnapshot('Team Count Text');

    store.dispatch(fetchAssignments(fixtures.assignments));
    wrapper.update();
    expect(toJson(wrapper.find('span.assignment-label'))).toMatchSnapshot('Updated teams');
  });

  it('should toggle teamPopOver correctly', () => {
    const btnId = 'plan-assignment-outpost-number-one';
    const div = document.createElement('div');
    div.setAttribute('id', btnId);
    document.body.appendChild(div);

    store.dispatch(fetchOrganizations(fixtures.organizations));
    store.dispatch(fetchAssignments(fixtures.assignments));

    const props = {
      jurisdictionId: 'outpost-number-one',
      planId: 'alpha',
    };
    const wrapper = mount(
      <Provider store={store}>
        <AssignTeamTableCell {...props} />
      </Provider>
    );

    expect(wrapper.find('AssignTeamPopover').length).toEqual(1);

    let assignTeamPopoverProps = wrapper
      .find('AssignTeamPopover')
      .props() as AssignTeamPopoverProps;
    expect(assignTeamPopoverProps.isActive).toBeFalsy();

    // toggles assignTeamPopover
    wrapper.find(`button#${btnId}`).simulate('click');
    assignTeamPopoverProps = wrapper.find('AssignTeamPopover').props() as AssignTeamPopoverProps;
    expect(assignTeamPopoverProps.isActive).toBeTruthy();

    // save button
    expect(
      wrapper
        .find('Button')
        .at(2)
        .text()
    ).toEqual('Save');
    wrapper
      .find('Button')
      .at(2)
      .simulate('click');
    assignTeamPopoverProps = wrapper.find('AssignTeamPopover').props() as AssignTeamPopoverProps;
    expect(assignTeamPopoverProps.isActive).toBeFalsy();

    // open assignTeamPopover
    wrapper.find(`button#${btnId}`).simulate('click');

    // clear button
    expect(
      wrapper
        .find('Button')
        .at(1)
        .text()
    ).toEqual('Clear');
    wrapper
      .find('Button')
      .at(1)
      .simulate('click');
    assignTeamPopoverProps = wrapper.find('AssignTeamPopover').props() as AssignTeamPopoverProps;
    expect(assignTeamPopoverProps.isActive).toBeFalsy();
  });

  it('renders correctly with parent assignments', () => {
    store.dispatch(fetchOrganizations(fixtures.organizations));
    store.dispatch(fetchAssignments(fixtures.assignments));
    const props = {
      assignPopover: <div id="custom-popover" />,
      jurisdictionId: 'outpost-number-one',
      parentIds: ['blue-base'],
      planId: 'alpha',
    };

    const wrapper = mount(
      <Provider store={store}>
        <AssignTeamTableCell {...props} />
      </Provider>
    );

    expect(toJson(wrapper.find('button#plan-assignment-outpost-number-one'))).toMatchSnapshot(
      'AssignTeamButton for outpost-number-one assignment'
    );

    expect(toJson(wrapper.find('span.assignment-label'))).toMatchSnapshot(
      'Team Count Text with parent assignments'
    );

    store.dispatch(fetchAssignments(fixtures.assignments));
    wrapper.update();
    expect(toJson(wrapper.find('span.assignment-label'))).toMatchSnapshot(
      'Updated teams with parent assignments'
    );
  });
});
