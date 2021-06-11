import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { PageNotFound } from '../PageNotFound';

describe('/components/errors/PageNotFound', () => {
  it('renders without crasshing', () => {
    shallow(<PageNotFound />);
  });

  it('render correctly', () => {
    const wrapper = mount(<PageNotFound />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('h1').text()).toEqual('404');
    expect(wrapper.find('p').text()).toEqual(
      'Oops! The page you are looking for can not be found.'
    );
  });
});
