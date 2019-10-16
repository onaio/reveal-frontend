import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import AssignTeamPopover, { AssignTeamPopoverProps } from '..';

describe('/components/AssignTeamPopover', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
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
    shallow(<AssignTeamPopover {...props} />);
  });
});
