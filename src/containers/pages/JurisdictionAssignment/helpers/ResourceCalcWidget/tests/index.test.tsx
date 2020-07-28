import { mount, shallow } from 'enzyme';
import React from 'react';
import { computeEstimate, ResourceCalculation } from '..';

describe('jurisdiction Assignment/Resource calculation', () => {
  it('renders without crashing', () => {
    const props = {
      structuresCount: undefined,
      jurisdictionName: undefined,
    };
    shallow(<ResourceCalculation {...props} />);
  });

  it('renders correctly', () => {
    const props = {
      structuresCount: 908,
      jurisdictionName: 'Akros',
    };
    const wrapper = mount(<ResourceCalculation {...props} />);

    expect(wrapper.find('h3.section-title').text()).toMatchInlineSnapshot();

    expect(wrapper.find('form').text()).toMatchInlineSnapshot();
  });

  it('computes the time estimates correctly', () => {
    // need to compute for nominal case
    // fraction days
    // division by zero error
    const res = computeEstimate(545, 3);
  });

  it('uses user values to compute time estimates correctly', () => {
    // 2 cases:
    // - there is data.
    // user backspaces such that there is no data
  });

  it('user values has an error', () => {
    // what happens when the user wants to be funny.
  });
});
