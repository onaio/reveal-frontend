import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import Home from '../Home';

describe('containers/pages/Home', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<Home />);
  });

  it('renders Home correctly', () => {
    const wrapper = mount(<Home />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
