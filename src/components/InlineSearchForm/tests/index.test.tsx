import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import React from 'react';
import InlineSearchForm from '..';

describe('src/components/InlineSearchForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders InlineSearchForm correctly', () => {
    const wrapper = mount(<InlineSearchForm />);

    expect(toJson(wrapper.find('form'))).toMatchSnapshot();

    expect(wrapper.find('input#search').length).toEqual(1);
    expect(wrapper.find('button').length).toEqual(1);
    wrapper.unmount();
  });

  it('calls handleSubmit on click', async () => {
    const handleSubmitMock: any = jest.fn();
    const props = {
      handleSubmit: handleSubmitMock,
    };
    const wrapper = mount(<InlineSearchForm {...props} />);

    expect(wrapper.props()).toEqual({
      handleSubmit: handleSubmitMock,
      inputId: 'search',
      inputPlaceholder: 'Search',
    });

    const searchInput = wrapper.find('input#search');
    expect(searchInput.length).toEqual(1);
    searchInput.simulate('change', { target: { value: 'some value', name: 'searchText' } });

    const form = wrapper.find('form');
    expect(form.length).toEqual(1);

    form.simulate('submit');
    await flushPromises();
    wrapper.update();

    expect(handleSubmitMock).toBeCalledTimes(1);

    wrapper.unmount();
  });
});
