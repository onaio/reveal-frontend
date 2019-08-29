import { mount, shallow } from 'enzyme';
import tojson from 'enzyme-to-json';
import React from 'react';
import Teamform from '..';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('containers/forms/Teamform', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<Teamform />);
  });

  it('renders correctly', () => {
    // emphasizes on fields showing up
    const wrapper = mount(<Teamform />);

    // identifier field
    expect(wrapper.find('#identifier')).toMatchSnapshot('Team identifier');

    // team name field
    expect(wrapper.find('#name')).toMatchSnapshot('Team name');
  });
});
