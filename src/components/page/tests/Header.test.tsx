import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import Header from '../Header';

describe('components/page/Header', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<Header />);
  });

  it('renders header correctly', () => {
    const wrapper = mount(<Header />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
