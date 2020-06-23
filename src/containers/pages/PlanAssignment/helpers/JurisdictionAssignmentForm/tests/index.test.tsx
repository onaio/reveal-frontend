import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import MockDate from 'mockdate';
import React from 'react';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { JurisdictionAssignmentForm } from '../index';
import { openSRPJurisdiction } from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

describe('PlanAssignment/JurisdictionAssignmentForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    MockDate.set('12/30/2019', 0);
  });

  it('renders without crashing', () => {
    const props = {
      defaultValue: [{ label: 'Team X', value: 'x' }],
      jurisdiction: openSRPJurisdiction,
      options: [
        { label: 'Team X', value: 'x' },
        { label: 'Team Y', value: 'y' },
      ],
      plan: plans[1],
    };

    const wrapper = mount(<JurisdictionAssignmentForm {...props} />);

    expect(wrapper.find('Form').length).toEqual(1);
    expect(wrapper.find('SelectField').props() as any).toMatchSnapshot({
      form: expect.any(Object),
    });
    expect(toJson(wrapper.find('button'))).toMatchSnapshot('Submit buttons');
    wrapper.unmount();
  });

  it('shows error if no plan or jurisdiction', () => {
    const props = {
      defaultValue: [{ label: 'Team X', value: 'x' }],
      options: [
        { label: 'Team X', value: 'x' },
        { label: 'Team Y', value: 'y' },
      ],
    };

    const wrapper = mount(<JurisdictionAssignmentForm {...props} />);

    expect(toJson(wrapper.find('span'))).toMatchSnapshot('no plan or jurisdiction');
    wrapper.unmount();
  });

  it('form works as expected', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const cancelMock: any = jest.fn();
    const submitMock: any = jest.fn();

    const props = {
      cancelCallBackFunc: cancelMock,
      defaultValue: [{ label: 'Team X', value: 'x' }],
      jurisdiction: openSRPJurisdiction,
      options: [
        { label: 'Team X', value: 'x' },
        { label: 'Team Y', value: 'y' },
      ],
      plan: plans[1],
      submitMock,
    };

    const wrapper = mount(<JurisdictionAssignmentForm {...props} />);

    wrapper.find('button.cancel').simulate('click');
    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();
    expect(cancelMock).toHaveBeenCalledTimes(1);

    // wrapper.find('form').simulate('submit');
    // await new Promise<any>(resolve => setImmediate(resolve));
    // wrapper.update();
    // expect(submitMock).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });
});
