import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { values } from 'lodash';
import React from 'react';
import IRSIndicatorLegend, { generateRangeStrings } from '..';
import {
  indicatorThresholdsIRS,
  indicatorThresholdsIRSNamibia,
  indicatorThresholdsLookUpIRS,
} from '../../../../configs/settings';

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

  it('generateRangeStrings works correctly nominal case', () => {
    const sampleThresholds = indicatorThresholdsIRS;

    const indicatorItems = values(sampleThresholds);
    const response = generateRangeStrings(indicatorItems);
    expect(response).toEqual([
      { color: '#dddddd', name: 'Grey', text: '< 20%', value: 0.2 },
      { color: '#FF4136', name: 'Red', orEquals: true, text: '20% - 75%', value: 0.75 },
      { color: '#FFDC00', name: 'Yellow', text: '75% >-< 90%', value: 0.9 },
      { color: '#2ECC40', name: 'Green', orEquals: true, text: '90% - 100%', value: 1 },
    ]);
  });

  it('renders correctly for namibia indicator colors with namibia indicatorThresholds', () => {
    const wrapper = mount(
      <IRSIndicatorLegend
        indicatorRows={namibiaIndicatorRows}
        indicatorThresholds={indicatorThresholdsIRSNamibia}
      />
    );
    expect(wrapper.props()).toEqual({
      indicatorRows: namibiaIndicatorRows,
      indicatorThresholds: indicatorThresholdsIRSNamibia,
      indicatorThresholdsLookUp: indicatorThresholdsLookUpIRS,
    });
    expect(toJson(wrapper.find('.card-header'))).toMatchSnapshot('header');
    expect(toJson(wrapper.find('Table'))).toMatchSnapshot('indicator table namibia');
    expect(wrapper.find('Table tbody tr').length).toEqual(
      Object.keys(indicatorThresholdsIRSNamibia).length
    );
  });
});
