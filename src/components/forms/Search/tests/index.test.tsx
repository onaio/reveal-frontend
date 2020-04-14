import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { SearchForm } from '../../Search';

describe('src/components/SearchForm', () => {
  it('renders correctly', () => {
    const props = {
      handleSearchChange: jest.fn(),
    };
    const wrapper = mount(<SearchForm {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
