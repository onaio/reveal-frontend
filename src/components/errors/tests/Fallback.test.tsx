import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { Fallback } from '../Fallback';

describe('/components/errors/Fallback', () => {
  it('renders without crasshing', () => {
    shallow(<Fallback />);
  });

  it('render correctly', () => {
    const wrapper = mount(<Fallback />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('h1').text()).toEqual('An Error Ocurred');
    expect(wrapper.find('p').text()).toEqual(
      `There has been an error. It’s been reported to the site administrators via email and should be fixed shortly. Thanks for your patience.`
    );
  });
});
