import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { TimelineSlider, TimelineSliderProps } from '..';

describe('src/components/TimeLineSlider', () => {
  it('works correctly', () => {
    const props: TimelineSliderProps = {
      keyOfCurrentStop: '1',
      stops: [
        {
          keys: '1',
          labelBelowStop: 'AUTO_TARGET_JURISDICTIONS_BY_RISK',
          labelInStop: '1',
        },
        {
          keys: ['2', '3'],
          labelBelowStop: 'REFINE_SELECTED_JURISDICTIONS',
          labelInStop: '2',
        },
      ],
    };
    const wrapper = mount(<TimelineSlider {...props} />);
    expect(wrapper.text()).toMatchInlineSnapshot(
      `"AUTO_TARGET_JURISDICTIONS_BY_RISKREFINE_SELECTED_JURISDICTIONS"`
    );
    wrapper.find('li').forEach(li => {
      expect(toJson(li)).toMatchSnapshot();
    });
  });
  it('adds correct classNames ', () => {
    const props: TimelineSliderProps = {
      keyOfCurrentStop: '3',
      stops: [
        {
          keys: '1',
          labelBelowStop: 'AUTO_TARGET_JURISDICTIONS_BY_RISK',
          labelInStop: '1',
        },
        {
          keys: ['2', '3'],
          labelBelowStop: 'REFINE_SELECTED_JURISDICTIONS',
          labelInStop: '2',
        },
      ],
    };
    const wrapper = mount(<TimelineSlider {...props} />);
    wrapper.find('li').forEach(li => {
      expect(toJson(li)).toMatchSnapshot();
    });
  });
  it('edge case: key is not part of any stop ', () => {
    const props: TimelineSliderProps = {
      keyOfCurrentStop: 'wierdStuff',
      stops: [
        {
          keys: '1',
          labelBelowStop: 'AUTO_TARGET_JURISDICTIONS_BY_RISK',
          labelInStop: '1',
        },
        {
          keys: ['2', '3'],
          labelBelowStop: 'REFINE_SELECTED_JURISDICTIONS',
          labelInStop: '2',
        },
      ],
    };
    const wrapper = mount(<TimelineSlider {...props} />);
    wrapper.find('li').forEach(li => {
      expect(toJson(li)).toMatchSnapshot();
    });
  });
});
