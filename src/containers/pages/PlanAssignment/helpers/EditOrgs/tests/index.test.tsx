import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import React from 'react';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { defaultAssignmentProps } from '../../JurisdictionAssignmentForm';
import { assignment4, openSRPJurisdiction } from '../../JurisdictionAssignmentForm/tests/fixtures';
import { EditOrgs } from '../index';

describe('PlanAssignment/EditOrgs', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('works as expected', async () => {
    const submitMock: any = jest.fn();
    const growlMock: any = jest.fn();

    const props = {
      defaultValue: [{ label: 'Team X', value: 'x' }],
      existingAssignments: [assignment4],
      jurisdiction: openSRPJurisdiction,
      options: [
        { label: 'Team X', value: 'x' },
        { label: 'Team Y', value: 'y' },
      ],
      plan: plans[1],
      submitCallBackFunc: submitMock,
      successNotifierBackFunc: growlMock,
    };

    const wrapper = mount(<EditOrgs {...props} />);

    // initially there is just a button JurisdictionAssignmentForm
    expect(toJson(wrapper.find('button.show-form'))).toMatchSnapshot('Show form button');
    expect(wrapper.find('JurisdictionAssignmentForm').length).toEqual(0);

    // we can click the button to show the form
    (wrapper.find('button.show-form').props() as any).onClick();
    await flushPromises();
    wrapper.update();

    // now there is no show form button, but there is a form
    // note that there are other buttons, from the form
    expect(wrapper.find('button.show-form').length).toEqual(0);
    expect(wrapper.find('JurisdictionAssignmentForm').length).toEqual(1);
    expect(wrapper.find('JurisdictionAssignmentForm').props()).toEqual({
      ...props,
      assignTeamsLabel: 'Assign Teams',
      cancelCallBackFunc: expect.any(Function),
      labels: defaultAssignmentProps.labels,
    });

    // we can click the close button form to go back to before
    (wrapper.find('button.cancel').props() as any).onClick();
    await flushPromises();
    wrapper.update();

    // voila
    expect(wrapper.find('button.show-form').length).toEqual(1);
    expect(wrapper.find('JurisdictionAssignmentForm').length).toEqual(0);

    wrapper.unmount();
  });
});
