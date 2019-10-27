import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import IRSIndicatorLegend from '..';
import { indicatorThresholdsIRS } from '../../../../configs/settings';

describe('/components/formatting/IRSIndicatorLegend', () => {
  it('renders correctly', () => {
    const wrapper = mount(<IRSIndicatorLegend />);
    expect(wrapper.props()).toEqual({ indicatorThresholds: indicatorThresholdsIRS });
    expect(toJson(wrapper.find('.card-header'))).toMatchSnapshot('header');
    expect(toJson(wrapper.find('Table'))).toMatchSnapshot('indicator table');
    wrapper.unmount();
  });
});
