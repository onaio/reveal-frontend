import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import MockDate from 'mockdate';
import React from 'react';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { JurisdictionAssignmentForm } from '../index';
import { openSRPJurisdiction } from './fixtures';

/* tslint:disable-next-line no-var-requires */
// const fetch = require('jest-fetch-mock');

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
});
