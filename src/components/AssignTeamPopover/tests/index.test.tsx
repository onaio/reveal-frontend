import { mount, shallow } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import AssignTeamPopover, { AssignTeamPopoverProps } from '..';
import store from '../../../store';
import { Organization } from '../../../store/ducks/opensrp/organizations';

describe('/components/AssignTeamPopover', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mock: any = jest.fn();
  const props: AssignTeamPopoverProps = {
    formName: 'plan-assignment-form-outpost-number-one',
    isActive: true,
    jurisdictionId: 'outpost-number-one',
    onClearAssignmentsButtonClick: mock,
    onSaveAssignmentsButtonClick: mock,
    onToggle: mock,
    organizationsById: null,
    planId: 'alpha',
    target: 'plan-assignment-outpost-number-one',
  };
  const div = document.createElement('div');
  div.setAttribute('id', 'plan-assignment-outpost-number-one');
  document.body.appendChild(div);

  it('renders without crashing', () => {
    shallow(<AssignTeamPopover {...props} />);
  });

  it('renders and passes props correctly', () => {
    const wrapper = mount(<AssignTeamPopover {...props} />);
    expect(wrapper.find('Popover').length).toBe(1);
    expect(wrapper.find('Popover').props()).toMatchSnapshot('popover props');
    expect(wrapper.find('PopoverHeader').text()).toEqual('Select Teams to Assign');
  });

  it('renders correctly when organizationsById is not null', () => {
    const organization: Organization = {
      active: true,
      id: 1,
      identifier: 'id',
      name: 'name',
    };
    const propsOrganizationsById = {
      ...props,
      organizationsById: {
        1: organization,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <AssignTeamPopover {...propsOrganizationsById} />
      </Provider>
    );
    expect(wrapper.find('Form').length).toBe(1);
    expect(wrapper.find('Form').prop('name')).toEqual(props.formName);
    expect(wrapper.find('FormGroup').length).toBe(2);
    expect(wrapper.find('OrganizationSelect').length).toBe(1);
    expect(wrapper.find('OrganizationSelect').props()).toMatchSnapshot('organization select props');
    expect(wrapper.find('Button').length).toBe(2);
    expect(
      wrapper
        .find('Button')
        .at(0)
        .props()
    ).toMatchSnapshot('button clear props');
    expect(
      wrapper
        .find('Button')
        .at(0)
        .text()
    ).toEqual('Clear');
    expect(
      wrapper
        .find('Button')
        .at(1)
        .props()
    ).toMatchSnapshot('button save props');
    expect(
      wrapper
        .find('Button')
        .at(1)
        .text()
    ).toEqual('Save');
  });

  it('renders correctly with parent assignments present', () => {
    const organization: Organization = {
      active: true,
      id: 1,
      identifier: 'id',
      name: 'name',
    };
    const newProps = {
      ...props,
      organizationsById: {
        1: organization,
      },
      parentAssignments: ['tucker', 'caboose'],
      parentIds: ['blue-base'],
    };
    const wrapper = mount(
      <Provider store={store}>
        <AssignTeamPopover {...newProps} />
      </Provider>
    );
    expect(wrapper.find('Popover').length).toBe(1);
    expect(wrapper.find('PopoverHeader').text()).toEqual('Select Teams to Assign');
    expect(wrapper.find('OrganizationSelect').props()).toMatchSnapshot(
      'organization select props with parent assignments'
    );
    // hides cancel button
    expect(wrapper.find('Button').length).toBe(1);
    expect(wrapper.find('Button').text()).toEqual('Save');
  });
});
