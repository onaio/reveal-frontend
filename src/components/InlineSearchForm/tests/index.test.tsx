import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import InlineSearchForm from '..';

describe('src/components/InlineSearchForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders InlineSearchForm correctly', () => {
    const wrapper = mount(<InlineSearchForm />);

    expect(toJson(wrapper)).toMatchSnapshot();

    expect(wrapper.find('input#search').length).toEqual(1);
    expect(wrapper.find('button').length).toEqual(1);
    wrapper.unmount();
  });

  it('calls handleSubmit on click', () => {
    const handleSubmitMock: any = jest.fn();
    const props = {
      handleSubmit: handleSubmitMock,
    };
    const wrapper = mount(<InlineSearchForm {...props} />);

    const form = wrapper.find('Form');
    expect(form.length).toEqual(1);

    expect(wrapper.props()).toEqual({
      handleSubmit: handleSubmitMock,
      inputId: 'search',
      inputPlaceholder: 'Search',
    });
    form.simulate('submit');
    wrapper.update();
    expect(handleSubmitMock).toBeCalledTimes(1);

    wrapper.unmount();
  });
});
