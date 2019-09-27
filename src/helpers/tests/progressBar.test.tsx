import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import ProgressBar from '../ProgressBar';

describe('src/helpers/progressBar', () => {
  it('renders without crashing', () => {
    shallow(<ProgressBar />);
  });

  it('renders progressBar without marker as expected', () => {
    const wrapper = mount(<ProgressBar />);
    const markerWrapper = wrapper.find('#marker');
    expect(toJson(markerWrapper)).toMatchSnapshot('marker');
    expect(markerWrapper.length).toEqual(0);
  });

  it('renders markers correctly', () => {
    const props = {
      marker: {
        markAt: '20%',
      },
    };
    const wrapper = mount(<ProgressBar {...props} />);
    const markerWrapper = wrapper.find('#marker');
    expect(markerWrapper.length).toEqual(1);
    expect(toJson(markerWrapper)).toMatchSnapshot('marker');
    expect(markerWrapper.props().style).toEqual({
      backgroundColor: '#F00',
      height: 'inherit',
      left: '20%',
      position: 'absolute',
      width: '5px',
    });
  });
});
