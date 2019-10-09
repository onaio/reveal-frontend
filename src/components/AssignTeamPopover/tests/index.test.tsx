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

  // todo - fix this test!!!
  // it('renders correctly', () => {
  //   const mock: any = jest.fn();
  //   const props:AssignTeamPopoverProps = {
  //     formName: 'plan-assignment-form-outpost-number-one',
  //     isActive: true,
  //     jurisdictionId: 'outpost-number-one',
  //     onClearAssignmentsButtonClick: mock,
  //     onSaveAssignmentsButtonClick: mock,
  //     onToggle: mock,
  //     organizationsById: null,
  //     planId: 'alpha',
  //     target: 'plan-assignment-outpost-number-one',
  //   }

  //   // attempted fix from https://github.com/reactstrap/reactstrap/issues/773#issuecomment-373451256
  //   var div = document.createElement('div');
  //   document.body.appendChild(div);

  //   // this is breaking on mount because the underlying Popover component can't find the button
  //   const wrapper = mount((
  //     <div>
  //       <button id="plan-assignment-outpost-number-one">Target Button</button>
  //       <AssignTeamPopover {...props} />
  //     </div>
  //   ), { attachTo: div });
  // })
});
