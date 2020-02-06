import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import NotFound from '..';

describe('src/componenets/NotFound', () => {
  it('renderes NotFound correctly', () => {
    const wrapper = mount(<NotFound />);

    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
