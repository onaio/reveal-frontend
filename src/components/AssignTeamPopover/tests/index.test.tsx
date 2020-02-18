import { mount, shallow } from 'enzyme';
import EnzymeToJson from 'enzyme-to-json';
import React from 'react';
import AssignTeamPopover, { AssignTeamPopoverProps } from '..';

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

  it('renders without crashing', () => {
    shallow(<AssignTeamPopover {...props} />);
  });

  it('renders and passes props correctly', () => {
    const div = document.createElement('div');
    div.setAttribute('id', 'plan-assignment-outpost-number-one');
    document.body.appendChild(div);
    const wrapper = mount(<AssignTeamPopover {...props} />);
    expect(wrapper.props()).toEqual(props);
    const tree = EnzymeToJson(wrapper.find('Popover'));
    expect(tree).toMatchSnapshot();
  });
});
