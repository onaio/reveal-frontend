import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { SearchForm } from '../../Search';

const history = createBrowserHistory();

describe('src/components/SearchForm', () => {
  it('renders correctly', () => {
    const props = {
      handleSearchChange: jest.fn(),
      history,
    };
    const wrapper = mount(<SearchForm {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('handles submit correctly', () => {
    jest.spyOn(history, 'push');
    const props = {
      handleSearchChange: jest.fn(),
      history,
    };
    const wrapper = mount(<SearchForm {...props} />);
    wrapper.find('Input').simulate('change', { target: { value: 'test' } });
    wrapper.find('Form').simulate('submit');
    expect(history.push).toBeCalledWith({ search: '?search=test' });
    wrapper.unmount();
  });

  it('displays placeholder correctly', () => {
    const props = {
      handleSearchChange: jest.fn(),
      history,
      placeholder: 'Search me',
    };
    const wrapper = mount(<SearchForm {...props} />);
    expect(wrapper.find('Input').prop('placeholder')).toEqual('Search me');
    wrapper.unmount();
  });
});
