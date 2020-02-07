import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import IRSIndicatorLegend from '..';
import { indicatorThresholdsIRS, indicatorThresholdsLookUpIRS } from '../../../../configs/settings';

const zambiaIndicatorRows = 'zambia2019';
const namibiaIndicatorRows = 'namibia2019';

describe('/components/formatting/IRSIndicatorLegend', () => {
  it('renders correctly for default indicator colors', () => {
    const wrapper = mount(<IRSIndicatorLegend indicatorRows={zambiaIndicatorRows} />);
    expect(wrapper.props()).toEqual({
      indicatorRows: zambiaIndicatorRows,
      indicatorThresholds: indicatorThresholdsIRS,
      indicatorThresholdsLookUp: indicatorThresholdsLookUpIRS,
    });
    expect(toJson(wrapper.find('.card-header'))).toMatchSnapshot('header');
    expect(toJson(wrapper.find('Table'))).toMatchSnapshot('indicator table');
    wrapper.unmount();
  });

  it('renders correctly for namibia indicator colors', () => {
    const wrapper = mount(<IRSIndicatorLegend indicatorRows={namibiaIndicatorRows} />);
    expect(wrapper.props()).toEqual({
      indicatorRows: namibiaIndicatorRows,
      indicatorThresholds: indicatorThresholdsIRS,
      indicatorThresholdsLookUp: indicatorThresholdsLookUpIRS,
    });
    expect(toJson(wrapper.find('.card-header'))).toMatchSnapshot('header');
    expect(toJson(wrapper.find('Table'))).toMatchSnapshot('indicator table namibia');
    wrapper.unmount();
  });
});
