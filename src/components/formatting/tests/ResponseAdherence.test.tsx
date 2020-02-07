import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import ResponseAdherence from '../ResponseAdherence';

describe('src/components/formatting/ResponseAdherence', () => {
  it('renders ResponseAdherence correctly', () => {
    const wrapper = mount(<ResponseAdherence />);

    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
