import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { computeEstimate, ResourceCalculation } from '..';

describe('jurisdiction Assignment/Resource calculation', () => {
  it('renders without crashing', () => {
    shallow(<ResourceCalculation />);
  });

  it('renders correctly', () => {
    const props = {
      jurisdictionName: 'Akros',
      structuresCount: 908,
    };
    const wrapper = mount(<ResourceCalculation {...props} />);

    expect(wrapper.find('h3.section-title').text()).toMatchInlineSnapshot(
      `"Resource Estimate for Akros"`
    );

    expect(wrapper.find('form').text()).toMatchInlineSnapshot(
      `"0 daysat a rate of   structures per team per day with  Teams"`
    );
  });

  it('computes the time estimates correctly', () => {
    // need to compute for nominal case
    let res = computeEstimate(30, 10, 3);
    expect(res).toEqual(1);

    // fraction days
    res = computeEstimate(31, 10, 3);
    expect(res).toEqual(2);

    // division by zero error
    res = computeEstimate(3, 0, 2);
    expect(res).toEqual(0);
    res = computeEstimate(3, 10, 0);
    expect(res).toEqual(0);
  });

  it('uses user values to compute time estimates correctly', () => {
    // 2 cases:
    // - there is data.
    // user backspaces such that there is no data
    const props = {
      jurisdictionName: 'Akros1',
      structuresCount: 30,
    };
    const wrapper = mount(<ResourceCalculation {...props} />);

    // simulate structure count change so that we can have 10 structures per team
    expect(toJson(wrapper.find('input[name="structuresCount"]'))).toMatchSnapshot(
      'structures count input'
    );
    wrapper
      .find('input[name="structuresCount"]')
      .simulate('change', { target: { value: 10, name: 'structuresCount' } });
    wrapper.update();

    // see if there has been any change to the number of days, should start with 0 days
    expect(wrapper.find('form p').text()).toMatchInlineSnapshot(
      `"0 daysat a rate of   structures per team per day with  Teams"`
    );

    // simulate teams count change so that we have 3 teams
    expect(toJson(wrapper.find('input[name="teamsCount"]'))).toMatchSnapshot(
      'structures count input'
    );
    wrapper
      .find('input[name="teamsCount"]')
      .simulate('change', { target: { value: 3, name: 'teamsCount' } });
    wrapper.update();

    // see if there has been any change to the number of days, should start with 1 days
    expect(wrapper.find('form p').text()).toMatchInlineSnapshot(
      `"1 daysat a rate of   structures per team per day with  Teams"`
    );

    // backspace teams so that we have no data, value would be ""
    wrapper
      .find('input[name="teamsCount"]')
      .simulate('change', { target: { value: '', name: 'teamsCount' } });
    wrapper.update();

    // see if there has been any change to the number of days, should start with 1 days
    expect(wrapper.find('form p').text()).toMatchInlineSnapshot(
      `"0 daysat a rate of   structures per team per day with  Teams"`
    );
  });
});
