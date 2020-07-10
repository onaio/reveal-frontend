import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { ErrorPage } from '..';

describe('src/components/pages/errorPage', () => {
  it('renders correctly', () => {
    const wrapper = mount(<ErrorPage />);
    expect(toJson(wrapper)).toMatchSnapshot('default props');
  });
  it('renders correctly with props', () => {
    const props = {
      errorMessage: 'Something is about to hit the fan',
    };
    const wrapper = mount(<ErrorPage {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot('default props');
  });
});
