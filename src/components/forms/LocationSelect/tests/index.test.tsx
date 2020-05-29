import { mount, shallow } from 'enzyme';
import React from 'react';
import { LocationSelect } from '..';

describe('components/forms/LocationSelect', () => {
  it('renders without crashing', () => {
    shallow(<LocationSelect />);
    mount(<LocationSelect />);
  });
});
